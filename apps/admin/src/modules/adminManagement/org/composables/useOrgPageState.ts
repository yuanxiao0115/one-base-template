import { computed, onMounted, reactive, ref } from 'vue';
import { useAuthStore, useCrudPage } from '@one-base-template/core';
import { message } from '@one-base-template/ui';
import { orgColumns } from '../columns';
import { orgApi } from '../api';
import type { OrgRecord, OrgSavePayload } from '../types';
import { defaultOrgForm, type OrgForm, toOrgForm, toOrgPayload } from '../form';
import {
  assertUniqueCheck,
  type OrgUniqueSnapshot,
  shouldCheckOrgUnique,
  toOrgUniqueSnapshot
} from '../../shared/unique';
import { useOrgTreeQuery } from './useOrgTreeQuery';
import { useOrgTreeOptions } from './useOrgTreeOptions';
import { useOrgDictionaryOptions } from './useOrgDictionaryOptions';
import {
  getDictLabelMap,
  getErrorMessage,
  getRootParentId,
  normalizeTreeRows
} from './orgPageHelpers';

interface SearchRefExpose {
  resetFields?: () => void;
}

export function useOrgPageState() {
  const authStore = useAuthStore();

  const tableRef = ref<unknown>(null);
  const searchRef = ref<SearchRefExpose>();
  const editFormRef = ref();

  const searchForm = reactive({
    orgName: ''
  });

  const createParentId = ref('0');
  const orgUniqueSnapshot = ref<OrgUniqueSnapshot | null>(null);

  const orgManagerVisible = ref(false);
  const orgManagerTarget = ref<OrgRecord | null>(null);
  const orgLevelDialogVisible = ref(false);

  const inSearchMode = computed(() => Boolean(searchForm.orgName.trim()));
  const tableColumns = computed(() => orgColumns);

  const rootParentId = computed(() => {
    return getRootParentId(authStore.user);
  });

  const { orgTreeOptions, loadOrgTreeOptions } = useOrgTreeOptions({
    rootParentId
  });

  const {
    orgCategoryOptions,
    institutionalTypeOptions,
    orgLevelOptions,
    loadDictOptions,
    loadOrgLevelOptions
  } = useOrgDictionaryOptions();

  const tableOpt = reactive({
    query: {
      api: async () => {
        const parentId = rootParentId.value;
        if (inSearchMode.value) {
          return orgApi.searchOrgList({
            parentId,
            orgName: searchForm.orgName
          });
        }

        const response = await orgApi.getOrgTree({ parentId });
        if (response.code !== 200) {
          return response;
        }

        return {
          ...response,
          data: normalizeTreeRows(Array.isArray(response.data) ? response.data : [])
        };
      },
      params: searchForm,
      pagination: false,
      immediate: false
    },
    remove: {
      api: async (payload: { id: string }) => orgApi.deleteOrg(payload),
      deleteConfirm: {
        nameKey: 'orgName',
        requireInput: true,
        title: '删除确认',
        message: '此操作不可逆，请输入组织名称「{name}」确认删除',
        inputPlaceholder: '请输入组织名称',
        confirmButtonText: '确认删除'
      },
      onSuccess: () => {
        message.success('删除组织成功');
        invalidateDeletedRowCache();
      },
      onError: (error: unknown) => {
        clearDeletingRow();
        const errorMessage = error instanceof Error ? error.message : '删除组织失败';
        message.error(errorMessage);
      }
    }
  });

  const crudPage = useCrudPage<OrgForm, OrgRecord, OrgRecord, OrgSavePayload>({
    table: tableOpt,
    tableRef,
    editor: {
      entity: {
        name: '组织'
      },
      form: {
        create: () => ({
          ...defaultOrgForm,
          parentId: rootParentId.value
        }),
        ref: editFormRef
      },
      detail: {
        async beforeOpen({ mode, row, form }) {
          await Promise.all([loadDictOptions(), loadOrgLevelOptions()]);
          await loadOrgTreeOptions(mode === 'create' ? undefined : row?.id);

          if (mode === 'create') {
            orgUniqueSnapshot.value = null;
            form.parentId = createParentId.value || rootParentId.value;
          }
        },
        load: async ({ row }) => row,
        mapToForm: ({ detail }) => {
          const mapped = toOrgForm(detail);
          orgUniqueSnapshot.value = toOrgUniqueSnapshot(mapped);
          return mapped;
        }
      },
      save: {
        buildPayload: async ({ form }) => {
          const payload = toOrgPayload(form, rootParentId.value);
          const currentUnique = toOrgUniqueSnapshot({
            orgName: payload.orgName,
            parentId: payload.parentId
          });

          if (shouldCheckOrgUnique(currentUnique, orgUniqueSnapshot.value)) {
            const uniqueResponse = await orgApi.checkUnique({
              orgName: payload.orgName,
              parentId: payload.parentId,
              orgId: payload.id
            });

            const isUnique = assertUniqueCheck(uniqueResponse, '组织名称校验失败');
            if (!isUnique) {
              throw new Error('已存在相同组织名称');
            }
          }

          return payload;
        },
        request: async ({ mode, payload }) => {
          const response =
            mode === 'create' ? await orgApi.addOrg(payload) : await orgApi.updateOrg(payload);

          if (response.code !== 200) {
            throw new Error(response.message || '保存组织失败');
          }

          return response;
        },
        onSuccess: async ({ mode, payload, row }) => {
          message.success(mode === 'create' ? '新增组织成功' : '更新组织成功');
          await refreshAfterSave({ payload, row });
        }
      }
    },
    behavior: {
      refreshAfterSave: 'none'
    }
  });

  const { loading, dataList, onSearch, resetForm } = crudPage.table;

  const crud = crudPage.editor;
  const { remove } = crudPage.actions;

  const crudVisible = crud.visible;
  const crudMode = crud.mode;
  const crudTitle = crud.title;
  const crudReadonly = crud.readonly;
  const crudSubmitting = crud.submitting;
  const crudForm = crud.form;

  const orgCategoryLabelMap = computed(() => getDictLabelMap(orgCategoryOptions.value));
  const institutionalTypeLabelMap = computed(() => getDictLabelMap(institutionalTypeOptions.value));

  const {
    clearTreeCache,
    loadTreeChildren,
    refreshTreeNode,
    refreshTable,
    markDeletingRow,
    clearDeletingRow,
    clearDeletingRowIfMatched,
    invalidateDeletedRowCache,
    tableSearch,
    onKeywordUpdate,
    onResetSearch
  } = useOrgTreeQuery({
    inSearchMode,
    searchForm,
    searchRef,
    tableRef,
    onSearch,
    resetForm
  });

  const treeConfig = computed<Record<string, unknown> | undefined>(() => {
    if (inSearchMode.value) {
      return undefined;
    }

    return {
      lazy: true,
      children: 'children',
      hasChildren: 'hasChildren',
      load: loadTreeChildren
    };
  });

  async function refreshAfterSave(context: { payload: OrgSavePayload; row: OrgRecord | null }) {
    clearTreeCache();

    if (inSearchMode.value) {
      await onSearch(false);
      return;
    }

    const rootId = rootParentId.value;
    const nextParentId = String(context.payload.parentId || rootId);
    const previousParentId = context.row?.parentId ? String(context.row.parentId) : '';

    let refreshed = false;
    if (previousParentId && previousParentId !== rootId && previousParentId !== nextParentId) {
      refreshed = (await refreshTreeNode(previousParentId)) || refreshed;
    }

    if (nextParentId && nextParentId !== rootId) {
      refreshed = (await refreshTreeNode(nextParentId)) || refreshed;
    }

    if (!refreshed) {
      await onSearch(false);
    }
  }

  async function openCreateRoot() {
    createParentId.value = rootParentId.value;
    await crud.openCreate();
  }

  async function openCreateChild(row: OrgRecord) {
    createParentId.value = row.id;
    await crud.openCreate();
  }

  async function openEdit(row: OrgRecord) {
    await crud.openEdit(row);
  }

  async function openDetail(row: OrgRecord) {
    await crud.openDetail(row);
  }

  async function handleDelete(row: OrgRecord) {
    markDeletingRow(row);
    await remove(row);
    clearDeletingRowIfMatched(row);
  }

  async function checkOrgNameUnique(params: {
    orgName: string;
    parentId?: string;
    orgId?: string;
  }) {
    const parentId = params.parentId || rootParentId.value;
    const currentUnique = toOrgUniqueSnapshot({
      orgName: params.orgName,
      parentId
    });

    if (params.orgId && !shouldCheckOrgUnique(currentUnique, orgUniqueSnapshot.value)) {
      return true;
    }

    const response = await orgApi.checkUnique({
      orgName: params.orgName,
      parentId,
      orgId: params.orgId
    });

    return assertUniqueCheck(response, '组织名称校验失败');
  }

  function openManagerDialog(row: OrgRecord) {
    orgManagerTarget.value = row;
    orgManagerVisible.value = true;
  }

  function openLevelManageDialog() {
    orgLevelDialogVisible.value = true;
  }

  function handleOrgManagerUpdated() {
    void refreshTable();
  }

  function handleOrgLevelUpdated() {
    void loadOrgLevelOptions();
  }

  onMounted(async () => {
    try {
      await Promise.all([loadDictOptions(), loadOrgLevelOptions()]);
    } catch (error) {
      message.error(getErrorMessage(error, '初始化组织管理配置失败'));
    }

    await onSearch(false);
  });

  return {
    refs: {
      tableRef,
      searchRef,
      editFormRef
    },
    table: {
      loading,
      dataList,
      treeConfig,
      tableColumns,
      searchForm,
      orgCategoryLabelMap,
      institutionalTypeLabelMap
    },
    editor: {
      crud,
      crudVisible,
      crudMode,
      crudTitle,
      crudReadonly,
      crudSubmitting,
      crudForm,
      checkOrgNameUnique
    },
    options: {
      orgTreeOptions,
      orgCategoryOptions,
      institutionalTypeOptions,
      orgLevelOptions,
      rootParentId
    },
    dialogs: {
      orgManagerVisible,
      orgManagerTarget,
      orgLevelDialogVisible
    },
    actions: {
      tableSearch,
      onKeywordUpdate,
      onResetSearch,
      openLevelManageDialog,
      openCreateRoot,
      openCreateChild,
      openEdit,
      openDetail,
      openManagerDialog,
      handleDelete,
      handleOrgManagerUpdated,
      handleOrgLevelUpdated
    }
  };
}
