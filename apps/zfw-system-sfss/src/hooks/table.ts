import { reactive, ref, onMounted } from 'vue';
import { message } from '@one-base-template/ui';
import useLoading from '@/hooks/loading';
/* oxlint-disable @typescript-eslint/no-explicit-any */

interface TableHookOptions {
  searchApi?: (params?: Record<string, unknown>) => Promise<unknown>;
  searchFn?: () => void | Promise<void>;
  searchForm?: Record<string, unknown>;
  paginationFlag?: boolean;
  deleteApi?: (payload: unknown) => Promise<{ code?: number }>;
}

interface PaginationState {
  total: number;
  pageSize: number;
  currentPage: number;
  background: boolean;
}

function cleanupEmptyParams(params: Record<string, unknown>) {
  const next = { ...params };
  for (const key of Object.keys(next)) {
    if (next[key] === '' || next[key] === null || next[key] === undefined) {
      delete next[key];
    }
  }
  return next;
}

export default function useTable(opt: TableHookOptions = {}, tableRef?: { value?: any }) {
  const { loading, setLoading } = useLoading();
  const dataList = ref<any[]>([]);
  const selectedList = ref<any[]>([]);
  const selectedNum = ref(0);
  const pagination = reactive<PaginationState>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  function handleSelectionChange(val: any[]) {
    selectedList.value = Array.isArray(val) ? val : [];
    selectedNum.value = selectedList.value.length;
    tableRef?.value?.setAdaptive?.();
  }

  function onSelectionCancel() {
    selectedNum.value = 0;
    selectedList.value = [];
    tableRef?.value?.getTableRef?.()?.clearSelection?.();
  }

  function resetForm(formEl?: { resetFields?: () => void }, clearKey = '') {
    formEl?.resetFields?.();
    if (clearKey && opt.searchForm) {
      opt.searchForm[clearKey] = '';
    }
    void onSearch();
  }

  async function onSearch() {
    if (opt.searchFn) {
      await opt.searchFn();
      return;
    }
    if (!opt.searchApi) {
      return;
    }

    const searchForm = opt.searchForm ?? {};
    const rawParams = opt.paginationFlag
      ? {
          page: pagination.currentPage,
          size: pagination.pageSize,
          ...searchForm
        }
      : { ...searchForm };
    const params = cleanupEmptyParams(rawParams);

    try {
      setLoading(true);
      const res = (await opt.searchApi(params)) as any;
      if (!res || typeof res !== 'object') {
        return;
      }
      if (res.code !== 1 && res.code !== 200) {
        return;
      }

      const payload = res.data;
      if (opt.paginationFlag) {
        if (Array.isArray(payload?.list)) {
          dataList.value = payload.list;
          pagination.total = Number(payload.total ?? 0);
          pagination.pageSize = Number(payload.size ?? pagination.pageSize);
        } else if (Array.isArray(payload)) {
          dataList.value = payload;
          pagination.total = payload.length;
        }
      } else {
        dataList.value = Array.isArray(payload) ? payload : [];
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = Number(val || 10);
    void onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = Number(val || 1);
    void onSearch();
  }

  async function onDelete(data: unknown) {
    if (!opt.deleteApi) {
      return;
    }
    const res = await opt.deleteApi(data);
    if (res?.code === 200 || res?.code === 1) {
      message.success('删除成功');
      await onSearch();
    }
  }

  onMounted(() => {
    void onSearch();
  });

  return {
    loading,
    dataList,
    pagination,
    selectedNum,
    selectedList,
    onSearch,
    resetForm,
    handleSelectionChange,
    onSelectionCancel,
    handleSizeChange,
    handleCurrentChange,
    onDelete
  };
}
