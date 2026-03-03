<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import OrgSearchForm from './components/OrgSearchForm.vue'
import OrgEditForm from './components/OrgEditForm.vue'
import OrgManagerDialog from './components/OrgManagerDialog.vue'
import OrgLevelManageDialog from './components/OrgLevelManageDialog.vue'
import { orgFormRules } from './form'
import { useOrgPageState } from './composables/useOrgPageState'

defineOptions({
  name: 'OrgManagementPage'
})

// 页面仅保留编排层：组织管理查询、CRUD 与树数据加载逻辑统一下沉到 composable。
const pageState = useOrgPageState()

const refs = pageState.refs

const {
  loading,
  dataList,
  treeConfig,
  tableColumns,
  searchForm,
  orgCategoryLabelMap,
  institutionalTypeLabelMap
} = pageState.table

const {
  crud,
  crudVisible,
  crudMode,
  crudTitle,
  crudReadonly,
  crudSubmitting,
  crudForm,
  checkOrgNameUnique
} = pageState.editor

const {
  orgTreeOptions,
  orgCategoryOptions,
  institutionalTypeOptions,
  orgLevelOptions,
  rootParentId
} = pageState.options

const {
  orgManagerVisible,
  orgManagerTarget,
  orgLevelDialogVisible
} = pageState.dialogs

const {
  tableSearch,
  onKeywordUpdate,
  onResetSearch,
  openLevelManageDialog,
  openCreateRoot,
  openCreateChild,
  openManagerDialog,
  handleDelete,
  handleOrgManagerUpdated,
  handleOrgLevelUpdated
} = pageState.actions
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
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
          :ref="refs.tableRef"
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
              <ObActionButtons>
                <el-button link type="primary" :size="actionSize" @click="crud.openDetail(row)">查看</el-button>
                <el-button link type="primary" :size="actionSize" @click="crud.openEdit(row)">编辑</el-button>
                <el-button link type="primary" :size="actionSize" @click="openCreateChild(row)">新增下级组织</el-button>
                <el-button link type="primary" :size="actionSize" @click="openManagerDialog(row)">创建组织管理员</el-button>
                <el-button link type="danger" :size="actionSize" @click="handleDelete(row)">删除</el-button>
              </ObActionButtons>
            </div>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <OrgSearchForm :ref="refs.searchRef" v-model="searchForm" />
      </template>
    </ObTableBox>
  </ObPageContainer>

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
      :ref="refs.editFormRef"
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
