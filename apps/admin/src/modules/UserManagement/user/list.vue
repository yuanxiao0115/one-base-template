<script setup lang="ts">
import { reactive } from 'vue';
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

const { refs, actions } = pageState;
const table = reactive(pageState.table);
const options = reactive(pageState.options);
const editor = reactive(pageState.editor);

const dialogState = useUserDialogState({
  onSearch: actions.onSearch
});

const { refs: dialogRefs, actions: dialogActions } = dialogState;
const dialogs = reactive(dialogState.dialogs);

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
          :data="table.orgTreeData"
          :tree-props="table.defaultTreeProps"
          highlight-current
          @node-click="actions.handleNodeClick"
        />
      </div>
    </template>

    <ObTableBox
      title="用户管理"
      :columns="table.tableColumns"
      placeholder="请输入用户名查询"
      :keyword="table.searchForm.nickName"
      @search="actions.tableSearch"
      @update:keyword="actions.onKeywordUpdate"
      @reset-form="actions.onResetSearch"
    >
      <template #buttons>
        <el-button :icon="Download" @click="actions.downloadTemplate">模板下载</el-button>

        <ObImportUpload
          :request="actions.importRequest"
          :disabled="table.loading"
          :button-icon="Upload"
          button-text="导入"
          @uploaded="actions.handleImportUploaded"
        />

        <el-button :icon="Unlock" @click="actions.handleBatchStatus(true)">批量启用</el-button>
        <el-button :icon="Lock" @click="actions.handleBatchStatus(false)">批量停用</el-button>
        <el-button type="primary" :icon="Plus" @click="editor.crud.openCreate()">新增</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObVxeTable
          :ref="refs.tableRef"
          :loading="table.loading"
          :size
          :data="table.dataList"
          :columns="dynamicColumns"
          :pagination="table.tablePagination"
          row-key="id"
          @selection-change="actions.handleSelectionChange"
          @page-size-change="actions.handleSizeChange"
          @page-current-change="actions.handleCurrentChange"
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

          <template #userType="{ row }">
            {{ actions.getUserTypeLabel(Number(row.userType)) }}
          </template>

          <template #operation="{ row, size: actionSize }">
            <div class="user-management-page__actions">
              <ObActionButtons>
                <el-button
                  link
                  type="primary"
                  :size="actionSize"
                  @click="editor.crud.openEdit(row)"
                >
                  编辑
                </el-button>
                <el-button
                  link
                  type="primary"
                  :size="actionSize"
                  @click="editor.crud.openDetail(row)"
                >
                  查看
                </el-button>
                <el-button
                  link
                  type="primary"
                  :size="actionSize"
                  @click="actions.handleSingleStatus(row)"
                >
                  {{ row.isEnable ? '停用' : '启用' }}
                </el-button>
                <el-button
                  link
                  type="primary"
                  :size="actionSize"
                  @click="dialogActions.openAccountDialog(row)"
                >
                  修改账号
                </el-button>
                <el-button
                  link
                  type="primary"
                  :size="actionSize"
                  @click="actions.handleResetPassword(row)"
                >
                  重置密码
                </el-button>
                <el-button
                  v-if="Number(row.userType) === 1"
                  link
                  type="primary"
                  :size="actionSize"
                  @click="dialogActions.openBindDialog(row)"
                >
                  关联账号
                </el-button>
                <el-button link type="danger" :size="actionSize" @click="actions.handleDelete(row)">
                  删除
                </el-button>
              </ObActionButtons>
            </div>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <UserSearchForm :ref="refs.searchRef" v-model="table.searchForm" />
      </template>
    </ObTableBox>
  </ObPageContainer>

  <ObCrudContainer
    v-model="editor.crudVisible"
    container="drawer"
    :mode="editor.crudMode"
    :title="editor.crudTitle"
    :loading="editor.crudSubmitting"
    :show-cancel-button="!editor.crudReadonly"
    confirm-text="保存"
    :drawer-size="920"
    @confirm="editor.crud.confirm"
    @cancel="editor.crud.close"
    @close="editor.crud.close"
  >
    <UserEditForm
      :ref="refs.editFormRef"
      v-model="editor.crudForm"
      :mode="editor.crudMode"
      :rules="userFormRules"
      :disabled="editor.crudReadonly"
      :org-tree-options="table.orgTreeData"
      :position-options="options.positionOptions"
      :role-options="options.roleOptions"
      :check-unique="editor.checkFieldUnique"
      :upload-avatar="editor.uploadAvatar"
    />
  </ObCrudContainer>

  <ObCrudContainer
    v-model="dialogs.accountVisible"
    container="drawer"
    mode="edit"
    title="登录账号"
    :loading="dialogs.accountSubmitting"
    :drawer-size="420"
    @confirm="dialogActions.submitAccountDialog"
    @cancel="dialogActions.closeAccountDialog"
    @close="dialogActions.closeAccountDialog"
  >
    <UserAccountForm
      :ref="dialogRefs.accountFormRef"
      v-model="dialogs.accountForm"
      :disabled="false"
      :check-user-account-unique="editor.checkFieldUnique"
    />
  </ObCrudContainer>

  <ObCrudContainer
    v-model="dialogs.bindVisible"
    container="drawer"
    mode="edit"
    title="关联账号"
    :loading="dialogs.bindSubmitting || dialogs.bindLoading"
    :drawer-size="680"
    @confirm="dialogActions.submitBindDialog"
    @cancel="dialogActions.closeBindDialog"
    @close="dialogActions.closeBindDialog"
  >
    <UserBindAccountForm
      :ref="dialogRefs.bindFormRef"
      v-model="dialogs.bindForm"
      :disabled="dialogs.bindLoading"
      :initial-selected-users="dialogs.bindSelectedUsers"
      :fetch-users="dialogActions.fetchBindUsers"
      :on-search-error="dialogActions.handleBindSearchError"
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
