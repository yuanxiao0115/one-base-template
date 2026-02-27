<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { OneTableBar } from '@/components/OneTableBar'
import { useTable } from '@/hooks/table'
import { confirm } from '@/infra/confirm'
import { PageContainer, VxeTable as ObVxeTable } from '@one-base-template/ui'
import type { TableColumnList } from '@one-base-template/ui'
import { menuColumns } from '../menu-management/columns'
import {
  menuPermissionApi,
  type MenuPermissionRecord,
  type PermissionSavePayload,
  type PermissionTypeOption
} from '../menu-management/api'

defineOptions({
  name: 'DemoMenuManagementMigrationPage'
})

type DialogMode = 'add' | 'edit' | 'view'

type ParentOption = {
  value: string
  label: string
  disabled?: boolean
}

type MenuPermissionForm = {
  id?: string
  parentId: string
  resourceType: number
  resourceName: string
  permissionCode: string
  icon: string
  image: string
  url: string
  openMode: number
  redirect: string
  routeCache: number
  sort: number
  hidden: number
  component: string
  remark: string
}

const tableRef = ref<unknown>(null)
const searchRef = ref<FormInstance>()
const editFormRef = ref<FormInstance>()

const searchForm = reactive({
  resourceName: '',
  resourceType: ''
})

const resourceTypeOptions = ref<PermissionTypeOption[]>([])
const parentOptions = ref<ParentOption[]>([])

const dialogVisible = ref(false)
const dialogMode = ref<DialogMode>('add')
const submitting = ref(false)

const defaultFormState: MenuPermissionForm = {
  parentId: '0',
  resourceType: 1,
  resourceName: '',
  permissionCode: '',
  icon: '',
  image: '',
  url: '',
  openMode: 0,
  redirect: '',
  routeCache: 0,
  sort: 10,
  hidden: 0,
  component: '',
  remark: ''
}

const editForm = reactive<MenuPermissionForm>({ ...defaultFormState })

const formRules: FormRules<MenuPermissionForm> = {
  parentId: [{ required: true, message: '请选择上级权限', trigger: 'change' }],
  resourceType: [{ required: true, message: '请选择权限类型', trigger: 'change' }],
  resourceName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }]
}

const inTreeMode = computed(() => !searchForm.resourceName.trim() && !searchForm.resourceType)
const tableColumns = computed<TableColumnList>(() => menuColumns)
const tableTreeConfig = computed<Record<string, unknown> | undefined>(() => {
  if (!inTreeMode.value) return undefined

  return {
    transform: false,
    expandAll: true,
    childrenField: 'children'
  }
})

const isViewMode = computed(() => dialogMode.value === 'view')
const dialogTitle = computed(() => {
  if (dialogMode.value === 'add') return '新增权限'
  if (dialogMode.value === 'edit') return '编辑权限'
  return '查看权限'
})

const tableOpt = reactive({
  searchApi: async () => {
    if (inTreeMode.value) {
      return menuPermissionApi.getPermissionTree()
    }

    return menuPermissionApi.getPermissionList({
      resourceName: searchForm.resourceName,
      resourceType: searchForm.resourceType
    })
  },
  searchForm,
  paginationFlag: false
})

const { loading, dataList, onSearch, resetForm } = useTable(tableOpt, tableRef)

function normalizeFormState() {
  Object.assign(editForm, { ...defaultFormState })
  editForm.id = undefined
}

function fillFormState(row: MenuPermissionRecord) {
  Object.assign(editForm, {
    id: row.id,
    parentId: row.parentId || '0',
    resourceType: Number(row.resourceType || 1),
    resourceName: row.resourceName || '',
    permissionCode: row.permissionCode || '',
    icon: row.icon || '',
    image: row.image || '',
    url: row.url || '',
    openMode: Number(row.openMode || 0),
    redirect: row.redirect || '',
    routeCache: Number(row.routeCache || 0),
    sort: Number(row.sort || 10),
    hidden: Number(row.hidden || 0),
    component: row.component || '',
    remark: row.remark || ''
  })
}

function appendParentOptions(
  rows: MenuPermissionRecord[],
  depth: number,
  disabledIds: Set<string>,
  result: ParentOption[]
) {
  rows.forEach((row) => {
    result.push({
      value: row.id,
      label: `${'--'.repeat(depth)}${depth > 0 ? ' ' : ''}${row.resourceName}`,
      disabled: disabledIds.has(row.id)
    })

    if (Array.isArray(row.children) && row.children.length > 0) {
      appendParentOptions(row.children, depth + 1, disabledIds, result)
    }
  })
}

