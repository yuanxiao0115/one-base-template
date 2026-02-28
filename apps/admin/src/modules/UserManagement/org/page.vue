<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAuthStore } from '@one-base-template/core'
import {
  CrudContainer as ObCrudContainer,
  PageContainer,
  VxeTable as ObVxeTable
} from '@one-base-template/ui'
import { orgColumns } from './columns'
import OrgSearchForm from './components/OrgSearchForm.vue'
import OrgEditForm from './components/OrgEditForm.vue'
import OrgManagerDialog from './components/OrgManagerDialog.vue'
import OrgLevelManageDialog from './components/OrgLevelManageDialog.vue'
import {
  orgApi,
  type DictItem,
  type OrgLevelItem,
  type OrgRecord,
  type OrgSavePayload
} from './api'
import {
  defaultOrgForm,
  orgFormRules,
  toOrgForm,
  toOrgPayload,
  type OrgForm,
  type OrgTreeOption
} from './form'

defineOptions({
  name: 'OrgManagementPage'
})

type AuthUserWithCompanyId = {
  companyId?: string | number | null
}

const authStore = useAuthStore()

const tableRef = ref<unknown>(null)
const searchRef = ref<{ resetFields?: () => void }>()
const editFormRef = ref()

const searchForm = reactive({
  orgName: ''
})

const createParentId = ref('0')
const CACHE_EXPIRE_TIME = 5 * 60 * 1000

type TreeCacheEntry = {
  data: OrgRecord[]
  timestamp: number
}

const treeChildrenCache = new Map<string, TreeCacheEntry>()
const deletingRow = ref<OrgRecord | null>(null)

const orgTreeOptions = ref<OrgTreeOption[]>([])
const orgCategoryOptions = ref<DictItem[]>([])
const institutionalTypeOptions = ref<DictItem[]>([])
const orgLevelOptions = ref<OrgLevelItem[]>([])

const orgManagerVisible = ref(false)
const orgManagerTarget = ref<OrgRecord | null>(null)
const orgLevelDialogVisible = ref(false)

const inSearchMode = computed(() => Boolean(searchForm.orgName.trim()))
const tableColumns = computed(() => orgColumns)

const rootParentId = computed(() => {
  const user = authStore.user as AuthUserWithCompanyId | null
  const companyId = user?.companyId

  if (typeof companyId === 'number' && Number.isFinite(companyId)) {
    return String(companyId)
  }

  if (typeof companyId === 'string' && companyId.trim()) {
    return companyId.trim()
  }

  return '0'
})

const treeConfig = computed<Record<string, unknown> | undefined>(() => {
  if (inSearchMode.value) return undefined

  return {
    lazy: true,
    trigger: 'cell',
    reserve: true,
    hasChildField: 'hasChildren',
    childrenField: 'children',
    loadMethod: loadTreeChildren
  }
})

const tableOpt = reactive({
  searchApi: async () => {
    const parentId = rootParentId.value
    if (inSearchMode.value) {
      return orgApi.searchOrgList({
        parentId,
        orgName: searchForm.orgName
      })
    }

    return orgApi.getOrgTree({ parentId })
  },
  searchForm,
  paginationFlag: false,
  deleteApi: (payload: { id: string }) => orgApi.deleteOrg(payload),
  deletePayloadBuilder: (input: string | number | OrgRecord) => {
    if (typeof input === 'string' || typeof input === 'number') {
      return { id: String(input) }
    }
    return { id: input.id }
  },
  onDeleteSuccess: () => {
    message.success('删除组织成功')
    void refreshAfterDelete()
  },
  onDeleteError: (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : '删除组织失败'
    message.error(errorMessage)
  }
})

const {
  loading,
  dataList,
  onSearch,
  deleteRow,
  resetForm
} = useTable(tableOpt, tableRef)

