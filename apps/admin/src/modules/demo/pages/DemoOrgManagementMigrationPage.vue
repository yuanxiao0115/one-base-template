<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { OneTableBar } from '@/components/OneTableBar'
import { PageContainer, VxeTable as ObVxeTable } from '@one-base-template/ui'
import type { TableColumnList } from '@one-base-template/ui'
import { orgColumns } from '../org-management/columns'
import {
  orgCategoryLabelMap,
  orgDemoApi,
  orgTypeLabelMap,
  institutionalTypeLabelMap,
  type OrgRecord,
  type OrgSavePayload
} from '../org-management/api'

defineOptions({
  name: 'DemoOrgManagementMigrationPage'
})

const tableRef = ref<unknown>(null)
const loading = ref(false)
const dataList = ref<OrgRecord[]>([])
const detailVisible = ref(false)
const detailData = ref<OrgRecord | null>(null)
const searchForm = reactive({
  orgName: ''
})

const treeChildrenCache = new Map<string, OrgRecord[]>()

const inSearchMode = computed(() => Boolean(searchForm.orgName.trim()))
const tableColumns = computed<TableColumnList>(() => orgColumns)

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

function clearTreeCache() {
  treeChildrenCache.clear()
}

async function fetchRootRows() {
  loading.value = true

  try {
    const response = inSearchMode.value
      ? await orgDemoApi.searchOrgList({ orgName: searchForm.orgName })
      : await orgDemoApi.getOrgTree({ parentId: '0' })

    if (response.code === 200) {
      dataList.value = Array.isArray(response.data) ? response.data : []
      return
    }

    throw new Error(response.message || '获取组织数据失败')
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取组织数据失败'
    ElMessage.error(message)
    dataList.value = []
  } finally {
    loading.value = false
  }
}

async function loadTreeChildren(params: { row: OrgRecord }) {
  if (inSearchMode.value) return []

  const parentId = String(params.row.id)
  if (treeChildrenCache.has(parentId)) {
    return treeChildrenCache.get(parentId) || []
  }

  const response = await orgDemoApi.getOrgTree({ parentId })
  if (response.code !== 200) {
    throw new Error(response.message || '加载下级组织失败')
  }

  const rows = Array.isArray(response.data) ? response.data : []
  treeChildrenCache.set(parentId, rows)
  return rows
}

async function tableSearch(keyword: string) {
  searchForm.orgName = keyword
  clearTreeCache()
  await fetchRootRows()
}

function onKeywordUpdate(keyword: string) {
  searchForm.orgName = keyword
}

async function onResetSearch() {
  searchForm.orgName = ''
  clearTreeCache()
  await fetchRootRows()
}

function handleView(row: OrgRecord) {
  detailData.value = row
  detailVisible.value = true
}

async function refreshAfterMutation() {
  clearTreeCache()
  await fetchRootRows()
}

async function createOrg(payload: OrgSavePayload) {
  const response = await orgDemoApi.addOrg(payload)
  if (response.code !== 200) {
    throw new Error(response.message || '新增组织失败')
  }

  ElMessage.success('新增组织成功')
  await refreshAfterMutation()
}

async function updateOrg(payload: OrgSavePayload) {
  const response = await orgDemoApi.editOrg(payload)
  if (response.code !== 200) {
    throw new Error(response.message || '更新组织失败')
  }

  ElMessage.success('更新组织成功')
  await refreshAfterMutation()
}

async function handleCreateRoot() {
  try {
    const promptResult = await ElMessageBox.prompt('请输入组织名称', '新增组织', {
      inputPlaceholder: '例如：数字化建设部',
      inputPattern: /\S+/,
      inputErrorMessage: '组织名称不能为空',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })

    if (typeof promptResult === 'string') return

    await createOrg({
      parentId: '0',
      orgName: promptResult.value.trim()
    })
  } catch (error) {
    if (error === 'cancel') return
    const message = error instanceof Error ? error.message : '新增组织失败'
    ElMessage.error(message)
  }
}

