import { reactive, ref } from "vue";
import { useTable } from "@one-base-template/core";
import { message } from "@/utils/message";
import sysLogColumns from "../columns";
import { sysLogApi, type SysLogRecord } from "../api";

interface SearchRefExpose {
  resetFields?: () => void;
}

interface SysLogSearchForm {
  operator: string;
  clientIp: string;
  module: string;
  operationType: string;
  operationResult: number | string;
  userAccount: string;
  nickName: string;
  browserName: string;
  clientOS: string;
  tenantId: string;
  time: string[];
}

const SUCCESS_CODE = 200;
const DETAIL_ERROR_MESSAGE = "获取操作日志详情失败";
const DELETE_ERROR_MESSAGE = "删除操作日志失败";
const DEFAULT_SYS_LOG_SEARCH_FORM: SysLogSearchForm = {
  operator: "",
  clientIp: "",
  module: "",
  operationType: "",
  operationResult: "",
  userAccount: "",
  nickName: "",
  browserName: "",
  clientOS: "",
  tenantId: "",
  time: [],
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function isConfirmCanceled(error: unknown): boolean {
  return error === "cancel" || error === "close";
}

async function fetchSysLogDetail(id: string): Promise<SysLogRecord> {
  const response = await sysLogApi.detail({ id });
  if (response.code !== SUCCESS_CODE) {
    throw new Error(response.message || DETAIL_ERROR_MESSAGE);
  }

  return response.data;
}

async function deleteSysLog(id: string): Promise<void> {
  const response = await sysLogApi.remove({ idList: [id] });
  if (response.code !== SUCCESS_CODE) {
    throw new Error(response.message || DELETE_ERROR_MESSAGE);
  }
}

async function confirmDeleteSysLog(userAccount: string): Promise<boolean> {
  try {
    await obConfirm.warn(`是否确认删除操作人账号为${userAccount}的这条数据`, "删除确认");
    return true;
  } catch (error) {
    if (isConfirmCanceled(error)) {
      return false;
    }

    throw error;
  }
}

function useSysLogTableState(tableRef: ReturnType<typeof ref>, searchRef: ReturnType<typeof ref<SearchRefExpose>>) {
  const searchForm = reactive({ ...DEFAULT_SYS_LOG_SEARCH_FORM });
  const tableOpt = reactive({
    query: {
      api: sysLogApi.list,
      params: searchForm,
      pagination: true,
    },
  });
  const { loading, dataList, pagination, onSearch, resetForm, handleSizeChange, handleCurrentChange } = useTable(
    tableOpt,
    tableRef
  );

  const tableSearch = async (keyword: string) => {
    searchForm.operator = keyword;
    await onSearch();
  };
  const onKeywordUpdate = (keyword: string) => {
    searchForm.operator = keyword;
  };
  const onResetSearch = () => {
    resetForm(searchRef, "operator");
  };

  return {
    loading,
    dataList,
    pagination,
    tableColumns: sysLogColumns,
    searchForm,
    onSearch,
    handleSizeChange,
    handleCurrentChange,
    tableSearch,
    onKeywordUpdate,
    onResetSearch,
  };
}

function useSysLogDetailState(onSearch: (resetPage?: boolean) => Promise<unknown>) {
  const detailVisible = ref(false);
  const detailLoading = ref(false);
  const detailData = ref<SysLogRecord | null>(null);

  const openDetail = async (row: SysLogRecord) => {
    detailVisible.value = true;
    detailLoading.value = true;

    try {
      detailData.value = await fetchSysLogDetail(row.id);
    } catch (error) {
      message.error(getErrorMessage(error, DETAIL_ERROR_MESSAGE));
      detailVisible.value = false;
    } finally {
      detailLoading.value = false;
    }
  };

  const handleDelete = async (row: SysLogRecord) => {
    const confirmed = await confirmDeleteSysLog(row.userAccount);
    if (!confirmed) {
      return;
    }

    try {
      await deleteSysLog(row.id);
      message.success("删除操作日志成功");
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
    handleDelete,
  };
}

export function useSysLogPageState() {
  const tableRef = ref<unknown>(null);
  const searchRef = ref<SearchRefExpose>();
  const tableState = useSysLogTableState(tableRef, searchRef);
  const detailState = useSysLogDetailState(tableState.onSearch);

  return {
    refs: {
      tableRef,
      searchRef,
    },
    table: {
      loading: tableState.loading,
      dataList: tableState.dataList,
      pagination: tableState.pagination,
      tableColumns: tableState.tableColumns,
      searchForm: tableState.searchForm,
    },
    detail: {
      detailVisible: detailState.detailVisible,
      detailLoading: detailState.detailLoading,
      detailData: detailState.detailData,
    },
    actions: {
      tableSearch: tableState.tableSearch,
      onKeywordUpdate: tableState.onKeywordUpdate,
      onResetSearch: tableState.onResetSearch,
      handleSizeChange: tableState.handleSizeChange,
      handleCurrentChange: tableState.handleCurrentChange,
      openDetail: detailState.openDetail,
      handleDelete: detailState.handleDelete,
    },
  };
}