const crud = useCrudContainer<OrgForm, OrgRecord, OrgRecord, OrgSavePayload>({
  entityName: '组织',
  createForm: () => ({
    ...defaultOrgForm,
    parentId: rootParentId.value
  }),
  formRef: editFormRef,
  async beforeOpen({ mode, row, form }) {
    await Promise.all([loadDictOptions(), loadOrgLevelOptions()])
    await loadOrgTreeOptions(mode === 'create' ? undefined : row?.id)

    if (mode === 'create') {
      form.parentId = createParentId.value || rootParentId.value
    }
  },
  loadDetail: async ({ row }) => row,
  mapDetailToForm: ({ detail }) => toOrgForm(detail),
  beforeSubmit: async ({ form }) => {
    const payload = toOrgPayload(form, rootParentId.value)

    const uniqueResponse = await orgApi.checkUnique({
      orgName: payload.orgName,
      parentId: payload.parentId,
      orgId: payload.id
    })

    if (uniqueResponse.code !== 200) {
      throw new Error(uniqueResponse.message || '组织名称校验失败')
    }

    if (!uniqueResponse.data) {
      throw new Error('已存在相同组织名称')
    }

    return payload
  },
  submit: async ({ mode, payload }) => {
    const response = mode === 'create'
      ? await orgApi.addOrg(payload)
      : await orgApi.updateOrg(payload)

    if (response.code !== 200) {
      throw new Error(response.message || '保存组织失败')
    }

    return response
  },
  onSuccess: async ({ mode }) => {
    message.success(mode === 'create' ? '新增组织成功' : '更新组织成功')
    await refreshTable()
  }
})

const crudVisible = crud.visible
const crudMode = crud.mode
const crudTitle = crud.title
const crudReadonly = crud.readonly
const crudSubmitting = crud.submitting
const crudForm = crud.form

const orgCategoryLabelMap = computed(() => buildLabelMap(orgCategoryOptions.value))
const institutionalTypeLabelMap = computed(() => buildLabelMap(institutionalTypeOptions.value))

