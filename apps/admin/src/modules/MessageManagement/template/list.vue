<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import type { TableColumnList } from '@one-base-template/ui';
import { confirm, message } from '@one-base-template/ui';
import { messageTemplateApi } from './api';
import MessageTemplateEditForm from './components/MessageTemplateEditForm.vue';
import type {
  MessageCategoryRecord,
  MessageTemplateFormModel,
  MessageTemplatePayload,
  MessageTemplateRecord
} from './types';
import { createLatestRequestGuard } from '../shared/latestRequest';
import { getErrorMessage, normalizePageRecords, normalizePageTotal } from '../shared/utils';

defineOptions({
  name: 'MessageManagementTemplatePage'
});

interface TemplateFormExpose {
  validate?: () => Promise<boolean> | boolean;
  clearValidate?: () => void;
  resetFields?: () => void;
}

const loading = ref(false);
const rows = ref<MessageTemplateRecord[]>([]);
const categories = ref<MessageCategoryRecord[]>([]);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const searchForm = reactive<{
  title: string;
  cateId: string;
}>({
  title: '',
  cateId: ''
});

const dialogVisible = ref(false);
const dialogMode = ref<'add' | 'edit' | 'detail'>('add');
const dialogSubmitting = ref(false);
const dialogDetailLoading = ref(false);
const dialogFormRef = ref<TemplateFormExpose>();
const dialogForm = ref<MessageTemplateFormModel>(createDefaultFormModel());

const listGuard = createLatestRequestGuard();
const detailGuard = createLatestRequestGuard();

const tableColumns: TableColumnList = [
  {
    label: '模板名称',
    prop: 'title',
    minWidth: 220
  },
  {
    label: '消息分类',
    prop: 'cateName',
    minWidth: 160
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
    label: '修改时间',
    prop: 'updateTime',
    minWidth: 180
  },
  {
    label: '操作',
    width: 260,
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
    return '新增模板';
  }
  if (dialogMode.value === 'edit') {
    return '编辑模板';
  }
  return '查看模板';
});

const dialogReadonly = computed(() => dialogMode.value === 'detail');

function createDefaultFormModel(): MessageTemplateFormModel {
  return {
    id: '',
    title: '',
    cateId: '',
    content: ''
  };
}

function normalizeTemplateFormModel(
  record?: MessageTemplateRecord | null
): MessageTemplateFormModel {
  return {
    id: record?.id || '',
    title: record?.title || '',
    cateId: record?.cateId || '',
    content: record?.content || ''
  };
}

function buildPayload(): MessageTemplatePayload {
  return {
    id: dialogForm.value.id || undefined,
    title: dialogForm.value.title.trim(),
    cateId: dialogForm.value.cateId || undefined,
    content: dialogForm.value.content.trim() || undefined
  };
}

async function loadCategories() {
  try {
    const response = await messageTemplateApi.categoryList();
    if (response.code !== 200) {
      throw new Error(response.message || '加载消息分类失败');
    }
    categories.value = normalizePageRecords(response.data) as MessageCategoryRecord[];
  } catch (error) {
    message.error(getErrorMessage(error, '加载消息分类失败'));
  }
}

async function loadList(page = currentPage.value) {
  const token = listGuard.next();
  loading.value = true;
  currentPage.value = page;

  try {
    const response = await messageTemplateApi.page({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      title: searchForm.title.trim() || undefined,
      cateId: searchForm.cateId || undefined
    });

    if (!listGuard.isLatest(token)) {
      return;
    }

    if (response.code !== 200) {
      throw new Error(response.message || '加载模板列表失败');
    }

    rows.value = normalizePageRecords(response.data) as MessageTemplateRecord[];
    total.value = normalizePageTotal(response.data);
  } catch (error) {
    if (!listGuard.isLatest(token)) {
      return;
    }
    rows.value = [];
    total.value = 0;
    message.error(getErrorMessage(error, '加载模板列表失败'));
  } finally {
    if (listGuard.isLatest(token)) {
      loading.value = false;
    }
  }
}

function tableSearch(keyword: string) {
  searchForm.title = keyword;
  void loadList(1);
}

function onKeywordUpdate(keyword: string) {
  searchForm.title = keyword;
}

function onResetSearch() {
  searchForm.title = '';
  searchForm.cateId = '';
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

async function openEdit(row: MessageTemplateRecord) {
  dialogMode.value = 'edit';
  dialogVisible.value = true;
  await loadDetail(row.id);
}

async function openDetail(row: MessageTemplateRecord) {
  dialogMode.value = 'detail';
  dialogVisible.value = true;
  await loadDetail(row.id);
}

async function loadDetail(id: string) {
  dialogDetailLoading.value = true;
  dialogForm.value = createDefaultFormModel();
  const token = detailGuard.next();

  try {
    const response = await messageTemplateApi.detail(id);
    if (!detailGuard.isLatest(token)) {
      return;
    }

    if (response.code !== 200) {
      throw new Error(response.message || '加载模板详情失败');
    }

    dialogForm.value = normalizeTemplateFormModel(response.data);
    dialogFormRef.value?.clearValidate?.();
  } catch (error) {
    if (!detailGuard.isLatest(token)) {
      return;
    }
    dialogVisible.value = false;
    message.error(getErrorMessage(error, '加载模板详情失败'));
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
        ? await messageTemplateApi.create({
            title: payload.title,
            cateId: payload.cateId,
            content: payload.content
          })
        : await messageTemplateApi.update(payload);

    if (response.code !== 200) {
      throw new Error(response.message || '保存模板失败');
    }

    message.success(dialogMode.value === 'add' ? '新增成功' : '更新成功');
    closeDialog();
    await loadList(dialogMode.value === 'add' ? 1 : currentPage.value);
  } catch (error) {
    message.error(getErrorMessage(error, '保存模板失败'));
  } finally {
    dialogSubmitting.value = false;
  }
}

async function removeRow(row: MessageTemplateRecord) {
  try {
    await confirm.warn(`确认删除模板“${row.title || '--'}”吗？`, '删除确认');
  } catch {
    return;
  }

  try {
    const response = await messageTemplateApi.remove(row.id);
    if (response.code !== 200) {
      throw new Error(response.message || '删除模板失败');
    }

    message.success('删除成功');
    const nextPage =
      rows.value.length <= 1 && currentPage.value > 1 ? currentPage.value - 1 : currentPage.value;
    await loadList(nextPage);
  } catch (error) {
    message.error(getErrorMessage(error, '删除模板失败'));
  }
}

onMounted(() => {
  void loadCategories();
  void loadList(1);
});
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="消息模板"
      :columns="tableColumns"
      placeholder="请输入模板名称"
      :keyword="searchForm.title"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
      <template #buttons>
        <el-button @click="loadCategories">刷新分类</el-button>
        <el-button type="primary" @click="openCreate">新增模板</el-button>
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

      <template #drawer>
        <el-form label-position="top" class="message-template-page__drawer-form">
          <el-form-item label="消息分类">
            <el-select v-model="searchForm.cateId" clearable placeholder="全部分类">
              <el-option
                v-for="item in categories"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
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
    :dialog-width="820"
    @confirm="submitDialog"
    @cancel="closeDialog"
    @close="closeDialog"
  >
    <MessageTemplateEditForm
      ref="dialogFormRef"
      v-model="dialogForm"
      :disabled="dialogReadonly || dialogDetailLoading"
      :categories="categories"
    />
  </ObCrudContainer>
</template>

<style scoped>
.message-template-page__drawer-form {
  padding: 8px 0;
}
</style>
