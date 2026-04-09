<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import type { TableColumnList } from '@one-base-template/ui';
import { confirm, message } from '@one-base-template/ui';
import { messageReceiveApi } from './api';
import MessageReceiveDetail from './components/MessageReceiveDetail.vue';
import type { MessageCategoryRecord, MessageReceiveRecord } from './types';
import { createLatestRequestGuard } from '../shared/latestRequest';
import { getErrorMessage, normalizePageRecords, normalizePageTotal } from '../shared/utils';

defineOptions({
  name: 'MessageManagementReceivePage'
});

const loading = ref(false);
const rows = ref<MessageReceiveRecord[]>([]);
const selectedRows = ref<MessageReceiveRecord[]>([]);
const categories = ref<MessageCategoryRecord[]>([]);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const searchForm = reactive<{
  title: string;
  cateId: string;
  read: '' | 'read' | 'unread';
}>({
  title: '',
  cateId: '',
  read: ''
});

const detailVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref<MessageReceiveRecord | null>(null);

const listGuard = createLatestRequestGuard();
const detailGuard = createLatestRequestGuard();

const tableColumns: TableColumnList = [
  {
    type: 'selection',
    width: 52
  },
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
    label: '发送人',
    prop: 'senderName',
    minWidth: 140
  },
  {
    label: '状态',
    prop: 'readTime',
    minWidth: 100,
    slot: 'readStatus'
  },
  {
    label: '创建时间',
    prop: 'createTime',
    minWidth: 180
  },
  {
    label: '操作',
    width: 320,
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

async function loadCategories() {
  try {
    const response = await messageReceiveApi.categoryList();
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
    const response = await messageReceiveApi.page({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      title: searchForm.title.trim() || undefined,
      cateId: searchForm.cateId || undefined,
      read: searchForm.read === '' ? undefined : searchForm.read === 'read',
      ascFlag: 0
    });

    if (!listGuard.isLatest(token)) {
      return;
    }

    if (response.code !== 200) {
      throw new Error(response.message || '加载消息列表失败');
    }

    rows.value = normalizePageRecords(response.data) as MessageReceiveRecord[];
    total.value = normalizePageTotal(response.data);
  } catch (error) {
    if (!listGuard.isLatest(token)) {
      return;
    }
    rows.value = [];
    total.value = 0;
    message.error(getErrorMessage(error, '加载消息列表失败'));
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
  searchForm.read = '';
  void loadList(1);
}

function handleSelectionChange(selection: MessageReceiveRecord[]) {
  selectedRows.value = selection;
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  void loadList(1);
}

function handlePageCurrentChange(page: number) {
  void loadList(page);
}

async function openDetail(row: MessageReceiveRecord) {
  detailVisible.value = true;
  detailLoading.value = true;
  detailData.value = null;
  const token = detailGuard.next();

  try {
    const response = await messageReceiveApi.detail(row.id);
    if (!detailGuard.isLatest(token)) {
      return;
    }

    if (response.code !== 200) {
      throw new Error(response.message || '加载消息详情失败');
    }

    detailData.value = response.data;
    if (!response.data.readTime) {
      await updateReadState([row.id], true, false);
    }
  } catch (error) {
    if (!detailGuard.isLatest(token)) {
      return;
    }
    detailVisible.value = false;
    message.error(getErrorMessage(error, '加载消息详情失败'));
  } finally {
    if (detailGuard.isLatest(token)) {
      detailLoading.value = false;
    }
  }
}

async function updateReadState(ids: string[], read: boolean, notify = true) {
  if (ids.length === 0) {
    return;
  }

  try {
    const response = await messageReceiveApi.update({
      ids,
      read
    });
    if (response.code !== 200) {
      throw new Error(response.message || '更新状态失败');
    }

    if (notify) {
      message.success(read ? '标记已读成功' : '标记未读成功');
    }
    await loadList();
  } catch (error) {
    message.error(getErrorMessage(error, '更新状态失败'));
  }
}

async function toggleStar(row: MessageReceiveRecord) {
  try {
    const response = await messageReceiveApi.update({
      id: row.id,
      star: row.star === 1 ? 0 : 1
    });
    if (response.code !== 200) {
      throw new Error(response.message || '星标更新失败');
    }
    message.success('星标状态已更新');
    await loadList();
  } catch (error) {
    message.error(getErrorMessage(error, '星标更新失败'));
  }
}

async function toggleImportant(row: MessageReceiveRecord) {
  try {
    const response = await messageReceiveApi.update({
      id: row.id,
      important: row.important === 1 ? 0 : 1
    });
    if (response.code !== 200) {
      throw new Error(response.message || '重要标记更新失败');
    }
    message.success('重要标记已更新');
    await loadList();
  } catch (error) {
    message.error(getErrorMessage(error, '重要标记更新失败'));
  }
}

async function removeRows(targetRows: MessageReceiveRecord[]) {
  const ids = targetRows.map((item) => item.id).filter(Boolean);
  if (ids.length === 0) {
    return;
  }

  try {
    await confirm.warn(`确认删除选中的 ${ids.length} 条消息吗？`, '删除确认');
  } catch {
    return;
  }

  try {
    const response = await messageReceiveApi.batchDelete(ids);
    if (response.code !== 200) {
      throw new Error(response.message || '删除失败');
    }
    message.success('删除成功');
    const nextPage =
      rows.value.length <= ids.length && currentPage.value > 1
        ? currentPage.value - 1
        : currentPage.value;
    await loadList(nextPage);
  } catch (error) {
    message.error(getErrorMessage(error, '删除失败'));
  }
}

function markBatchRead(read: boolean) {
  const ids = selectedRows.value.map((item) => item.id).filter(Boolean);
  if (ids.length === 0) {
    message.warning('请先勾选消息');
    return;
  }
  void updateReadState(ids, read);
}

function batchDelete() {
  if (selectedRows.value.length === 0) {
    message.warning('请先勾选消息');
    return;
  }
  void removeRows(selectedRows.value);
}

onMounted(() => {
  void loadCategories();
  void loadList(1);
});
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="消息接收"
      :columns="tableColumns"
      placeholder="请输入消息标题"
      :keyword="searchForm.title"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
      <template #buttons>
        <el-button @click="markBatchRead(true)">批量已读</el-button>
        <el-button @click="markBatchRead(false)">批量未读</el-button>
        <el-button type="danger" @click="batchDelete">批量删除</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObTable
          :size
          :loading="loading"
          :data="rows"
          :columns="dynamicColumns"
          :pagination="tablePagination"
          row-key="id"
          @selection-change="handleSelectionChange"
          @page-size-change="handlePageSizeChange"
          @page-current-change="handlePageCurrentChange"
        >
          <template #readStatus="{ row }">
            <el-tag :type="row.readTime ? 'success' : 'info'">
              {{ row.readTime ? '已读' : '未读' }}
            </el-tag>
          </template>

          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="openDetail(row)"
                >查看</el-button
              >
              <el-button link type="primary" :size="actionSize" @click="toggleStar(row)">
                {{ row.star === 1 ? '取消星标' : '星标' }}
              </el-button>
              <el-button link type="primary" :size="actionSize" @click="toggleImportant(row)">
                {{ row.important === 1 ? '取消重要' : '标记重要' }}
              </el-button>
              <el-button link type="danger" :size="actionSize" @click="removeRows([row])"
                >删除</el-button
              >
            </ObActionButtons>
          </template>
        </ObTable>
      </template>

      <template #drawer>
        <el-form label-position="top" class="message-receive-page__drawer-form">
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
          <el-form-item label="阅读状态">
            <el-select v-model="searchForm.read" clearable placeholder="全部状态">
              <el-option label="已读" value="read" />
              <el-option label="未读" value="unread" />
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
    title="消息详情"
    :show-confirm-button="false"
    :show-cancel-button="false"
    :dialog-width="860"
    @close="detailVisible = false"
  >
    <MessageReceiveDetail :detail="detailData" :loading="detailLoading" />
  </ObCrudContainer>
</template>

<style scoped>
.message-receive-page__drawer-form {
  padding: 8px 0;
}
</style>
