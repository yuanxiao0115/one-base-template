<script setup lang="ts">
import { Download, Lock, Plus, Rank, Unlock, Upload } from '@element-plus/icons-vue';
import { dragHandleClass } from './utils/dragSort';
import UserSearchForm from './components/UserSearchForm.vue';
import UserEditForm from './components/UserEditForm.vue';
import UserAccountForm from './components/UserAccountForm.vue';
import UserBindAccountForm from './components/UserBindAccountForm.vue';
import { userFormRules } from './form';
import { useUserCrudState } from './composables/useUserCrudState';
import { useUserDialogState } from './composables/useUserDialogState';

defineOptions({
  name: 'UserManagementPage'
});

// 页面仅保留编排层：状态与副作用分别下沉到 CRUD 状态与弹窗状态 composable。
const pageState = useUserCrudState();

const { refs } = pageState;

const {
  loading,
  dataList,
  tablePagination,
  tableColumns,
  orgTreeData,
  searchForm,
  defaultTreeProps
} = pageState.table;

const { positionOptions, roleOptions } = pageState.options;

const {
  crud,
  crudVisible,
  crudMode,
  crudTitle,
  crudReadonly,
  crudSubmitting,
  crudForm,
  checkFieldUnique,
  uploadAvatar
} = pageState.editor;

const {
  handleSelectionChange,
  handleSizeChange,
  handleCurrentChange,
  tableSearch,
  onKeywordUpdate,
  onResetSearch,
  handleNodeClick,
  getUserTypeLabel,
  handleDelete,
  handleSingleStatus,
  handleBatchStatus,
  handleResetPassword,
  downloadTemplate,
  importRequest,
  handleImportUploaded,
  onSearch
} = pageState.actions;

const {
  refs: dialogRefs,
  dialogs: userDialogs,
  actions: dialogActions
} = useUserDialogState({
  onSearch
});

const {
  accountVisible,
  accountSubmitting,
  accountForm,
  bindVisible,
  bindLoading,
  bindSubmitting,
  bindSelectedUsers,
  bindForm
} = userDialogs;

const {
  openAccountDialog,
  closeAccountDialog,
  submitAccountDialog,
  fetchBindUsers,
  openBindDialog,
  closeBindDialog,
  submitBindDialog
} = dialogActions;

function getGenderLabel(gender?: number) {
  if (gender === 0) {
    return '女';
  }
  if (gender === 1) {
    return '男';
  }
  return '--';
}

function getStatusLabel(isEnable?: boolean) {
  if (isEnable === true) {
    return '启用';
  }
  if (isEnable === false) {
    return '停用';
  }
  return '--';
}

