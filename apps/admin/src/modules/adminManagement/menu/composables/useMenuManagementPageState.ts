import { computed, onMounted, reactive, ref, type Ref } from 'vue';
import { type CrudErrorContext, type CrudFormLike, useCrudPage } from '@one-base-template/core';
import type { TableColumnList } from '@one-base-template/ui';
import { message } from '@one-base-template/ui';
import type { ApiResponse } from '@/types/api';
import menuColumns from '../columns';
import { menuPermissionApi } from '../api';
import type { MenuPermissionRecord } from '../types';
import {
  defaultMenuPermissionForm,
  type MenuPermissionForm,
  menuPermissionFormRules,
  toMenuPermissionForm,
  toMenuPermissionPayload
} from '../form';
import {
  MENU_RESOURCE_TYPE,
  ROOT_PARENT_ID,
  SYSTEM_RESOURCE_TYPE,
  getTreeRows
} from './menuTreeHelpers';
import { useMenuPermissionTreeState } from './useMenuPermissionTreeState';

interface SearchFormExpose {
  resetFields?: () => void;
}

type DialogMode = 'create' | 'detail' | 'edit';

export function useMenuManagementPageState() {
  const tableRef = ref<unknown>(null);
  const searchRef = ref<SearchFormExpose>();
  const editFormRef = ref<CrudFormLike>();
  const createParentId = ref(ROOT_PARENT_ID);

  const searchForm = reactive({
    resourceName: '',
    resourceType: ''
  });

  const inTreeMode = computed(() => !(searchForm.resourceName.trim() || searchForm.resourceType));
  const tableColumns = computed<TableColumnList>(() => menuColumns);
  const {
    permissionTree,
    activeSystemId,
    systemList,
    activeSystemName,
    hasSystemData,
    tableTreeConfig,
    parentOptions,
    resourceTypeOptions,
    syncPermissionTree,
    getSystemScopedTreeRows,
    resolveScopeSystemId,
    loadParentOptions,
    loadResourceTypeOptions
  } = useMenuPermissionTreeState({
    inTreeMode
  });

  const tableOpt = reactive({
    query: {
      api: async () => {
        if (inTreeMode.value) {
          const response = await menuPermissionApi.getPermissionTree();
          if (response.code === 200) {
            const treeRows = getTreeRows(response.data);
            syncPermissionTree(treeRows);
            return {
              ...response,
              data: getSystemScopedTreeRows()
            };
          }

          permissionTree.value = [];
          activeSystemId.value = '';
          return response;
        }

        return menuPermissionApi.getPermissionList({
          resourceName: searchForm.resourceName,
          resourceType: searchForm.resourceType
        });
      },
      params: searchForm,
      pagination: false
    },
    remove: {
      api: async (payload: { id: string }) => menuPermissionApi.deletePermission(payload.id),
      deleteConfirm: {
        nameKey: 'resourceName',
        title: '删除确认',
        message: '是否确认删除权限「{name}」？若存在下级权限会一并删除。'
      },
      onSuccess: () => {
        message.success('删除成功');
      },
      onError: (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : '删除失败';
        message.error(errorMessage);
      }
    }
  });

  const crudPage = useCrudPage<
    MenuPermissionForm,
    MenuPermissionRecord,
    MenuPermissionRecord,
    ReturnType<typeof toMenuPermissionPayload>,
    ApiResponse<MenuPermissionRecord>
  >({
    table: tableOpt,
    tableRef: tableRef as unknown as Ref<unknown>,
    editor: {
      entity: {
        name: '菜单'
      },
      form: {
        create: () => ({ ...defaultMenuPermissionForm }),
        ref: editFormRef
      },
      detail: {
        async beforeOpen({ mode, row, form }) {
          await loadResourceTypeOptions();

          if (mode === 'create') {
            const scopeSystemId = await resolveScopeSystemId(createParentId.value);
            await loadParentOptions(undefined, scopeSystemId);
            form.parentId = createParentId.value || ROOT_PARENT_ID;
            // 新增时收敛类型：顶级系统，子级默认为菜单。
            form.resourceType =
              form.parentId === ROOT_PARENT_ID ? SYSTEM_RESOURCE_TYPE : MENU_RESOURCE_TYPE;
            return;
          }

          if (!row) {
            await loadParentOptions();
            return;
          }

          const scopeSystemId = await resolveScopeSystemId(row.id);
          await loadParentOptions(row.id, scopeSystemId);
        },
        load: async ({ row }) => row,
        mapToForm: ({ detail }) => toMenuPermissionForm(detail)
      },
      save: {
        buildPayload: ({ form }) => toMenuPermissionPayload(form),
        request: async ({ mode, payload }) => {
          const response =
            mode === 'create'
              ? await menuPermissionApi.addPermission(payload)
              : await menuPermissionApi.editPermission(payload);

          if (response.code !== 200) {
            throw new Error(response.message || '保存失败');
          }

          return response;
        },
        onSuccess: async ({ mode, payload, result }) => {
          if (mode === 'create' && (payload.parentId || ROOT_PARENT_ID) === ROOT_PARENT_ID) {
            activeSystemId.value = result.data?.id || activeSystemId.value;
          }
          message.success(mode === 'create' ? '新增成功' : '更新成功');
        }
      },
      onError: (error, context) => {
        handleCrudError(error, context);
      }
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
  const isSystemForm = computed(() => {
    if (crudMode.value === 'create') {
      return createParentId.value === ROOT_PARENT_ID;
    }
    return Number(crudForm.value.resourceType) === SYSTEM_RESOURCE_TYPE;
  });
  const drawerSize = computed(() => (isSystemForm.value ? 400 : 760));
  const drawerColumns = computed(() => (isSystemForm.value ? 1 : 2));

  function tableSearch(keyword: string) {
    searchForm.resourceName = keyword;
    void onSearch();
  }

  function onKeywordUpdate(keyword: string) {
    searchForm.resourceName = keyword;
  }

  function onResetSearch() {
    searchForm.resourceType = '';
    resetForm(searchRef, 'resourceName');
  }

  function selectSystem(systemId: string) {
    if (!systemId || systemId === activeSystemId.value) {
      return;
    }

    activeSystemId.value = systemId;
    if (inTreeMode.value) {
      dataList.value = getSystemScopedTreeRows();
    }
  }

  async function openCreateDialog(parentId = ROOT_PARENT_ID) {
    createParentId.value = parentId;
    await crud.openCreate();
  }

  function openCreateUnderActiveSystem() {
    if (!activeSystemId.value) {
      message.warning('请先选择系统');
      return;
    }

    void openCreateDialog(activeSystemId.value);
  }

  async function openEditDialog(
    mode: Extract<DialogMode, 'detail' | 'edit'>,
    row: MenuPermissionRecord
  ) {
    if (mode === 'edit') {
      await crud.openEdit(row);
      return;
    }

    await crud.openDetail(row);
  }

  function openRootCreateDialog() {
    void openCreateDialog();
  }

  function openCreateChild(row: MenuPermissionRecord) {
    void openCreateDialog(row.id);
  }

  function openCreateSibling(row: MenuPermissionRecord) {
    void openCreateDialog(row.parentId || ROOT_PARENT_ID);
  }

  async function openEdit(row: MenuPermissionRecord) {
    await openEditDialog('edit', row);
  }

  async function openDetail(row: MenuPermissionRecord) {
    await openEditDialog('detail', row);
  }

  async function handleRemove(row: MenuPermissionRecord) {
    await remove(row);
  }

  async function onConfirmCrud() {
    try {
      await crud.confirm();
    } catch {
      // 错误提示由 onError 统一处理，避免重复弹窗。
    }
  }

  function handleCrudError(error: unknown, context: CrudErrorContext<MenuPermissionRecord>) {
    const fallbackMessage =
      context.stage === 'beforeOpen'
        ? '打开弹窗失败'
        : context.stage === 'loadDetail'
          ? '加载详情失败'
          : '保存失败';

    const errorMessage = error instanceof Error ? error.message : fallbackMessage;
    message.error(errorMessage);
  }

  onMounted(() => {
    void loadResourceTypeOptions();
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
      tableColumns,
      tableTreeConfig,
      searchForm,
      inTreeMode,
      activeSystemId,
      activeSystemName,
      hasSystemData,
      systemList
    },
    options: {
      resourceTypeOptions,
      parentOptions
    },
    editor: {
      crud,
      crudVisible,
      crudMode,
      crudTitle,
      crudReadonly,
      crudSubmitting,
      crudForm,
      isSystemForm,
      drawerSize,
      drawerColumns,
      menuPermissionFormRules
    },
    actions: {
      tableSearch,
      onKeywordUpdate,
      onResetSearch,
      selectSystem,
      openRootCreateDialog,
      openCreateDialog,
      openCreateUnderActiveSystem,
      openCreateChild,
      openCreateSibling,
      openEdit,
      openDetail,
      openEditDialog,
      remove: handleRemove,
      onConfirmCrud
    }
  };
}
