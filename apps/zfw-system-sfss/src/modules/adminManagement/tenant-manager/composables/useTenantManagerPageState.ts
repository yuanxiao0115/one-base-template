import { computed, reactive, ref } from 'vue';
import { useTable } from '@one-base-template/core';
import { message, obConfirm } from '@one-base-template/ui';
import tenantManagerColumns from '../columns';
import { tenantManagerApi } from '../api';
import type { TenantManagerRecord } from '../types';

interface SearchRefExpose {
  resetFields?: () => void;
}

function isConfirmCancelled(error: unknown): boolean {
  return error === 'cancel' || error === 'close';
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useTenantManagerPageState() {
  const tableRef = ref<unknown>(null);
  const searchRef = ref<SearchRefExpose>();

  const searchForm = reactive({
    tenantName: '',
    isEnable: '' as string | boolean
  });

  const tableOpt = reactive({
    query: {
      api: tenantManagerApi.page,
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

  const tableColumns = computed(() => tenantManagerColumns);
  const tablePagination = computed(() => ({
    ...pagination
  }));

  function isEnabled(row: TenantManagerRecord): boolean {
    return row.isEnable === true || Number(row.isEnable ?? 0) === 1;
  }

  function getStatusType(row: TenantManagerRecord): 'success' | 'danger' {
    return isEnabled(row) ? 'success' : 'danger';
  }

  function getStatusText(row: TenantManagerRecord): string {
    return isEnabled(row) ? '正常' : '停用';
  }

  function tableSearch(keyword: string) {
    searchForm.tenantName = keyword;
    void onSearch();
  }

  function onKeywordUpdate(keyword: string) {
    searchForm.tenantName = keyword;
  }

  function onResetSearch() {
    searchForm.isEnable = '';
    resetForm(searchRef, 'tenantName');
  }

  async function handleResetPassword(row: TenantManagerRecord) {
    try {
      await obConfirm.warn('您确认要重置密码（恢复初始系统设置）？', '重置确认');

      const response = await tenantManagerApi.resetPassword({
        id: String(row.id)
      });

      if (response.code !== 200) {
        throw new Error(response.message || '重置密码失败');
      }

      message.success('重置密码成功');
    } catch (error) {
      if (isConfirmCancelled(error)) {
        return;
      }

      message.error(getErrorMessage(error, '重置密码失败'));
    }
  }

  async function handleStatus(row: TenantManagerRecord) {
    const actionText = isEnabled(row) ? '停用' : '启用';

    try {
      await obConfirm.warn(
        `您确认要${actionText}租户管理员${row.userAccount || '--'}？`,
        `${actionText}确认`
      );

      const response = await tenantManagerApi.deactivate({
        ids: [String(row.id)],
        isEnable: !isEnabled(row)
      });

      if (response.code !== 200) {
        throw new Error(response.message || `${actionText}失败`);
      }

      message.success(`${actionText}成功`);
      await onSearch(false);
    } catch (error) {
      if (isConfirmCancelled(error)) {
        return;
      }

      message.error(getErrorMessage(error, '操作失败'));
    }
  }

  return {
    refs: {
      tableRef,
      searchRef
    },
    table: {
      loading,
      dataList,
      tableColumns,
      tablePagination,
      searchForm
    },
    actions: {
      tableSearch,
      onKeywordUpdate,
      onResetSearch,
      handleSizeChange,
      handleCurrentChange,
      handleStatus,
      handleResetPassword,
      isEnabled,
      getStatusType,
      getStatusText
    }
  };
}
