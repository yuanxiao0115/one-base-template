<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import type { TableColumnList } from '@one-base-template/ui';
import { confirm, message } from '@one-base-template/ui';
import { messageCategoryApi } from './api';
import MessageCategoryEditForm from './components/MessageCategoryEditForm.vue';
import type {
  MessageCategoryFormModel,
  MessageCategoryPayload,
  MessageCategoryRecord
} from './types';
import { createLatestRequestGuard } from '../shared/latestRequest';
import { getErrorMessage, normalizePageRecords, normalizePageTotal } from '../shared/utils';

defineOptions({
  name: 'MessageManagementCategoryPage'
});

interface CategoryFormExpose {
  validate?: () => Promise<boolean> | boolean;
  clearValidate?: () => void;
  resetFields?: () => void;
}

const loading = ref(false);
const rows = ref<MessageCategoryRecord[]>([]);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const searchForm = reactive<{
  name: string;
}>({
  name: ''
});

const dialogVisible = ref(false);
const dialogMode = ref<'add' | 'edit' | 'detail'>('add');
const dialogSubmitting = ref(false);
const dialogDetailLoading = ref(false);
const dialogFormRef = ref<CategoryFormExpose>();
const dialogForm = ref<MessageCategoryFormModel>(createDefaultFormModel());

const listGuard = createLatestRequestGuard();
const detailGuard = createLatestRequestGuard();

const tableColumns: TableColumnList = [
  {
    label: '分类名称',
    prop: 'name',
    minWidth: 220
  },
  {
    label: '创建人',
    prop: 'creator',
    minWidth: 120
  },
  {
    label: '创建时间',
    prop: 'createTime',
    minWidth: 180
  },
  {
    label: '修改人',
    prop: 'modifier',
    minWidth: 120
  },
  {
    label: '修改时间',
    prop: 'updateTime',
    minWidth: 180
  },
  {
    label: '操作',
    width: 220,
    fixed: 'right',
    align: 'right',
    slot: 'operation'
  }
];

const tablePagination = computed(() => ({
  currentPage: currentPage.value,
  pageSize: pageSize.value,
  total: total.value
}));

const dialogTitle = computed(() => {
  if (dialogMode.value === 'add') {
    return '新增分类';
  }
  if (dialogMode.value === 'edit') {
    return '编辑分类';
  }
  return '查看分类';
});

const dialogReadonly = computed(() => dialogMode.value === 'detail');

function createDefaultFormModel(): MessageCategoryFormModel {
  return {
    id: '',
    name: ''
  };
}

function normalizeCategoryFormModel(
  record?: MessageCategoryRecord | null
): MessageCategoryFormModel {
  return {
    id: record?.id || '',
    name: record?.name || ''
  };
}

function buildPayload(): MessageCategoryPayload {
  return {
    id: dialogForm.value.id || undefined,
    name: dialogForm.value.name.trim()
  };
}

async function loadList(page = currentPage.value) {
  const token = listGuard.next();
  loading.value = true;
  currentPage.value = page;

  try {
    const response = await messageCategoryApi.page({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      name: searchForm.name.trim() || undefined
    });

    if (!listGuard.isLatest(token)) {
      return;
    }

    if (response.code !== 200) {
      throw new Error(response.message || '加载分类列表失败');
    }

    rows.value = normalizePageRecords(response.data) as MessageCategoryRecord[];
    total.value = normalizePageTotal(response.data);
  } catch (error) {
    if (!listGuard.isLatest(token)) {
      return;
    }
    rows.value = [];
    total.value = 0;
    message.error(getErrorMessage(error, '加载分类列表失败'));
  } finally {
    if (listGuard.isLatest(token)) {
      loading.value = false;
    }
  }
}

function tableSearch(keyword: string) {
  searchForm.name = keyword;
  void loadList(1);
}

function onKeywordUpdate(keyword: string) {
  searchForm.name = keyword;
}

function onResetSearch() {
  searchForm.name = '';
  void loadList(1);
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  void loadList(1);
}

function handlePageCurrentChange(page: number) {
  void loadList(page);
}

function openCreate() {
  dialogMode.value = 'add';
  dialogDetailLoading.value = false;
  detailGuard.invalidate();
  dialogForm.value = createDefaultFormModel();
  dialogVisible.value = true;
}

