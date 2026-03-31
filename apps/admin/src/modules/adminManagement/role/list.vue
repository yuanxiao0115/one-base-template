<script setup lang="ts">
import { reactive } from 'vue';
import { Table as ObTable } from '@one-base-template/ui';
import { Plus } from '@element-plus/icons-vue';
import RoleEditForm from './components/RoleEditForm.vue';
import RolePermissionDialog from './components/RolePermissionDialog.vue';
import RoleSearchForm from './components/RoleSearchForm.vue';
import { roleFormRules } from './form';
import { useRolePageState } from './composables/useRolePageState';

defineOptions({
  name: 'RoleManagementPage'
});

// 页面仅保留编排层：角色管理查询、CRUD 与权限配置逻辑统一下沉到 composable。
const pageState = useRolePageState();

const { refs, actions } = pageState;
const table = reactive(pageState.table);
const editor = reactive(pageState.editor);
const dialogs = reactive(pageState.dialogs);
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="角色管理"
      :columns="table.tableColumns"
      placeholder="请输入角色名称搜索"
      :keyword="table.searchForm.roleName"
      @search="actions.tableSearch"
      @update:keyword="actions.onKeywordUpdate"
      @reset-form="actions.onResetSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="actions.openCreate">新增角色</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObTable
          :ref="refs.tableRef"
          :loading="table.loading"
          :size
          :data="table.dataList"
          :columns="dynamicColumns"
          :pagination="table.tablePagination"
          row-key="id"
          @page-size-change="actions.handleSizeChange"
          @page-current-change="actions.handleCurrentChange"
        >
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
                @click="actions.openPermissionDialog(row)"
                >添加权限</el-button
              >
              <el-button link type="danger" :size="actionSize" @click="actions.handleDelete(row)"
                >删除</el-button
              >
            </ObActionButtons>
          </template>
        </ObTable>
      </template>

      <template #drawer>
        <RoleSearchForm :ref="refs.searchRef" v-model="table.searchForm" />
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
    :drawer-size="420"
    @confirm="editor.crud.confirm"
    @cancel="editor.crud.close"
    @close="editor.crud.close"
  >
    <RoleEditForm
      :ref="refs.editFormRef"
      v-model="editor.crudForm"
      :rules="roleFormRules"
      :disabled="editor.crudReadonly"
    />
  </ObCrudContainer>

  <RolePermissionDialog
    v-model="dialogs.permissionVisible"
    :role-id="dialogs.permissionRoleId"
    :role-name="dialogs.permissionRoleName"
    @saved="actions.handlePermissionSaved"
  />
</template>