async function handleCreateChild(row: OrgRecord) {
  try {
    const promptResult = await ElMessageBox.prompt(`请输入「${row.orgName}」的下级组织名称`, '新增下级组织', {
      inputPlaceholder: '例如：平台研发室',
      inputPattern: /\S+/,
      inputErrorMessage: '组织名称不能为空',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })

    if (typeof promptResult === 'string') return

    await createOrg({
      parentId: row.id,
      orgName: promptResult.value.trim()
    })
  } catch (error) {
    if (error === 'cancel') return
    const message = error instanceof Error ? error.message : '新增下级组织失败'
    ElMessage.error(message)
  }
}

async function handleEdit(row: OrgRecord) {
  try {
    const promptResult = await ElMessageBox.prompt('请更新组织名称', '编辑组织', {
      inputValue: row.orgName,
      inputPattern: /\S+/,
      inputErrorMessage: '组织名称不能为空',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })

    if (typeof promptResult === 'string') return

    await updateOrg({
      id: row.id,
      orgName: promptResult.value.trim(),
      briefName: row.briefName,
      parentId: row.parentId,
      orgCategory: row.orgCategory,
      institutionalType: row.institutionalType,
      orgLevelName: row.orgLevelName,
      uscc: row.uscc,
      sort: row.sort,
      orgType: row.orgType,
      isExternal: row.isExternal
    })
  } catch (error) {
    if (error === 'cancel') return
    const message = error instanceof Error ? error.message : '更新组织失败'
    ElMessage.error(message)
  }
}

async function handleDelete(row: OrgRecord) {
  try {
    await ElMessageBox.confirm(
      `确认删除组织「${row.orgName}」吗？若存在下级组织将禁止删除。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }
    )

    const response = await orgDemoApi.deleteOrg({ id: row.id })
    if (response.code !== 200) {
      throw new Error(response.message || '删除组织失败')
    }

    ElMessage.success('删除组织成功')
    await refreshAfterMutation()
  } catch (error) {
    if (error === 'cancel') return
    const message = error instanceof Error ? error.message : '删除组织失败'
    ElMessage.error(message)
  }
}

onMounted(() => {
  void fetchRootRows()
})
</script>

<template>
  <div class="demo-org-management-page">
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
          <el-button type="primary" :icon="Plus" @click="handleCreateRoot">新增</el-button>
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
              <div class="demo-org-management-page__name-cell">
                <el-tag size="small" type="info">{{ orgTypeLabelMap[String(row.orgType)] || '组织' }}</el-tag>
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

            <template #operation="{ row }">
              <div class="demo-org-management-page__actions">
                <el-button link type="primary" :size="size" @click="handleView(row)">查看</el-button>
                <el-button link type="primary" :size="size" @click="handleEdit(row)">编辑</el-button>
                <el-button link type="primary" :size="size" @click="handleCreateChild(row)">新增下级</el-button>
                <el-button link type="danger" :size="size" @click="handleDelete(row)">删除</el-button>
              </div>
            </template>
          </ObVxeTable>
        </template>
      </OneTableBar>
    </PageContainer>

    <el-drawer v-model="detailVisible" title="组织详情" :size="520" append-to-body>
      <el-descriptions v-if="detailData" :column="1" border>
        <el-descriptions-item label="组织全称">{{ detailData.orgName }}</el-descriptions-item>
        <el-descriptions-item label="组织简称">{{ detailData.briefName || '--' }}</el-descriptions-item>
        <el-descriptions-item label="组织类型">
          {{ orgCategoryLabelMap[String(detailData.orgCategory)] || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="机构类别">
          {{ institutionalTypeLabelMap[String(detailData.institutionalType)] || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="等级">{{ detailData.orgLevelName || '--' }}</el-descriptions-item>
        <el-descriptions-item label="统一社会信用代码">{{ detailData.uscc || '--' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime || '--' }}</el-descriptions-item>
      </el-descriptions>
      <el-empty v-else description="暂无详情" />
    </el-drawer>
  </div>
</template>

<style scoped>
.demo-org-management-page {
  height: 100%;
}

.demo-org-management-page__name-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.demo-org-management-page__actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