function markDescendants(rows: MenuPermissionRecord[], targetId: string, ids: Set<string>): boolean {
  for (const row of rows) {
    if (row.id === targetId) {
      ids.add(row.id)
      markNodeChildren(row, ids)
      return true
    }

    if (Array.isArray(row.children) && row.children.length > 0) {
      const found = markDescendants(row.children, targetId, ids)
      if (found) return true
    }
  }

  return false
}

function markNodeChildren(row: MenuPermissionRecord, ids: Set<string>) {
  if (!Array.isArray(row.children) || row.children.length === 0) return

  row.children.forEach((child) => {
    ids.add(child.id)
    markNodeChildren(child, ids)
  })
}

async function loadParentOptions(disabledId?: string) {
  const response = await menuPermissionApi.getPermissionTree()
  if (response.code !== 200) {
    throw new Error(response.message || '获取权限树失败')
  }

  const treeRows = Array.isArray(response.data) ? response.data : []
  const disabledIds = new Set<string>()
  if (disabledId) {
    markDescendants(treeRows, disabledId, disabledIds)
  }

  const options: ParentOption[] = [{ value: '0', label: '顶级权限' }]
  appendParentOptions(treeRows, 0, disabledIds, options)
  parentOptions.value = options
}

function toPayload(): PermissionSavePayload {
  return {
    id: editForm.id,
    parentId: editForm.parentId || '0',
    resourceType: Number(editForm.resourceType || 1),
    resourceName: editForm.resourceName.trim(),
    permissionCode: editForm.permissionCode.trim(),
    icon: editForm.icon.trim(),
    image: editForm.image.trim(),
    url: editForm.url.trim(),
    openMode: Number(editForm.openMode || 0),
    redirect: editForm.redirect.trim(),
    routeCache: Number(editForm.routeCache || 0),
    sort: Number(editForm.sort || 10),
    hidden: Number(editForm.hidden || 0),
    component: editForm.component.trim(),
    remark: editForm.remark.trim()
  }
}

function tableSearch(keyword: string) {
  searchForm.resourceName = keyword
  void onSearch()
}

function onKeywordUpdate(keyword: string) {
  searchForm.resourceName = keyword
}

function onResetSearch() {
  resetForm(searchRef, 'resourceName')
}

async function openCreateDialog(parentId: string = '0') {
  dialogMode.value = 'add'
  normalizeFormState()
  editForm.parentId = parentId

  try {
    await loadParentOptions()
    dialogVisible.value = true
  } catch (error) {
    const message = error instanceof Error ? error.message : '打开新增弹窗失败'
    ElMessage.error(message)
  }
}

async function openEditDialog(mode: Extract<DialogMode, 'edit' | 'view'>, row: MenuPermissionRecord) {
  dialogMode.value = mode
  fillFormState(row)

  try {
    await loadParentOptions(row.id)
    dialogVisible.value = true
  } catch (error) {
    const message = error instanceof Error ? error.message : '打开弹窗失败'
    ElMessage.error(message)
  }
}

function handleCreateCommand(command: string, row: MenuPermissionRecord) {
  const parentId = command === 'child' ? row.id : row.parentId || '0'
  void openCreateDialog(parentId)
}

async function handleDelete(row: MenuPermissionRecord) {
  try {
    await confirm.warn(
      `是否确认删除权限「${row.resourceName}」？若存在下级权限会一并删除。`,
      '删除确认'
    )

    const response = await menuPermissionApi.deletePermission(row.id)
    if (response.code !== 200) {
      throw new Error(response.message || '删除失败')
    }

    ElMessage.success('删除成功')
    await onSearch(false)
  } catch (error) {
    if (error === 'cancel') return
    const message = error instanceof Error ? error.message : '删除失败'
    ElMessage.error(message)
  }
}

async function onSubmitDialog() {
  if (isViewMode.value) {
    dialogVisible.value = false
    return
  }

  try {
    const valid = await editFormRef.value?.validate()
    if (!valid) return

    submitting.value = true
    const payload = toPayload()
    const response =
      dialogMode.value === 'add'
        ? await menuPermissionApi.addPermission(payload)
        : await menuPermissionApi.editPermission(payload)

    if (response.code !== 200) {
      throw new Error(response.message || '保存失败')
    }

    ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '更新成功')
    dialogVisible.value = false
    await onSearch(false)
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存失败'
    ElMessage.error(message)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const response = await menuPermissionApi.getResourceTypeEnum()
    if (response.code === 200 && Array.isArray(response.data)) {
      resourceTypeOptions.value = response.data
      return
    }

    resourceTypeOptions.value = []
  } catch {
    resourceTypeOptions.value = []
  }
})
</script>

