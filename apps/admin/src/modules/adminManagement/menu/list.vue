<script setup lang="ts">
import { reactive } from 'vue';
import { Table as ObTable } from '@one-base-template/ui';
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
  <ObPageContainer padding="0" overflow="hidden" left-width="248px">
    <template #left>
      <div class="system-menu-management-page__system-panel">
        <div class="system-menu-management-page__system-header">
          <span class="system-menu-management-page__system-title">系统列表</span>
          <el-tag size="small" type="info">{{ table.systemList.length }}</el-tag>
        </div>

        <el-scrollbar class="system-menu-management-page__system-scrollbar">
          <el-empty
            v-if="!table.hasSystemData"
            :image-size="72"
            description="暂无系统权限"
            class="system-menu-management-page__system-empty"
          />

          <el-menu
            v-else
            :default-active="table.activeSystemId"
            class="system-menu-management-page__system-menu"
            @select="actions.selectSystem"
          >
            <el-menu-item
              v-for="item in table.systemList"
              :key="item.id"
              :index="item.id"
              class="system-menu-management-page__system-menu-item"
            >
              <span class="system-menu-management-page__system-name">{{ item.name }}</span>
              <span class="system-menu-management-page__system-count">{{
                item.childrenCount
              }}</span>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
      </div>
    </template>

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
        <el-button
          type="primary"
          :icon="Plus"
          :disabled="table.inTreeMode && !table.activeSystemId"
          @click="actions.openCreateUnderActiveSystem"
          >添加权限</el-button
        >
        <el-button type="primary" :icon="Plus" @click="actions.openRootCreateDialog"
          >新增系统</el-button
        >
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObTable
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
              <el-button
                v-if="row.resourceType !== 3"
                link
                type="primary"
                :size="actionSize"
                @click="actions.openCreateChild(row)"
                >新增子级</el-button
              >
              <el-button
                v-if="row.resourceType !== 3"
                link
                type="primary"
                :size="actionSize"
                @click="actions.openCreateSibling(row)"
                >新增平级</el-button
              >

              <el-button link type="primary" :size="actionSize" @click="actions.openEdit(row)"
                >编辑</el-button
              >
              <el-button link type="primary" :size="actionSize" @click="actions.openDetail(row)"
                >查看</el-button
              >
              <el-button link type="danger" :size="actionSize" @click="actions.remove(row)"
                >删除</el-button
              >
            </ObActionButtons>
          </template>
        </ObTable>
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

.system-menu-management-page__system-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.system-menu-management-page__system-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.system-menu-management-page__system-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.system-menu-management-page__system-scrollbar {
  flex: 1;
}

.system-menu-management-page__system-empty {
  height: 100%;
}

.system-menu-management-page__system-menu {
  border-right: none;
}

.system-menu-management-page__system-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.system-menu-management-page__system-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.system-menu-management-page__system-count {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-left: 8px;
}
</style>
