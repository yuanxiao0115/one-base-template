<script setup lang="ts">
import { reactive } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import StarterCrudEditForm from './components/StarterCrudEditForm.vue';
import StarterCrudSearchForm from './components/StarterCrudSearchForm.vue';
import { starterCrudFormRules, starterCrudStatusOptions } from './form';
import { useStarterCrudPageState } from './composables/useStarterCrudPageState';

defineOptions({
  name: 'StarterCrudManagementPage'
});

const pageState = useStarterCrudPageState();
const { refs, actions } = pageState;
const table = reactive(pageState.table);
const editor = reactive(pageState.editor);
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="Starter CRUD"
      :columns="table.tableColumns"
      placeholder="请输入示例名称或编码搜索"
      :keyword="table.searchForm.keyword"
      @search="actions.tableSearch"
      @update:keyword="actions.onKeywordUpdate"
      @reset-form="actions.onResetSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="actions.openCreate">新增示例记录</el-button>
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
          <template #status="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>

          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="actions.openEdit(row)">
                编辑
              </el-button>
              <el-button link type="primary" :size="actionSize" @click="actions.openDetail(row)">
                查看
              </el-button>
              <el-button link type="danger" :size="actionSize" @click="actions.handleDelete(row)">
                删除
              </el-button>
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <StarterCrudSearchForm
          :ref="refs.searchRef"
          v-model="table.searchForm"
          :status-options="starterCrudStatusOptions"
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
    :drawer-size="480"
    @confirm="actions.confirmEditor"
    @cancel="actions.closeEditor"
    @close="actions.closeEditor"
  >
    <StarterCrudEditForm
      :ref="refs.editFormRef"
      v-model="editor.crudForm"
      :rules="starterCrudFormRules"
      :disabled="editor.crudReadonly"
      :status-options="starterCrudStatusOptions"
    />
  </ObCrudContainer>
</template>
