<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import type { TableColumnList } from '@one-base-template/ui';
import { message } from '@one-base-template/ui';
import { messageHistoryApi } from './api';
import MessageHistoryDetail from './components/MessageHistoryDetail.vue';
import type { MessageCategoryRecord, MessageHistoryRecord } from './types';
import { createLatestRequestGuard } from '../shared/latestRequest';
import { getErrorMessage, normalizePageRecords, normalizePageTotal } from '../shared/utils';

defineOptions({
  name: 'MessageManagementHistoryPage'
});

const loading = ref(false);
const rows = ref<MessageHistoryRecord[]>([]);
const categories = ref<MessageCategoryRecord[]>([]);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const searchForm = reactive<{
  title: string;
  cateId: string;
  sendType: '' | 0 | 1 | 2;
}>({
  title: '',
  cateId: '',
  sendType: ''
});

const detailVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref<MessageHistoryRecord | null>(null);

const listGuard = createLatestRequestGuard();
const detailGuard = createLatestRequestGuard();

const tableColumns: TableColumnList = [
  {
    label: '消息标题',
    prop: 'title',
    minWidth: 240
  },
  {
    label: '分类',
    prop: 'cateName',
    minWidth: 140
  },
  {
    label: '发送类型',
    prop: 'sendType',
    minWidth: 120,
    slot: 'sendType'
  },
  {
    label: '发送时间',
    prop: 'createTime',
    minWidth: 180
  },
  {
    label: '操作',
    width: 120,
    align: 'right',
    fixed: 'right',
    slot: 'operation'
  }
];

const tablePagination = computed(() => ({
  currentPage: currentPage.value,
  pageSize: pageSize.value,
  total: total.value
}));

function getSendTypeLabel(sendType?: number) {
  if (sendType === 0) {
    return '定时发送';
  }
  if (sendType === 2) {
    return '周期发送';
  }
  return '立即发送';
}

async function loadCategories() {
  try {
    const response = await messageHistoryApi.categoryList();
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
    const response = await messageHistoryApi.page({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      title: searchForm.title.trim() || undefined,
      cateId: searchForm.cateId || undefined,
      sendType: searchForm.sendType === '' ? undefined : searchForm.sendType
    });

    if (!listGuard.isLatest(token)) {
      return;
    }

    if (response.code !== 200) {
      throw new Error(response.message || '加载发件箱失败');
    }

    rows.value = normalizePageRecords(response.data) as MessageHistoryRecord[];
    total.value = normalizePageTotal(response.data);
  } catch (error) {
    if (!listGuard.isLatest(token)) {
      return;
    }
    rows.value = [];
    total.value = 0;
    message.error(getErrorMessage(error, '加载发件箱失败'));
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
  searchForm.sendType = '';
  void loadList(1);
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  void loadList(1);
}

function handlePageCurrentChange(page: number) {
  void loadList(page);
}

async function openDetail(row: MessageHistoryRecord) {
  detailVisible.value = true;
  detailLoading.value = true;
  detailData.value = null;
  const token = detailGuard.next();

  try {
    const response = await messageHistoryApi.detail(row.id);
    if (!detailGuard.isLatest(token)) {
      return;
    }

    if (response.code !== 200) {
      throw new Error(response.message || '加载详情失败');
    }

    detailData.value = response.data;
  } catch (error) {
    if (!detailGuard.isLatest(token)) {
      return;
    }
    detailVisible.value = false;
    message.error(getErrorMessage(error, '加载详情失败'));
  } finally {
    if (detailGuard.isLatest(token)) {
      detailLoading.value = false;
    }
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
      title="发件箱"
      :columns="tableColumns"
      placeholder="请输入消息标题"
      :keyword="searchForm.title"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
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
          <template #sendType="{ row }">{{ getSendTypeLabel(row.sendType) }}</template>

          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="openDetail(row)"
                >查看</el-button
              >
            </ObActionButtons>
          </template>
        </ObTable>
      </template>

      <template #drawer>
        <el-form label-position="top" class="message-history-page__drawer-form">
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
          <el-form-item label="发送类型">
            <el-select v-model="searchForm.sendType" clearable placeholder="全部类型">
              <el-option :value="1" label="立即发送" />
              <el-option :value="0" label="定时发送" />
              <el-option :value="2" label="周期发送" />
            </el-select>
          </el-form-item>
        </el-form>
      </template>
    </ObTableBox>
  </ObPageContainer>

  <ObCrudContainer
    v-model="detailVisible"
    container="dialog"
    mode="detail"
    title="发件详情"
    :show-confirm-button="false"
    :show-cancel-button="false"
    :dialog-width="860"
    @close="detailVisible = false"
  >
    <MessageHistoryDetail :detail="detailData" :loading="detailLoading" />
  </ObCrudContainer>
</template>

<style scoped>
.message-history-page__drawer-form {
  padding: 8px 0;
}
</style>
