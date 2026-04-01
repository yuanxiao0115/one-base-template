<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { type CrudErrorContext, type CrudFormLike, useCrudPage } from '@one-base-template/core';
import ColumnEditForm from './components/ColumnEditForm.vue';
import ColumnSearchForm from './components/ColumnSearchForm.vue';
import columnColumns from './columns';
import { columnApi } from './api';
import type { ApiResponse, ColumnRecord, ColumnSavePayload } from './types';
import {
  columnFormRules,
  defaultColumnForm,
  type ColumnForm,
  type ColumnTreeOption,
  toColumnForm,
  toColumnPayload
} from './form';
import { message } from '@one-base-template/ui';
import { useRouter } from 'vue-router';

interface SearchRefExpose {
  resetFields?: () => void;
}

defineOptions({
  name: 'CmsPublicityColumnPage'
});

const router = useRouter();

const tableRef = ref<unknown>(null);
const searchRef = ref<SearchRefExpose>();
const editFormRef = ref<CrudFormLike>();

const searchForm = reactive({
  categoryName: '',
  isShow: ''
});

const tableTreeConfig = computed(() => ({
  transform: false,
  expandAll: true,
  childrenField: 'children'
}));

const crudPage = useCrudPage<
  ColumnForm,
  ColumnRecord,
  ColumnRecord,
  ColumnSavePayload,
  ApiResponse<boolean>
>({
  table: {
    query: {
      api: async (params) =>
        columnApi.tree({
          categoryName: String(params.categoryName || ''),
          isShow: params.isShow as number | string
        }),
      params: searchForm,
      pagination: false
    },
    remove: {
      api: columnApi.remove,
      buildPayload: (row: ColumnRecord) => ({ id: row.id }),
      deleteConfirm: {
        nameKey: 'categoryName',
        title: '删除确认',
        message: '是否确认删除栏目「{name}」？'
      },
      onSuccess: () => {
        message.success('删除成功');
      },
      onError: (error) => {
        message.error(getErrorMessage(error, '删除失败'));
      }
    }
  },
  tableRef,
  editor: {
    entity: {
      name: '栏目'
    },
    form: {
      create: () => ({ ...defaultColumnForm }),
      ref: editFormRef
    },
    detail: {
      load: async ({ row }) => row,
      mapToForm: ({ detail }) => toColumnForm(detail)
    },
    save: {
      buildPayload: ({ form }) => toColumnPayload(form),
      request: async ({ mode, payload }) => {
        const response =
          mode === 'create' ? await columnApi.add(payload) : await columnApi.update(payload);
        if (response.code !== 200) {
          throw new Error(response.message || '保存栏目失败');
        }
        return response;
      },
      onSuccess: async ({ mode }) => {
        message.success(mode === 'create' ? '新增栏目成功' : '更新栏目成功');
      }
    },
    onError: (error, context) => {
      handleCrudError(error, context);
    }
  }
});

const { table, editor, actions } = crudPage;

const tableColumns = computed(() => columnColumns);
const tableLoading = computed(() => table.loading.value);
const tableRows = computed(() => table.dataList.value);
const columnTreeOptions = computed<ColumnTreeOption[]>(() => toTreeOptions(table.dataList.value));
const crudVisible = editor.visible;
const crudMode = editor.mode;
const crudTitle = editor.title;
const crudReadonly = editor.readonly;
const crudSubmitting = editor.submitting;
const crudForm = editor.form;

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function handleCrudError(error: unknown, context: CrudErrorContext<ColumnRecord>) {
  const fallback =
    context.stage === 'beforeOpen'
      ? '打开弹窗失败'
      : context.stage === 'loadDetail'
        ? '加载详情失败'
        : '保存栏目失败';
  message.error(getErrorMessage(error, fallback));
}

function toTreeOptions(rows: ColumnRecord[]): ColumnTreeOption[] {
  return rows.map((row) => ({
    value: row.id,
    label: row.categoryName,
    children: row.children?.length ? toTreeOptions(row.children) : undefined
  }));
}

function tableSearch(keyword: string) {
  searchForm.categoryName = keyword;
  void table.onSearch();
}

function onKeywordUpdate(keyword: string) {
  searchForm.categoryName = keyword;
}

function onResetSearch() {
  searchForm.isShow = '';
  table.resetForm(searchRef, 'categoryName');
}

async function openCreate() {
  await editor.openCreate();
}

async function openCreateChild(row: ColumnRecord) {
  await editor.openCreate({
    patchForm: {
      parentCategoryId: row.id
    }
  });
}

async function openEdit(row: ColumnRecord) {
  await editor.openEdit(row);
}

async function openDetail(row: ColumnRecord) {
  await editor.openDetail(row);
}

function openArticleList(row: ColumnRecord) {
  void router.push({
    path: `/publicity/article-list/${row.id}`,
    query: {
      categoryName: row.categoryName
    }
  });
}

async function removeColumn(row: ColumnRecord) {
  await actions.remove(row);
}

async function onConfirmCrud() {
  try {
    await editor.confirm();
  } catch {
    // 错误提示由 onError 统一处理。
  }
}
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="栏目管理"
      :columns="tableColumns"
      placeholder="请输入栏目名称搜索"
      :keyword="searchForm.categoryName"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="openCreate">新增栏目</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObTable
          ref="tableRef"
          :size
          :loading="tableLoading"
          :data="tableRows"
          :columns="dynamicColumns"
          :pagination="false"
          :tree-config="tableTreeConfig"
          row-key="id"
        >
          <template #isShow="{ row }">
            <el-tag :type="Number(row.isShow) === 1 ? 'success' : 'info'">
              {{ Number(row.isShow) === 1 ? '显示' : '隐藏' }}
            </el-tag>
          </template>

          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="openCreateChild(row)"
                >添加子级</el-button
              >
              <el-button link type="primary" :size="actionSize" @click="openEdit(row)"
                >编辑</el-button
              >
              <el-button link type="primary" :size="actionSize" @click="openDetail(row)"
                >查看</el-button
              >
              <el-button link type="primary" :size="actionSize" @click="openArticleList(row)"
                >文章列表</el-button
              >
              <el-button link type="danger" :size="actionSize" @click="removeColumn(row)"
                >删除</el-button
              >
            </ObActionButtons>
          </template>
        </ObTable>
      </template>

      <template #drawer>
        <ColumnSearchForm ref="searchRef" v-model="searchForm" />
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
    @confirm="onConfirmCrud"
    @cancel="editor.close"
    @close="editor.close"
  >
    <ColumnEditForm
      ref="editFormRef"
      v-model="crudForm"
      :rules="columnFormRules"
      :disabled="crudReadonly"
      :column-tree-options="columnTreeOptions"
    />
  </ObCrudContainer>
</template>
