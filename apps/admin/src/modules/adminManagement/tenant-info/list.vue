<script setup lang="ts">
import { reactive } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import TenantInfoSearchForm from './components/TenantInfoSearchForm.vue';
import TenantInfoEditForm from './components/TenantInfoEditForm.vue';
import TenantInfoPermissionDialog from './components/TenantInfoPermissionDialog.vue';
import { useTenantInfoPageState } from './composables/useTenantInfoPageState';

defineOptions({
  name: 'TenantInfoManagementPage'
});

const pageState = useTenantInfoPageState();

const { refs, actions } = pageState;
const table = reactive(pageState.table);
const editor = reactive(pageState.editor);
const dialogs = reactive(pageState.dialogs);
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="租户信息管理"
      :columns="table.tableColumns"
      placeholder="请输入租户名称搜索"
      :keyword="table.searchForm.tenantName"
      @search="actions.tableSearch"
      @update:keyword="actions.onKeywordUpdate"
      @reset-form="actions.onResetSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="actions.openCreate">新增租户</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObVxeTable
          :ref="refs.tableRef"
          :size
          :loading="table.loading"
          :data="table.dataList"
          :columns="dynamicColumns"
          :pagination="table.tablePagination"
          row-key="id"
          @page-size-change="actions.handleSizeChange"
          @page-current-change="actions.handleCurrentChange"
        >
          <template #tenantState="{ row }">
            <el-tag :type="actions.getTenantStatusType(row)">
              {{ actions.getTenantStatusText(row) }}
            </el-tag>
          </template>

          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="actions.openEdit(row)"
                >编辑</el-button
              >
              <el-button link type="primary" :size="actionSize" @click="actions.openDetail(row)"
                >查看</el-button
              >
              <el-button
                link
                type="primary"
                :size="actionSize"
                @click="actions.openPermission(row)"
              >
                添加权限
              </el-button>
              <el-button
                link
                :type="actions.isTenantEnabled(row) ? 'danger' : 'success'"
                :size="actionSize"
                @click="actions.handleToggleStatus(row)"
              >
                {{ actions.isTenantEnabled(row) ? '停用' : '启用' }}
              </el-button>
              <el-button link type="danger" :size="actionSize" @click="actions.handleDelete(row)"
                >删除</el-button
              >
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <TenantInfoSearchForm :ref="refs.searchRef" v-model="table.searchForm" />
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
    :drawer-size="560"
    @confirm="editor.crud.confirm"
    @cancel="editor.crud.close"
    @close="editor.crud.close"
  >
    <TenantInfoEditForm
      :ref="refs.editFormRef"
      v-model="editor.crudForm"
      :mode="editor.crudMode"
      :rules="editor.tenantInfoFormRules"
      :disabled="editor.crudReadonly"
      :check-field-unique="editor.checkFieldUnique"
    />
  </ObCrudContainer>

  <TenantInfoPermissionDialog
    v-model="dialogs.permissionVisible"
    :tenant-id="dialogs.permissionTenantId"
    :tenant-name="dialogs.permissionTenantName"
    @saved="actions.handlePermissionSaved"
    @update:model-value="actions.onPermissionDialogChange"
  />
</template>
