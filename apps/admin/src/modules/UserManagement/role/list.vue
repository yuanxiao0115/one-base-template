<script setup lang="ts">
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

const { refs } = pageState;

const { loading, dataList, tablePagination, tableColumns, searchForm } = pageState.table;

const { crud, crudVisible, crudMode, crudTitle, crudReadonly, crudSubmitting, crudForm } =
  pageState.editor;

const { permissionVisible, permissionRoleId, permissionRoleName } = pageState.dialogs;

const {
  tableSearch,
  onKeywordUpdate,
  onResetSearch,
  handleSizeChange,
  handleCurrentChange,
  handleDelete,
  openPermissionDialog,
  handlePermissionSaved
} = pageState.actions;
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="角色管理"
      :columns="tableColumns"
      placeholder="请输入角色名称搜索"
      :keyword="searchForm.roleName"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="crud.openCreate()">新增角色</el-button>
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
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="() => crud.openEdit(row)"
                >编辑</el-button
              >
              <el-button link type="primary" :size="actionSize" @click="() => crud.openDetail(row)"
                >查看</el-button
              >
              <el-button
                link
                type="primary"
                :size="actionSize"
                @click="() => openPermissionDialog(row)"
                >添加权限</el-button
              >
              <el-button link type="danger" :size="actionSize" @click="() => handleDelete(row)"
                >删除</el-button
              >
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer> <RoleSearchForm :ref="refs.searchRef" v-model="searchForm" /> </template>
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
    :drawer-size="420"
    @confirm="crud.confirm"
    @cancel="crud.close"
    @close="crud.close"
  >
    <RoleEditForm
      :ref="refs.editFormRef"
      v-model="crudForm"
      :rules="roleFormRules"
      :disabled="crudReadonly"
    />
  </ObCrudContainer>

  <RolePermissionDialog
    v-model="permissionVisible"
    :role-id="permissionRoleId"
    :role-name="permissionRoleName"
    @saved="handlePermissionSaved"
  />
</template>
