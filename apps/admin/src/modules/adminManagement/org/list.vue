<script setup lang="ts">
import { reactive } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import OrgSearchForm from './components/OrgSearchForm.vue';
import OrgEditForm from './components/OrgEditForm.vue';
import OrgManagerDialog from './components/OrgManagerDialog.vue';
import OrgLevelManageDialog from './components/OrgLevelManageDialog.vue';
import { orgFormRules } from './form';
import { useOrgPageState } from './composables/useOrgPageState';

defineOptions({
  name: 'OrgManagementPage'
});

// 页面仅保留编排层：组织管理查询、CRUD 与树数据加载逻辑统一下沉到 composable。
const pageState = useOrgPageState();

const { refs, actions } = pageState;
const table = reactive(pageState.table);
const editor = reactive(pageState.editor);
const options = reactive(pageState.options);
const dialogs = reactive(pageState.dialogs);
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="组织管理"
      :columns="table.tableColumns"
      placeholder="请输入组织名称搜索"
      :keyword="table.searchForm.orgName"
      @search="actions.tableSearch"
      @update:keyword="actions.onKeywordUpdate"
      @reset-form="actions.onResetSearch"
    >
      <template #buttons>
        <el-button @click="actions.openLevelManageDialog">等级管理</el-button>
        <el-button type="primary" :icon="Plus" @click="actions.openCreateRoot">新增</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObTanStackTable
          :ref="refs.tableRef"
          :loading="table.loading"
          :size
          :data="table.dataList"
          :columns="dynamicColumns"
          :pagination="false"
          :tree-config="table.treeConfig"
          row-key="id"
        >
          <template #orgName="{ row }">
            <div class="org-management-page__name-cell">
              <el-tag size="small" type="info">{{
                row.orgType === 1 ? '单位' : row.orgType === 0 ? '部门' : '--'
              }}</el-tag>
              <span>{{ row.orgName }}</span>
              <el-tag v-if="row.isExternal" size="small" type="warning">外部</el-tag>
            </div>
          </template>

          <template #orgCategory="{ row }">
            {{ table.orgCategoryLabelMap[String(row.orgCategory)] || '--' }}
          </template>

          <template #institutionalType="{ row }">
            {{ table.institutionalTypeLabelMap[String(row.institutionalType)] || '--' }}
          </template>

          <template #operation="{ row, size: actionSize }">
            <div class="org-management-page__actions">
              <ObActionButtons>
                <el-button link type="primary" :size="actionSize" @click="actions.openDetail(row)"
                  >查看</el-button
                >
                <el-button link type="primary" :size="actionSize" @click="actions.openEdit(row)"
                  >编辑</el-button
                >
                <el-button
                  link
                  type="primary"
                  :size="actionSize"
                  @click="actions.openCreateChild(row)"
                  >新增下级组织</el-button
                >
                <el-button
                  link
                  type="primary"
                  :size="actionSize"
                  @click="actions.openManagerDialog(row)"
                  >创建组织管理员</el-button
                >
                <el-button link type="danger" :size="actionSize" @click="actions.handleDelete(row)"
                  >删除</el-button
                >
              </ObActionButtons>
            </div>
          </template>
        </ObTanStackTable>
      </template>

      <template #drawer>
        <OrgSearchForm :ref="refs.searchRef" v-model="table.searchForm" />
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
    @confirm="editor.crud.confirm"
    @cancel="editor.crud.close"
    @close="editor.crud.close"
  >
    <OrgEditForm
      :ref="refs.editFormRef"
      v-model="editor.crudForm"
      :rules="orgFormRules"
      :disabled="editor.crudReadonly"
      :org-tree-options="options.orgTreeOptions"
      :org-category-options="options.orgCategoryOptions"
      :institutional-type-options="options.institutionalTypeOptions"
      :org-level-options="options.orgLevelOptions"
      :root-parent-id="options.rootParentId"
      :check-org-name-unique="editor.checkOrgNameUnique"
    />
  </ObCrudContainer>

  <OrgManagerDialog
    v-model="dialogs.orgManagerVisible"
    :org-id="dialogs.orgManagerTarget?.id || ''"
    :org-name="dialogs.orgManagerTarget?.orgName || ''"
    @success="actions.handleOrgManagerUpdated"
  />

  <OrgLevelManageDialog
    v-model="dialogs.orgLevelDialogVisible"
    @updated="actions.handleOrgLevelUpdated"
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
