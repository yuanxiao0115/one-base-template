import { computed, reactive, ref } from 'vue';
import type { CrudFormLike } from '@one-base-template/ui';
import { useCrudPage } from '@one-base-template/core';
import { message, obConfirm } from '@one-base-template/ui';
import tenantInfoColumns from '../columns';
import { tenantInfoApi } from '../api';
import {
  createTenantInfoForm,
  toTenantInfoForm,
  toTenantInfoPayload,
  tenantInfoFormRules
} from '../form';
import type { TenantInfoForm, TenantInfoRecord, TenantInfoSavePayload } from '../types';
import { shouldCheckTenantUnique, toTenantUniqueSnapshot } from '../utils/tenantUnique';

interface SearchRefExpose {
  resetFields?: () => void;
}

interface TenantUniqueCheckParams {
  id?: string;
  tenantName?: string;
  contactPhone?: string;
}

function isConfirmCancelled(error: unknown): boolean {
  return error === 'cancel' || error === 'close';
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useTenantInfoPageState() {
  const tableRef = ref<unknown>(null);
  const searchRef = ref<SearchRefExpose>();
  const editFormRef = ref<CrudFormLike>();
  const tenantUniqueSnapshot = ref<ReturnType<typeof toTenantUniqueSnapshot> | null>(null);

  const permissionVisible = ref(false);
  const permissionTenantId = ref('');
  const permissionTenantName = ref('');

  const searchForm = reactive({
    tenantName: '',
    id: '',
    contactName: '',
    tenantState: '' as string | number
  });

  const tableOpt = reactive({
    query: {
      api: tenantInfoApi.page,
      params: searchForm,
      pagination: true
    },
    remove: {
      api: async (payload: { id: string }) => tenantInfoApi.remove({ idList: payload.id }),
      deleteConfirm: {
        nameKey: 'tenantName',
        title: '删除确认',
        message: '是否确认删除名称为「{name}」的这条数据'
      },
      onSuccess: () => {
        message.success('删除成功');
      },
      onError: (error: unknown) => {
        message.error(getErrorMessage(error, '删除租户失败'));
      }
    }
  });

  const crudPage = useCrudPage<
    TenantInfoForm,
    TenantInfoRecord,
    TenantInfoRecord,
    TenantInfoSavePayload
  >({
    table: tableOpt,
    tableRef,
    editor: {
      entity: {
        name: '租户'
      },
      form: {
        create: () => createTenantInfoForm(),
        ref: editFormRef
      },
      detail: {
        beforeOpen: async ({ mode }) => {
          if (mode === 'create') {
            tenantUniqueSnapshot.value = null;
          }
        },
        load: async ({ row }) => row,
        mapToForm: ({ detail }) => {
          const mapped = toTenantInfoForm(detail);
          tenantUniqueSnapshot.value = toTenantUniqueSnapshot(mapped);
          return mapped;
        }
      },
      save: {
        buildPayload: async ({ form }) => {
          const payload = toTenantInfoPayload(form);
          const currentUnique = toTenantUniqueSnapshot(payload);

          if (shouldCheckTenantUnique(currentUnique, tenantUniqueSnapshot.value)) {
            const response = await tenantInfoApi.checkUnique({
              id: payload.id,
              tenantName: payload.tenantName,
              contactPhone: payload.contactPhone
            });

            if (response.code !== 200) {
              throw new Error(response.message || '租户唯一性校验失败');
            }

            if (!response.data) {
              throw new Error('租户名称或联系方式已存在');
            }
          }

          return payload;
        },
        request: async ({ mode, payload }) => {
          const response =
            mode === 'create'
              ? await tenantInfoApi.add(payload)
              : await tenantInfoApi.update(payload);

          if (response.code !== 200) {
            throw new Error(response.message || '保存租户失败');
          }

          return response;
        },
        onSuccess: async ({ mode }) => {
          message.success(mode === 'create' ? '新增成功' : '更新成功');
        }
      }
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
  } = crudPage.table;
  const { remove } = crudPage.actions;
  const crud = crudPage.editor;

  const tableColumns = computed(() => tenantInfoColumns);
  const tablePagination = computed(() => ({
    ...pagination
  }));

  const crudVisible = crud.visible;
  const crudMode = crud.mode;
  const crudTitle = crud.title;
  const crudReadonly = crud.readonly;
  const crudSubmitting = crud.submitting;
  const crudForm = crud.form;

  function isTenantEnabled(row: TenantInfoRecord): boolean {
    return (row.tenantState ?? 0) === 0;
  }

  function getTenantStatusType(row: TenantInfoRecord): 'success' | 'danger' | 'warning' {
    const value = row.tenantState ?? 0;
    if (value === 0) {
      return 'success';
    }
    if (value === 1) {
      return 'danger';
    }
    return 'warning';
  }

  function getTenantStatusText(row: TenantInfoRecord): string {
    const value = row.tenantState ?? 0;
    if (value === 0) {
      return '正常';
    }
    if (value === 1) {
      return '停用';
    }
    return '过期';
  }

  async function checkFieldUnique(params: TenantUniqueCheckParams): Promise<boolean> {
    const currentUnique = toTenantUniqueSnapshot(params);
    if (params.id && !shouldCheckTenantUnique(currentUnique, tenantUniqueSnapshot.value)) {
      return true;
    }

    const response = await tenantInfoApi.checkUnique(params);
    if (response.code !== 200) {
      throw new Error(response.message || '租户唯一性校验失败');
    }

    return Boolean(response.data);
  }

  function tableSearch(keyword: string) {
    searchForm.tenantName = keyword;
    void onSearch();
  }

  function onKeywordUpdate(keyword: string) {
    searchForm.tenantName = keyword;
  }

  function onResetSearch() {
    searchForm.tenantState = '';
    resetForm(searchRef, 'tenantName');
  }

  async function openCreate() {
    await crud.openCreate();
  }

  async function openEdit(row: TenantInfoRecord) {
    await crud.openEdit(row);
  }

  async function openDetail(row: TenantInfoRecord) {
    await crud.openDetail(row);
  }

  function openPermission(row: TenantInfoRecord) {
    permissionVisible.value = true;
    permissionTenantId.value = row.id;
    permissionTenantName.value = row.tenantName ?? '';
  }

  function onPermissionDialogChange(visible: boolean) {
    if (visible) {
      return;
    }

    permissionTenantId.value = '';
    permissionTenantName.value = '';
  }

  async function handleToggleStatus(row: TenantInfoRecord) {
    const nextEnable = !isTenantEnabled(row);
    const actionText = nextEnable ? '启用' : '停用';

    try {
      await obConfirm.warn(
        `您确定要${actionText}租户${row.tenantName || ''}吗？`,
        `${actionText}确认`
      );

      const response = await tenantInfoApi.deactivate({
        ids: String(row.id),
        isEnable: nextEnable
      });

      if (response.code !== 200) {
        throw new Error(response.message || `${actionText}租户失败`);
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

  async function handleDelete(row: TenantInfoRecord) {
    await remove(row);
  }

  async function handlePermissionSaved() {
    await onSearch(false);
  }

  return {
    refs: {
      tableRef,
      searchRef,
      editFormRef
    },
    table: {
      loading,
      dataList,
      tableColumns,
      tablePagination,
      searchForm
    },
    editor: {
      crud,
      crudVisible,
      crudMode,
      crudTitle,
      crudReadonly,
      crudSubmitting,
      crudForm,
      tenantInfoFormRules,
      checkFieldUnique
    },
    dialogs: {
      permissionVisible,
      permissionTenantId,
      permissionTenantName
    },
    actions: {
      tableSearch,
      onKeywordUpdate,
      onResetSearch,
      handleSizeChange,
      handleCurrentChange,
      openCreate,
      openEdit,
      openDetail,
      openPermission,
      onPermissionDialogChange,
      handleToggleStatus,
      handleDelete,
      handlePermissionSaved,
      getTenantStatusType,
      getTenantStatusText,
      isTenantEnabled
    }
  };
}
