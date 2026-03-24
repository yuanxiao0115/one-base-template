<script setup lang="ts">
import { reactive } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import MenuPermissionEditForm from './components/MenuPermissionEditForm.vue';
import MenuPermissionSearchForm from './components/MenuPermissionSearchForm.vue';
import { useMenuManagementPageState } from './composables/useMenuManagementPageState';

defineOptions({
  name: 'SystemMenuManagementPage'
});

const pageState = useMenuManagementPageState();

// 页面仅保留编排层：菜单管理查询、CRUD 与选项加载逻辑统一下沉到 composable。
const { refs, actions } = pageState;
const table = reactive(pageState.table);
const editor = reactive(pageState.editor);
const options = reactive(pageState.options);
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="菜单管理"
      :columns="table.tableColumns"
      placeholder="请输入权限名称搜索"
      :keyword="table.searchForm.resourceName"
      @search="actions.tableSearch"
      @update:keyword="actions.onKeywordUpdate"
      @reset-form="actions.onResetSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="actions.openRootCreateDialog"
          >添加权限</el-button
        >
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObVxeTable
          :ref="refs.tableRef"
          :size
          :loading="table.loading"
          :data="table.dataList"
          :columns="dynamicColumns"
          :pagination="false"
          row-key="id"
          :tree-config="table.tableTreeConfig"
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
                @command="actions.handleCreateCommand"
              >
                <el-button link type="primary" :size="actionSize">新建</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="{ type: 'child', row }"
                      >新建子级权限</el-dropdown-item
                    >
                    <el-dropdown-item :command="{ type: 'sibling', row }"
                      >新建平级权限</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

              <el-button link type="primary" :size="actionSize" @click="actions.openEdit(row)"
                >编辑</el-button
              >
              <el-button link type="primary" :size="actionSize" @click="actions.openDetail(row)"
                >查看</el-button
              >
              <el-button link type="danger" :size="actionSize" @click="actions.handleDelete(row)"
                >删除</el-button
              >
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <MenuPermissionSearchForm
          :ref="refs.searchRef"
          v-model="table.searchForm"
          :resource-type-options="options.resourceTypeOptions"
        />
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
    :drawer-size="760"
    :drawer-columns="2"
    @confirm="actions.onConfirmCrud"
    @cancel="editor.crud.close"
    @close="editor.crud.close"
  >
    <MenuPermissionEditForm
      :ref="refs.editFormRef"
      v-model="editor.crudForm"
      :rules="editor.menuPermissionFormRules"
      :disabled="editor.crudReadonly"
      :parent-options="options.parentOptions"
      :resource-type-options="options.resourceTypeOptions"
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
