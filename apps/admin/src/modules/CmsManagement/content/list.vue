<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { type CrudErrorContext, type CrudFormLike, useCrudPage } from '@one-base-template/core';
import { useRoute } from 'vue-router';
import ContentEditForm from './components/ContentEditForm.vue';
import ContentSearchForm from './components/ContentSearchForm.vue';
import contentColumns, { REVIEW_STATUS_LABEL_MAP } from './columns';
import { contentApi } from './api';
import type {
  ApiResponse,
  ContentCategoryRecord,
  ContentDetail,
  ContentRecord,
  ContentSavePayload
} from './types';
import {
  contentFormRules,
  defaultContentForm,
  type ContentForm,
  toContentForm,
  toContentPayload
} from './form';
import { obConfirm } from '@one-base-template/ui';
import { message } from '@one-base-template/ui';

interface SearchRefExpose {
  resetFields?: () => void;
}

defineOptions({
  name: 'CmsPublicityContentPage'
});

const route = useRoute();

const tableRef = ref<unknown>(null);
const searchRef = ref<SearchRefExpose>();
const editFormRef = ref<CrudFormLike>();

const categoryTreeLoading = ref(false);
const categoryTreeOptions = ref<ContentCategoryRecord[]>([]);
const BLOCK_DELETE_REASON = 'pending-review-blocked';

const searchForm = reactive({
  articleTitle: '',
  cmsCategoryId: typeof route.params.categoryId === 'string' ? route.params.categoryId : '',
  articleType: '' as number | ''
});

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function isPendingReview(row: ContentRecord): boolean {
  return Number(row.reviewStatus) === 0;
}

async function loadCategoryTree() {
  categoryTreeLoading.value = true;

  try {
    const response = await contentApi.categoryTree();
    if (response.code !== 200) {
      throw new Error(response.message || '加载栏目树失败');
    }

    categoryTreeOptions.value = response.data;
  } catch (error) {
    message.error(getErrorMessage(error, '加载栏目树失败'));
  } finally {
    categoryTreeLoading.value = false;
  }
}

const crudPage = useCrudPage<
  ContentForm,
  ContentRecord,
  ContentDetail,
  ContentSavePayload,
  ApiResponse<boolean>
>({
  table: {
    query: {
      api: async (params) =>
        contentApi.page({
          articleTitle: String(params.articleTitle || ''),
          cmsCategoryId: String(params.cmsCategoryId || ''),
          articleType: params.articleType as number | '',
          currentPage: Number(params.currentPage || 1),
          pageSize: Number(params.pageSize || 10)
        }),
      params: searchForm,
      pagination: true
    },
    remove: {
      api: contentApi.remove,
      buildPayload: (row: ContentRecord) => ({ id: row.id }),
      beforeDelete: async (row: ContentRecord) => {
        if (isPendingReview(row)) {
          message.warning('待审核状态的文章不允许删除');
          throw new Error(BLOCK_DELETE_REASON);
        }

        await obConfirm.warn(
          `是否确认删除标题为「${row.articleTitle || '-'}」的内容？`,
          '删除确认'
        );
      },
      isCancelled: (error) =>
        error === 'cancel' ||
        error === 'close' ||
        (error instanceof Error && error.message === BLOCK_DELETE_REASON),
      onSuccess: () => {
        message.success('删除成功');
      },
      onError: (error) => {
        if (error === 'cancel' || error === 'close') {
          return;
        }
        message.error(getErrorMessage(error, '删除失败'));
      }
    }
  },
  tableRef,
  editor: {
    entity: {
      name: '内容'
    },
    form: {
      create: () => ({ ...defaultContentForm }),
      ref: editFormRef
    },
    detail: {
      load: async ({ row }) => {
        const response = await contentApi.detail(row.id);
        if (response.code !== 200) {
          throw new Error(response.message || '获取详情失败');
        }
        return response.data;
      },
      mapToForm: ({ detail }) => toContentForm(detail)
    },
    save: {
      buildPayload: ({ form }) => toContentPayload(form),
      request: async ({ mode, payload }) => {
        const response =
          mode === 'create' ? await contentApi.add(payload) : await contentApi.update(payload);
        if (response.code !== 200) {
          throw new Error(response.message || '保存内容失败');
        }
        return response;
      },
      onSuccess: async ({ mode }) => {
        message.success(mode === 'create' ? '新增成功' : '更新成功');
      }
    },
    onError: (error, context) => {
      handleCrudError(error, context);
    }
  }
});

const { table, editor, actions } = crudPage;