function getStatusTagType(isEnable?: boolean) {
  if (isEnable === true) {
    return 'success';
  }
  if (isEnable === false) {
    return 'danger';
  }
  return 'info';
}
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden" left-width="216px">
    <template #left>
      <div class="user-management-page__tree">
        <ObTree
          :ref="refs.treeRef"
          node-key="id"
          :data="orgTreeData"
          :tree-props="defaultTreeProps"
          highlight-current
          @node-click="handleNodeClick"
        />
      </div>
    </template>

    <ObTableBox
      title="用户管理"
      :columns="tableColumns"
      placeholder="请输入用户名查询"
      :keyword="searchForm.nickName"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
      <template #buttons>
        <el-button :icon="Download" @click="downloadTemplate">模板下载</el-button>

        <ObImportUpload
          :request="importRequest"
          :disabled="loading"
          :button-icon="Upload"
          button-text="导入"
          @uploaded="handleImportUploaded"
        />

        <el-button :icon="Unlock" @click="handleBatchStatus(true)">批量启用</el-button>
        <el-button :icon="Lock" @click="handleBatchStatus(false)">批量停用</el-button>
        <el-button type="primary" :icon="Plus" @click="crud.openCreate()">新增</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObVxeTable
          :ref="refs.tableRef"
          :loading
          :size
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="tablePagination"
          row-key="id"
          @selection-change="handleSelectionChange"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #dragHandle>
            <el-icon :class="dragHandleClass"><Rank /></el-icon>
          </template>

          <template #nickName="{ row }">
            <div class="user-management-page__name-cell">
              <span>{{ row.nickName }}</span>
              <el-tag v-if="row.isExternal" size="small" type="warning">外部</el-tag>
            </div>
          </template>

          <template #gender="{ row }"> {{ getGenderLabel(row.gender) }} </template>

          <template #status="{ row }">
            <el-tag :type="getStatusTagType(row.isEnable)">{{
              getStatusLabel(row.isEnable)
            }}</el-tag>
          </template>

          <template #userType="{ row }"> {{ getUserTypeLabel(Number(row.userType)) }} </template>

          <template #operation="{ row, size: actionSize }">
            <div class="user-management-page__actions">
              <ObActionButtons>
                <el-button link type="primary" :size="actionSize" @click="crud.openEdit(row)"
                  >编辑</el-button
                >
                <el-button link type="primary" :size="actionSize" @click="crud.openDetail(row)"
                  >查看</el-button
                >
                <el-button link type="primary" :size="actionSize" @click="handleSingleStatus(row)">
                  {{ row.isEnable ? '停用' : '启用' }}
                </el-button>
                <el-button link type="primary" :size="actionSize" @click="openAccountDialog(row)"
                  >修改账号</el-button
                >
                <el-button link type="primary" :size="actionSize" @click="handleResetPassword(row)"
                  >重置密码</el-button
                >
                <el-button
                  v-if="Number(row.userType) === 1"
                  link
                  type="primary"
                  :size="actionSize"
                  @click="openBindDialog(row)"
                >
                  关联账号
                </el-button>
                <el-button link type="danger" :size="actionSize" @click="handleDelete(row)"
                  >删除</el-button
                >
              </ObActionButtons>
            </div>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer> <UserSearchForm :ref="refs.searchRef" v-model="searchForm" /> </template>
    </ObTableBox>
  </ObPageContainer>

  <ObCrudContainer
    v-model="crudVisible"
    container="drawer"
    :mode="crudMode"
    :title="crudTitle"
    :loading="crudSubmitting"
    :show-cancel-button="!crudReadonly"
    confirm-text="保存"
    :drawer-size="920"
    @confirm="crud.confirm"
    @cancel="crud.close"
    @close="crud.close"
  >
    <UserEditForm
      :ref="refs.editFormRef"
      v-model="crudForm"
      :mode="crudMode"
      :rules="userFormRules"
      :disabled="crudReadonly"
      :org-tree-options="orgTreeData"
      :position-options
      :role-options
      :check-unique="checkFieldUnique"
      :upload-avatar
    />
  </ObCrudContainer>

  <ObCrudContainer
    v-model="accountVisible"
    container="drawer"
    mode="edit"
    title="登录账号"
    :loading="accountSubmitting"
    :drawer-size="420"
    @confirm="submitAccountDialog"
    @cancel="closeAccountDialog"
    @close="closeAccountDialog"
  >
    <UserAccountForm
      :ref="dialogRefs.accountFormRef"
      v-model="accountForm"
      :disabled="false"
      :check-user-account-unique="checkFieldUnique"
    />
  </ObCrudContainer>

  <ObCrudContainer
    v-model="bindVisible"
    container="drawer"
    mode="edit"
    title="关联账号"
    :loading="bindSubmitting || bindLoading"
    :drawer-size="680"
    @confirm="submitBindDialog"
    @cancel="closeBindDialog"
    @close="closeBindDialog"
  >
    <UserBindAccountForm
      :ref="dialogRefs.bindFormRef"
      v-model="bindForm"
      :disabled="bindLoading"
      :initial-selected-users="bindSelectedUsers"
      :fetch-users="fetchBindUsers"
    />
  </ObCrudContainer>
</template>

<style scoped>
.user-management-page__tree {
  height: 100%;
  border-right: 1px solid var(--el-border-color-light);
  overflow: auto;
  padding-right: 16px;
}

.user-management-page__tree :deep(.ob-tree) {
  min-height: 100%;
  padding: 16px 12px;
}

.user-management-page__tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  color: var(--one-color-primary);
  background: var(--one-color-primary-light-100);
}

.user-management-page__tree :deep(.el-tree-node__content) {
  min-height: 32px;
  line-height: 32px;
}

.user-management-page__name-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.user-management-page__actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.user-drag-handle {
  color: var(--el-text-color-secondary);
  cursor: move;
}

.user-drag-handle:hover {
  color: var(--el-text-color-primary);
}
</style>
