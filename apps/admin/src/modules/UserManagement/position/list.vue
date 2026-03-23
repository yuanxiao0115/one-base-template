<script setup lang="ts">
import { reactive } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import PositionEditForm from './components/PositionEditForm.vue';
import PositionSearchForm from './components/PositionSearchForm.vue';
import { positionFormRules } from './form';
import { usePositionPageState } from './composables/usePositionPageState';

defineOptions({
  name: 'PositionManagementPage'
});

// 页面仅保留编排层：职位管理查询、CRUD 与分页行为统一下沉到 composable。
const pageState = usePositionPageState();

const { refs, actions } = pageState;
const table = reactive(pageState.table);
const editor = reactive(pageState.editor);
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="职位管理"
      :columns="table.tableColumns"
      placeholder="请输入职位名称搜索"
      :keyword="table.searchForm.postName"
      @search="actions.tableSearch"
      @update:keyword="actions.onKeywordUpdate"
      @reset-form="actions.onResetSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="editor.crud.openCreate()"
          >新增职位</el-button
        >
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObVxeTable
          :ref="refs.tableRef"
          :size
          :loading="table.loading"
          :data="table.dataList"
          :columns="dynamicColumns"
          :pagination="table.tablePagination"
          @page-size-change="actions.handleSizeChange"
          @page-current-change="actions.handleCurrentChange"
        >
          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button
                link
                type="primary"
                :size="actionSize"
                @click="() => editor.crud.openEdit(row)"
                >编辑</el-button
              >
              <el-button
                link
                type="primary"
                :size="actionSize"
                @click="() => editor.crud.openDetail(row)"
                >查看</el-button
              >
              <el-button
                link
                type="danger"
                :size="actionSize"
                @click="() => actions.handleDelete(row)"
                >删除</el-button
              >
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <PositionSearchForm :ref="refs.searchRef" v-model="table.searchForm" />
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
    :drawer-size="400"
    @confirm="editor.crud.confirm"
    @cancel="editor.crud.close"
    @close="editor.crud.close"
  >
    <PositionEditForm
      :ref="refs.editFormRef"
      v-model="editor.crudForm"
      :rules="positionFormRules"
      :disabled="editor.crudReadonly"
    />
  </ObCrudContainer>
</template>