function buildLabelMap(items: DictItem[]): Record<string, string> {
  return Object.fromEntries(
    (items || []).map((item) => [String(item.itemValue || ''), item.itemName || ''])
  )
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

function clearTreeCache() {
  treeChildrenCache.clear()
}

function isCacheExpired(cache: TreeCacheEntry): boolean {
  return Date.now() - cache.timestamp > CACHE_EXPIRE_TIME
}

function getCacheRows(parentId: string): OrgRecord[] | null {
  const cache = treeChildrenCache.get(parentId)
  if (!cache) return null

  if (isCacheExpired(cache)) {
    treeChildrenCache.delete(parentId)
    return null
  }

  return cache.data
}

function saveCacheRows(parentId: string, rows: OrgRecord[]) {
  treeChildrenCache.set(parentId, {
    data: rows,
    timestamp: Date.now()
  })
}

async function refreshTable() {
  clearTreeCache()
  await onSearch(false)
}

async function refreshAfterDelete() {
  const row = deletingRow.value
  deletingRow.value = null

  if (!row || inSearchMode.value) {
    await refreshTable()
    return
  }

  treeChildrenCache.delete(String(row.id || ''))
  treeChildrenCache.delete(String(row.parentId || ''))
  await onSearch(false)
}

function sortRows(rows: OrgRecord[]): OrgRecord[] {
  return [...rows].sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
}

function toTreeOptions(rows: OrgRecord[]): OrgTreeOption[] {
  return sortRows(rows).map((row) => ({
    value: row.id,
    label: row.orgName,
    children: Array.isArray(row.children) ? toTreeOptions(row.children) : undefined
  }))
}

function collectDisabledIds(rows: OrgRecord[], targetId: string, ids: Set<string>): boolean {
  for (const row of rows) {
    if (row.id === targetId) {
      ids.add(row.id)
      markChildIds(row, ids)
      return true
    }

    if (Array.isArray(row.children) && row.children.length > 0) {
      const found = collectDisabledIds(row.children, targetId, ids)
      if (found) return true
    }
  }

  return false
}

function markChildIds(row: OrgRecord, ids: Set<string>) {
  if (!Array.isArray(row.children) || row.children.length === 0) return

  row.children.forEach((child) => {
    ids.add(child.id)
    markChildIds(child, ids)
  })
}

function applyDisabled(options: OrgTreeOption[], ids: Set<string>): OrgTreeOption[] {
  return options.map((item) => ({
    ...item,
    disabled: ids.has(item.value),
    children: Array.isArray(item.children) ? applyDisabled(item.children, ids) : undefined
  }))
}

function hasOptionValue(options: OrgTreeOption[], targetValue: string): boolean {
  for (const item of options) {
    if (item.value === targetValue) return true
    if (Array.isArray(item.children) && item.children.length > 0) {
      const found = hasOptionValue(item.children, targetValue)
      if (found) return true
    }
  }

  return false
}

async function loadOrgTreeOptions(disabledId?: string) {
  const response = await orgApi.queryAllOrgTree()
  if (response.code !== 200) {
    throw new Error(response.message || '加载组织树失败')
  }

  const rows = Array.isArray(response.data) ? response.data : []
  const disabledIds = new Set<string>()

  if (disabledId) {
    collectDisabledIds(rows, disabledId, disabledIds)
  }

  let options = applyDisabled(toTreeOptions(rows), disabledIds)

  if (!hasOptionValue(options, rootParentId.value)) {
    options = [
      {
        value: rootParentId.value,
        label: '顶级组织',
        children: options
      }
    ]
  }

  orgTreeOptions.value = options
}

async function loadDictOptions() {
  const [orgCategoryRes, institutionalTypeRes] = await Promise.all([
    orgApi.dictDataList({ dictCode: 'org_category' }),
    orgApi.dictDataList({ dictCode: 'institutional_type' })
  ])

  if (orgCategoryRes.code !== 200) {
    throw new Error(orgCategoryRes.message || '加载组织类型失败')
  }

  if (institutionalTypeRes.code !== 200) {
    throw new Error(institutionalTypeRes.message || '加载机构类别失败')
  }

  orgCategoryOptions.value = Array.isArray(orgCategoryRes.data) ? orgCategoryRes.data : []
  institutionalTypeOptions.value = Array.isArray(institutionalTypeRes.data)
    ? institutionalTypeRes.data
    : []
}

async function loadOrgLevelOptions() {
  const response = await orgApi.getOrgLevelList()
  if (response.code !== 200) {
    throw new Error(response.message || '加载等级列表失败')
  }

  orgLevelOptions.value = Array.isArray(response.data) ? response.data : []
}

async function loadTreeChildren(params: { row: OrgRecord }) {
  if (inSearchMode.value) return []

  const parentId = String(params.row.id)
  const cacheRows = getCacheRows(parentId)
  if (cacheRows) {
    return cacheRows
  }

  try {
    const response = await orgApi.getOrgTree({ parentId })
    if (response.code !== 200) {
      throw new Error(response.message || '加载下级组织失败')
    }

    const rows = Array.isArray(response.data) ? response.data : []
    if (!rows.length) {
      params.row.hasChildren = false
    }

    saveCacheRows(parentId, rows)
    return rows
  } catch (error) {
    message.error(getErrorMessage(error, '加载下级组织失败'))
    return []
  }
}

function tableSearch(keyword: string) {
  searchForm.orgName = keyword
  clearTreeCache()
  void onSearch()
}

function onKeywordUpdate(keyword: string) {
  searchForm.orgName = keyword
}

function onResetSearch() {
  clearTreeCache()
  resetForm(searchRef, 'orgName')
}

async function openCreateRoot() {
  createParentId.value = rootParentId.value
  await crud.openCreate()
}

async function openCreateChild(row: OrgRecord) {
  createParentId.value = row.id
  await crud.openCreate()
}

async function handleDelete(row: OrgRecord) {
  try {
    await ElMessageBox.prompt(
      `此操作不可逆，请输入组织名称「${row.orgName}」确认删除`,
      '删除确认',
      {
        inputPlaceholder: '请输入组织名称',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        inputValidator: (value) => {
          const text = (value || '').trim()
          if (!text) return '请输入组织名称'
          if (text !== row.orgName) return '输入的组织名称与目标不一致'
          return true
        }
      }
    )

    deletingRow.value = row
    await deleteRow(row)
  } catch (error) {
    deletingRow.value = null
    if (error === 'cancel' || error === 'close') return
  }
}

async function checkOrgNameUnique(params: { orgName: string; parentId?: string; orgId?: string }) {
  const response = await orgApi.checkUnique({
    orgName: params.orgName,
    parentId: params.parentId || rootParentId.value,
    orgId: params.orgId
  })

  if (response.code !== 200) {
    throw new Error(response.message || '组织名称校验失败')
  }

  return Boolean(response.data)
}

function openManagerDialog(row: OrgRecord) {
  orgManagerTarget.value = row
  orgManagerVisible.value = true
}

function openLevelManageDialog() {
  orgLevelDialogVisible.value = true
}

function handleOrgManagerUpdated() {
  void refreshTable()
}

function handleOrgLevelUpdated() {
  void loadOrgLevelOptions()
}

onMounted(async () => {
  try {
    await Promise.all([loadDictOptions(), loadOrgLevelOptions()])
  } catch (error) {
    message.error(getErrorMessage(error, '初始化组织管理配置失败'))
  }

  await onSearch(false)
})
</script>

<template>
  <PageContainer padding="0" overflow="hidden">
    <OneTableBar
      title="组织管理"
      :columns="tableColumns"
      placeholder="请输入组织名称搜索"
      :keyword="searchForm.orgName"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
      <template #buttons>
        <el-button @click="openLevelManageDialog">等级管理</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreateRoot">新增</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObVxeTable
          ref="tableRef"
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="false"
          :tree-config="treeConfig"
          row-key="id"
        >
          <template #orgName="{ row }">
            <div class="org-management-page__name-cell">
              <el-tag size="small" type="info">{{ Number(row.orgType) === 1 ? '单位' : '部门' }}</el-tag>
              <span>{{ row.orgName }}</span>
              <el-tag v-if="row.isExternal" size="small" type="warning">外部</el-tag>
            </div>
          </template>

          <template #orgCategory="{ row }">
            {{ orgCategoryLabelMap[String(row.orgCategory)] || '--' }}
          </template>

          <template #institutionalType="{ row }">
            {{ institutionalTypeLabelMap[String(row.institutionalType)] || '--' }}
          </template>

          <template #operation="{ row, size: actionSize }">
            <div class="org-management-page__actions">
              <el-button link type="primary" :size="actionSize" @click="crud.openDetail(row)">查看</el-button>
              <el-button link type="primary" :size="actionSize" @click="crud.openEdit(row)">编辑</el-button>
              <el-button link type="danger" :size="actionSize" @click="handleDelete(row)">删除</el-button>
              <el-dropdown placement="bottom-end">
                <el-button link type="primary" :size="actionSize">...</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="openCreateChild(row)">新增下级组织</el-dropdown-item>
                    <el-dropdown-item @click="openManagerDialog(row)">创建组织管理员</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <OrgSearchForm ref="searchRef" v-model="searchForm" />
      </template>
    </OneTableBar>
  </PageContainer>

  <ObCrudContainer
    v-model="crudVisible"
    container="drawer"
    :mode="crudMode"
    :title="crudTitle"
    :loading="crudSubmitting"
    :show-cancel-button="!crudReadonly"
    :confirm-text="'保存'"
    :drawer-size="760"
    :drawer-columns="2"
    @confirm="crud.confirm"
    @cancel="crud.close"
    @close="crud.close"
  >
    <OrgEditForm
      ref="editFormRef"
      v-model="crudForm"
      :rules="orgFormRules"
      :disabled="crudReadonly"
      :org-tree-options="orgTreeOptions"
      :org-category-options="orgCategoryOptions"
      :institutional-type-options="institutionalTypeOptions"
      :org-level-options="orgLevelOptions"
      :root-parent-id="rootParentId"
      :check-org-name-unique="checkOrgNameUnique"
    />
  </ObCrudContainer>

  <OrgManagerDialog
    v-model="orgManagerVisible"
    :org-id="orgManagerTarget?.id || ''"
    :org-name="orgManagerTarget?.orgName || ''"
    @success="handleOrgManagerUpdated"
  />

  <OrgLevelManageDialog
    v-model="orgLevelDialogVisible"
    @updated="handleOrgLevelUpdated"
  />
</template>

<style scoped>
.org-management-page__name-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.org-management-page__actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
</style>