<template>
  <div class="demo-menu-management-page">
    <PageContainer padding="0" overflow="hidden">
      <OneTableBar
        title="权限管理"
        :columns="tableColumns"
        placeholder="请输入权限名称搜索"
        :keyword="searchForm.resourceName"
        @search="tableSearch"
        @update:keyword="onKeywordUpdate"
        @reset-form="onResetSearch"
      >
        <template #buttons>
          <el-button type="primary" :icon="Plus" @click="openCreateDialog('0')">添加权限</el-button>
        </template>

        <template #default="{ size, dynamicColumns }">
          <ObVxeTable
            ref="tableRef"
            :size="size"
            :loading="loading"
            :data="dataList"
            :columns="dynamicColumns"
            :pagination="false"
            row-key="id"
            :tree-config="tableTreeConfig"
          >
            <template #icon="{ row }">
              <span class="demo-menu-management-page__icon-cell">{{ row.icon || '--' }}</span>
            </template>

            <template #operation="{ row }">
              <div class="demo-menu-management-page__actions">
                <el-dropdown
                  v-if="Number(row.resourceType) !== 3"
                  @command="command => handleCreateCommand(String(command), row)"
                >
                  <el-button link type="primary" :size="size">新建</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="child">新建子级权限</el-dropdown-item>
                      <el-dropdown-item command="sibling">新建平级权限</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>

                <el-button link type="primary" :size="size" @click="openEditDialog('edit', row)">编辑</el-button>
                <el-button link type="primary" :size="size" @click="openEditDialog('view', row)">查看</el-button>
                <el-button link type="danger" :size="size" @click="handleDelete(row)">删除</el-button>
              </div>
            </template>
          </ObVxeTable>
        </template>

        <template #drawer>
          <el-form ref="searchRef" label-position="top" :model="searchForm" class="demo-menu-management-page__drawer">
            <el-form-item label="权限类型" prop="resourceType">
              <el-select v-model="searchForm.resourceType" clearable placeholder="请选择权限类型" class="w-full">
                <el-option
                  v-for="item in resourceTypeOptions"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </template>
      </OneTableBar>
    </PageContainer>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="760" destroy-on-close>
      <el-form ref="editFormRef" :model="editForm" :rules="formRules" label-width="96px" :disabled="isViewMode">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="上级权限" prop="parentId">
              <el-select v-model="editForm.parentId" class="w-full" placeholder="请选择上级权限">
                <el-option
                  v-for="item in parentOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  :disabled="item.disabled"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="权限类型" prop="resourceType">
              <el-select v-model="editForm.resourceType" class="w-full" placeholder="请选择权限类型">
                <el-option
                  v-for="item in resourceTypeOptions"
                  :key="item.key"
                  :label="item.value"
                  :value="Number(item.key)"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="权限名称" prop="resourceName">
              <el-input v-model.trim="editForm.resourceName" maxlength="30" show-word-limit placeholder="请输入权限名称" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="权限标识" prop="permissionCode">
              <el-input v-model.trim="editForm.permissionCode" placeholder="例如：system:permission:list" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="访问路径" prop="url">
              <el-input v-model.trim="editForm.url" placeholder="例如：/system/permission" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="组件路径" prop="component">
              <el-input v-model.trim="editForm.component" placeholder="例如：system/permission/index" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="图标" prop="icon">
              <el-input v-model.trim="editForm.icon" placeholder="例如：i-icon-menu" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="跳转地址" prop="redirect">
              <el-input v-model.trim="editForm.redirect" placeholder="可选" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="editForm.sort" class="w-full" :min="0" :max="9999" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="状态" prop="hidden">
              <el-select v-model="editForm.hidden" class="w-full">
                <el-option label="显示" :value="0" />
                <el-option label="隐藏" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="缓存路由" prop="routeCache">
              <el-select v-model="editForm.routeCache" class="w-full">
                <el-option label="否" :value="0" />
                <el-option label="是" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="打开方式" prop="openMode">
              <el-select v-model="editForm.openMode" class="w-full">
                <el-option label="内部" :value="0" />
                <el-option label="外部" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="图片地址" prop="image">
              <el-input v-model.trim="editForm.image" placeholder="可选" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model.trim="editForm.remark"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
                placeholder="可选"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="demo-menu-management-page__dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="onSubmitDialog">
            {{ isViewMode ? '我知道了' : '保存' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.demo-menu-management-page {
  height: 100%;
}

.demo-menu-management-page__actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.demo-menu-management-page__icon-cell {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.demo-menu-management-page__drawer {
  width: 100%;
}

.demo-menu-management-page__dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
