import { onMounted, reactive, ref } from 'vue';
import { useTable } from '@one-base-template/core';
import { message } from '@one-base-template/ui';
import loginLogColumns from '../columns';
import { loginLogApi } from '../api';
import type { ClientTypeOption, LoginLogRecord } from '../types';

interface SearchRefExpose {
  resetFields?: () => void;
}

interface LoginLogSearchForm {
  nickName: string;
  clientType: string;
  time: string[];
}

const SUCCESS_CODE = 200;
const DETAIL_ERROR_MESSAGE = '获取登录日志详情失败';
const DELETE_ERROR_MESSAGE = '删除登录日志失败';
const DEFAULT_LOGIN_LOG_SEARCH_FORM: LoginLogSearchForm = {
  nickName: '',
  clientType: '',
  time: []
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function isConfirmCanceled(error: unknown): boolean {
  return error === 'cancel' || error === 'close';
}

async function fetchLoginLogDetail(id: string): Promise<LoginLogRecord> {
  const response = await loginLogApi.detail({ id });
  if (response.code !== SUCCESS_CODE) {
    throw new Error(response.message || DETAIL_ERROR_MESSAGE);
  }

  return response.data;
}

async function deleteLoginLog(id: string): Promise<void> {
  const response = await loginLogApi.remove({ idList: [id] });
  if (response.code !== SUCCESS_CODE) {
    throw new Error(response.message || DELETE_ERROR_MESSAGE);
  }
}

async function confirmDeleteLoginLog(userAccount: string): Promise<boolean> {
  try {
    await obConfirm.warn(`是否确认删除登录账号为${userAccount}的这条数据`, '删除确认');
    return true;
  } catch (error) {
    if (isConfirmCanceled(error)) {
      return false;
    }

    throw error;
  }
}

function useLoginLogTableState(
  tableRef: ReturnType<typeof ref>,
  searchRef: ReturnType<typeof ref<SearchRefExpose>>
) {
  const searchForm = reactive({ ...DEFAULT_LOGIN_LOG_SEARCH_FORM });
  const tableOpt = reactive({
    query: {
      api: loginLogApi.list,
      params: searchForm,
      pagination: true
    }
  });
  const {
    loading,
    dataList,
    pagination,
    onSearch,
    resetForm,
    handleSizeChange,
    handleCurrentChange
  } = useTable(tableOpt, tableRef);

  const tableSearch = async (keyword: string) => {
    searchForm.nickName = keyword;
    await onSearch();
  };
  const onKeywordUpdate = (keyword: string) => {
    searchForm.nickName = keyword;
  };
  const onResetSearch = () => {
    resetForm(searchRef, 'nickName');
  };

  return {
    loading,
    dataList,
    pagination,
    tableColumns: loginLogColumns,
    searchForm,
    onSearch,
    handleSizeChange,
    handleCurrentChange,
    tableSearch,
    onKeywordUpdate,
    onResetSearch
  };
}

function useLoginLogDetailState(onSearch: (resetPage?: boolean) => Promise<unknown>) {
  const detailVisible = ref(false);
  const detailLoading = ref(false);
  const detailData = ref<LoginLogRecord | null>(null);

  const openDetail = async (row: LoginLogRecord) => {
    detailVisible.value = true;
    detailLoading.value = true;

    try {
      detailData.value = await fetchLoginLogDetail(row.id);
    } catch (error) {
      message.error(getErrorMessage(error, DETAIL_ERROR_MESSAGE));
      detailVisible.value = false;
    } finally {
      detailLoading.value = false;
    }
  };

  const handleDelete = async (row: LoginLogRecord) => {
    const confirmed = await confirmDeleteLoginLog(row.userAccount);
    if (!confirmed) {
      return;
    }

    try {
      await deleteLoginLog(row.id);
      message.success('删除登录日志成功');
      await onSearch(false);
    } catch (error) {
      message.error(getErrorMessage(error, DELETE_ERROR_MESSAGE));
    }
  };

  return {
    detailVisible,
    detailLoading,
    detailData,
    openDetail,
    handleDelete
  };
}

function useClientTypeState() {
  const clientTypeList = ref<ClientTypeOption[]>([]);

  const loadClientTypes = async () => {
    try {
      const response = await loginLogApi.getEnum();
      if (response.code !== SUCCESS_CODE) {
        throw new Error(response.message || '获取客户端类型失败');
      }

      clientTypeList.value = response.data;
    } catch {
      clientTypeList.value = [];
    }
  };

  return {
    clientTypeList,
    loadClientTypes
  };
}

export function useLoginLogPageState() {
  const tableRef = ref<unknown>(null);
  const searchRef = ref<SearchRefExpose>();
  const tableState = useLoginLogTableState(tableRef, searchRef);
  const detailState = useLoginLogDetailState(tableState.onSearch);
  const clientTypeState = useClientTypeState();

  onMounted(() => {
    clientTypeState.loadClientTypes().catch(() => null);
  });

  return {
    refs: {
      tableRef,
      searchRef
    },
    table: {
      loading: tableState.loading,
      dataList: tableState.dataList,
      pagination: tableState.pagination,
      tableColumns: tableState.tableColumns,
      searchForm: tableState.searchForm,
      clientTypeList: clientTypeState.clientTypeList
    },
    detail: {
      detailVisible: detailState.detailVisible,
      detailLoading: detailState.detailLoading,
      detailData: detailState.detailData
    },
    actions: {
      tableSearch: tableState.tableSearch,
      onKeywordUpdate: tableState.onKeywordUpdate,
      onResetSearch: tableState.onResetSearch,
      handleSizeChange: tableState.handleSizeChange,
      handleCurrentChange: tableState.handleCurrentChange,
      openDetail: detailState.openDetail,
      handleDelete: detailState.handleDelete
    }
  };
}
