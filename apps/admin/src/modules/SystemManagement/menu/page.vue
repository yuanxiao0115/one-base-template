<script setup lang="ts">
  import { Plus } from "@element-plus/icons-vue";
  import MenuPermissionEditForm from "./components/MenuPermissionEditForm.vue";
  import MenuPermissionSearchForm from "./components/MenuPermissionSearchForm.vue";
  import { useMenuManagementPageState } from "./composables/useMenuManagementPageState";

  defineOptions({
    name: "SystemMenuManagementPage",
  });

  const pageState = useMenuManagementPageState();

  const { refs } = pageState;

  const { loading, dataList, tableColumns, tableTreeConfig, searchForm } = pageState.table;

  const { resourceTypeOptions, parentOptions } = pageState.options;

  const { crud, crudVisible, crudMode, crudTitle, crudReadonly, crudSubmitting, crudForm, menuPermissionFormRules } =
    pageState.editor;

  const {
    tableSearch,
    onKeywordUpdate,
    onResetSearch,
    openCreateDialog,
    openEditDialog,
    handleCreateCommand,
    handleDelete,
    onConfirmCrud,
  } = pageState.actions;
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="菜单管理"
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
          :ref="refs.tableRef"
          :size
          :loading
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="false"
          row-key="id"
          :tree-config="tableTreeConfig"
        >
          <template #icon="{ row }">
            <div class="system-menu-management-page__icon-cell">
              <ObMenuIcon :icon="row.icon" class="system-menu-management-page__icon-preview" />
              <span class="system-menu-management-page__icon-text" :title="row.icon || '--'">
                {{ row.icon || '--' }}
              </span>
            </div>
          </template>

          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-dropdown
                v-if="Number(row.resourceType) !== 3"
                @command="(command) => handleCreateCommand(String(command), row)"
              >
                <el-button link type="primary" :size="actionSize">新建</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="child">新建子级权限</el-dropdown-item>
                    <el-dropdown-item command="sibling">新建平级权限</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

              <el-button link type="primary" :size="actionSize" @click="() => openEditDialog('edit', row)"
                >编辑</el-button
              >
              <el-button link type="primary" :size="actionSize" @click="() => openEditDialog('detail', row)"
                >查看</el-button
              >
              <el-button link type="danger" :size="actionSize" @click="() => handleDelete(row)">删除</el-button>
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <MenuPermissionSearchForm :ref="refs.searchRef" v-model="searchForm" :resource-type-options />
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
    confirm-text="保存"
    :drawer-size="760"
    :drawer-columns="2"
    @confirm="onConfirmCrud"
    @cancel="crud.close"
    @close="crud.close"
  >
    <MenuPermissionEditForm
      :ref="refs.editFormRef"
      v-model="crudForm"
      :rules="menuPermissionFormRules"
      :disabled="crudReadonly"
      :parent-options
      :resource-type-options
    />
  </ObCrudContainer>
</template>

<style scoped>
  .system-menu-management-page__icon-cell {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    min-width: 0;
  }

  .system-menu-management-page__icon-preview {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .system-menu-management-page__icon-text {
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