const tableColumns = computed(() => contentColumns);
const tablePagination = computed(() => ({ ...table.pagination }));
const tableLoading = computed(() => table.loading.value);
const tableRows = computed(() => table.dataList.value);
const isCrudBusy = computed(() => editor.opening.value || editor.submitting.value);
const crudVisible = editor.visible;
const crudMode = editor.mode;
const crudTitle = editor.title;
const crudReadonly = editor.readonly;
const crudSubmitting = editor.submitting;
const crudForm = editor.form;

function handleCrudError(error: unknown, context: CrudErrorContext<ContentRecord>) {
  const fallback =
    context.stage === 'beforeOpen'
      ? '打开弹窗失败'
      : context.stage === 'loadDetail'
        ? '加载详情失败'
        : '保存内容失败';
  message.error(getErrorMessage(error, fallback));
}

function tableSearch(keyword: string) {
  searchForm.articleTitle = keyword;
  void table.onSearch();
}

function onKeywordUpdate(keyword: string) {
  searchForm.articleTitle = keyword;
}

function onResetSearch() {
  searchForm.cmsCategoryId = '';
  searchForm.articleType = '';
  table.resetForm(searchRef, 'articleTitle');
}

async function openCreate() {
  if (isCrudBusy.value) {
    return;
  }

  await editor.openCreate();
}

async function openEdit(row: ContentRecord) {
  if (isCrudBusy.value) {
    return;
  }

  if (isPendingReview(row)) {
    message.warning('待审核状态的文章不允许编辑');
    return;
  }

  await editor.openEdit(row);
}

async function openDetail(row: ContentRecord) {
  if (isCrudBusy.value) {
    return;
  }

  await editor.openDetail(row);
}

async function handleDelete(row: ContentRecord) {
  await actions.remove(row);
}

function getReviewStatusText(reviewStatus: unknown) {
  return REVIEW_STATUS_LABEL_MAP[Number(reviewStatus)] || '未知';
}

function getReviewStatusTagType(reviewStatus: unknown): 'warning' | 'success' | 'danger' | 'info' {
  const status = Number(reviewStatus);
  if (status === 0) {
    return 'warning';
  }
  if (status === 1) {
    return 'success';
  }
  if (status === 2) {
    return 'danger';
  }
  return 'info';
}

async function onConfirmCrud() {
  try {
    await editor.confirm();
  } catch {
    // 错误提示由 editor.onError 统一处理。
  }
}

watch(
  () => route.params.categoryId,
  (nextValue, prevValue) => {
    const nextCategoryId = typeof nextValue === 'string' ? nextValue : '';
    const prevCategoryId = typeof prevValue === 'string' ? prevValue : '';

    if (nextCategoryId === prevCategoryId) {
      return;
    }

    if (nextCategoryId) {
      searchForm.cmsCategoryId = nextCategoryId;
      void table.onSearch(true);
      return;
    }

    if (prevCategoryId) {
      searchForm.cmsCategoryId = '';
      void table.onSearch(true);
    }
  }
);

onMounted(() => {
  void loadCategoryTree();
});
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="内容管理"
      :columns="tableColumns"
      placeholder="请输入标题搜索"
      :keyword="searchForm.articleTitle"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="openCreate">新增内容</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObVxeTable
          ref="tableRef"
          :size
          :loading="tableLoading"
          :data="tableRows"
          :columns="dynamicColumns"
          :pagination="tablePagination"
          @page-size-change="table.handleSizeChange"
          @page-current-change="table.handleCurrentChange"
        >
          <template #reviewStatus="{ row }">
            <el-tag :type="getReviewStatusTagType(row.reviewStatus)">{{
              getReviewStatusText(row.reviewStatus)
            }}</el-tag>
          </template>

          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="openEdit(row)"
                >编辑</el-button
              >
              <el-button link type="primary" :size="actionSize" @click="openDetail(row)"
                >查看</el-button
              >
              <el-button link type="danger" :size="actionSize" @click="handleDelete(row)"
                >删除</el-button
              >
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <ContentSearchForm
          ref="searchRef"
          v-model="searchForm"
          :category-tree-options="categoryTreeOptions"
          :category-tree-loading="categoryTreeLoading"
        />
      </template>
    </ObTableBox>
  </ObPageContainer>

  <ObCrudContainer
    v-model="crudVisible"
    container="dialog"
    :mode="crudMode"
    :title="crudTitle"
    :loading="crudSubmitting"
    :dialog-fullscreen="true"
    :show-cancel-button="!crudReadonly"
    confirm-text="保存"
    @confirm="onConfirmCrud"
    @cancel="editor.close"
    @close="editor.close"
  >
    <ContentEditForm
      ref="editFormRef"
      v-model="crudForm"
      :rules="contentFormRules"
      :disabled="crudReadonly"
      :category-tree-options="categoryTreeOptions"
      :category-tree-loading="categoryTreeLoading"
    />
  </ObCrudContainer>
</template>