async function openEdit(row: MessageCategoryRecord) {
  dialogMode.value = 'edit';
  dialogVisible.value = true;
  await loadDetail(row.id);
}

async function openDetail(row: MessageCategoryRecord) {
  dialogMode.value = 'detail';
  dialogVisible.value = true;
  await loadDetail(row.id);
}

async function loadDetail(id: string) {
  dialogDetailLoading.value = true;
  dialogForm.value = createDefaultFormModel();
  const token = detailGuard.next();

  try {
    const response = await messageCategoryApi.detail(id);
    if (!detailGuard.isLatest(token)) {
      return;
    }

    if (response.code !== 200) {
      throw new Error(response.message || '加载分类详情失败');
    }

    dialogForm.value = normalizeCategoryFormModel(response.data);
    dialogFormRef.value?.clearValidate?.();
  } catch (error) {
    if (!detailGuard.isLatest(token)) {
      return;
    }
    dialogVisible.value = false;
    message.error(getErrorMessage(error, '加载分类详情失败'));
  } finally {
    if (detailGuard.isLatest(token)) {
      dialogDetailLoading.value = false;
    }
  }
}

function closeDialog() {
  dialogVisible.value = false;
  dialogSubmitting.value = false;
  dialogDetailLoading.value = false;
  detailGuard.invalidate();
}

async function submitDialog() {
  if (dialogReadonly.value || dialogSubmitting.value) {
    closeDialog();
    return;
  }

  const validateResult = await dialogFormRef.value?.validate?.();
  if (!validateResult) {
    return;
  }

  dialogSubmitting.value = true;

  try {
    const payload = buildPayload();
    const response =
      dialogMode.value === 'add'
        ? await messageCategoryApi.create({ name: payload.name })
        : await messageCategoryApi.update(payload);

    if (response.code !== 200) {
      throw new Error(response.message || '保存分类失败');
    }

    message.success(dialogMode.value === 'add' ? '新增成功' : '更新成功');
    closeDialog();
    await loadList(dialogMode.value === 'add' ? 1 : currentPage.value);
  } catch (error) {
    message.error(getErrorMessage(error, '保存分类失败'));
  } finally {
    dialogSubmitting.value = false;
  }
}

async function removeRow(row: MessageCategoryRecord) {
  try {
    await confirm.warn(`确认删除分类“${row.name || '--'}”吗？`, '删除确认');
  } catch {
    return;
  }

  try {
    const response = await messageCategoryApi.remove(row.id);
    if (response.code !== 200) {
      throw new Error(response.message || '删除分类失败');
    }

    message.success('删除成功');
    const nextPage =
      rows.value.length <= 1 && currentPage.value > 1 ? currentPage.value - 1 : currentPage.value;
    await loadList(nextPage);
  } catch (error) {
    message.error(getErrorMessage(error, '删除分类失败'));
  }
}

onMounted(() => {
  void loadList(1);
});
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="消息分类"
      :columns="tableColumns"
      placeholder="请输入分类名称"
      :keyword="searchForm.name"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
      <template #buttons>
        <el-button type="primary" @click="openCreate">新增分类</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObTable
          :size
          :loading="loading"
          :data="rows"
          :columns="dynamicColumns"
          :pagination="tablePagination"
          row-key="id"
          @page-size-change="handlePageSizeChange"
          @page-current-change="handlePageCurrentChange"
        >
          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="openEdit(row)"
                >编辑</el-button
              >
              <el-button link :size="actionSize" @click="openDetail(row)">查看</el-button>
              <el-button link type="danger" :size="actionSize" @click="removeRow(row)"
                >删除</el-button
              >
            </ObActionButtons>
          </template>
        </ObTable>
      </template>
    </ObTableBox>
  </ObPageContainer>

  <ObCrudContainer
    v-model="dialogVisible"
    container="dialog"
    :mode="dialogReadonly ? 'detail' : 'edit'"
    :title="dialogTitle"
    :loading="dialogSubmitting || dialogDetailLoading"
    :show-confirm-button="!dialogReadonly"
    :show-cancel-button="true"
    :dialog-width="560"
    @confirm="submitDialog"
    @cancel="closeDialog"
    @close="closeDialog"
  >
    <MessageCategoryEditForm
      ref="dialogFormRef"
      v-model="dialogForm"
      :disabled="dialogReadonly || dialogDetailLoading"
    />
  </ObCrudContainer>
</template>
