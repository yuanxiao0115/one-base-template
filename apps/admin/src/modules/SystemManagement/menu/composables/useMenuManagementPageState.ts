import { computed, onMounted, reactive, ref, type Ref } from 'vue';
import { type CrudErrorContext, type CrudFormLike, useCrudPage } from '@one-base-template/core';
import type { TableColumnList } from '@one-base-template/ui';
import { obConfirm } from '@/infra/confirm';
import { message } from '@/utils/message';
import menuColumns from '../columns';
import {
  type BizResponse,
  menuPermissionApi,
  type MenuPermissionRecord,
  type PermissionTypeOption
} from '../api';
import {
  defaultMenuPermissionForm,
  type MenuPermissionForm,
  menuPermissionFormRules,
  type ParentOption,
  toMenuPermissionForm,
  toMenuPermissionPayload
} from '../form';

type SearchFormExpose = {
  resetFields?: () => void
}

type DialogMode = 'create' | 'detail' | 'edit'

export function useMenuManagementPageState () {
  const tableRef = ref<unknown>(null);
  const searchRef = ref<SearchFormExpose>();
  const editFormRef = ref<CrudFormLike>();
  const createParentId = ref('0');

  const searchForm = reactive({
    resourceName: '',
    resourceType: ''
  });

  const resourceTypeOptions = ref<PermissionTypeOption[]>([]);
  const parentOptions = ref<ParentOption[]>([]);

  const inTreeMode = computed(() => !searchForm.resourceName.trim() && !searchForm.resourceType);
  const tableColumns = computed<TableColumnList>(() => menuColumns);
  const tableTreeConfig = computed<Record<string, unknown> | undefined>(() => {
    if (!inTreeMode.value) {
      return undefined;
    }

    return {
      transform: false,
      expandAll: true,
      childrenField: 'children'
    };
  });

  const tableOpt = reactive({
    query: {
      api: async () => {
        if (inTreeMode.value) {
          return menuPermissionApi.getPermissionTree();
        }

        return menuPermissionApi.getPermissionList({
          resourceName: searchForm.resourceName,
          resourceType: searchForm.resourceType
        });
      },
      params: searchForm,
      pagination: false
    }
  });

  const crudPage = useCrudPage<
    MenuPermissionForm,
    MenuPermissionRecord,
    MenuPermissionRecord,
    ReturnType<typeof toMenuPermissionPayload>,
    BizResponse<MenuPermissionRecord>
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
        async beforeOpen ({ mode, row, form }) {
          await loadResourceTypeOptions();

          if (mode === 'create') {
            await loadParentOptions();
            form.parentId = createParentId.value || '0';
            return;
          }

          if (!row) {
            await loadParentOptions();
            return;
          }

          await loadParentOptions(row.id);
        },
        load: async ({ row }) => row,
        mapToForm: ({ detail }) => toMenuPermissionForm(detail)
      },
      save: {
        buildPayload: ({ form }) => toMenuPermissionPayload(form),
        request: async ({ mode, payload }) => {
          const response
            = mode === 'create'
              ? await menuPermissionApi.addPermission(payload)
              : await menuPermissionApi.editPermission(payload);

          if (response.code !== 200) {
            throw new Error(response.message || '保存失败');
          }

          return response;
        },
        onSuccess: async ({ mode }) => {
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

  const crudVisible = crud.visible;
  const crudMode = crud.mode;
  const crudTitle = crud.title;
  const crudReadonly = crud.readonly;
  const crudSubmitting = crud.submitting;
  const crudForm = crud.form;

  function appendParentOptions (rows: MenuPermissionRecord[],
    depth: number,
    disabledIds: Set<string>,
    result: ParentOption[]) {
    rows.forEach((row) => {
      result.push({
        value: row.id,
        label: `${'--'.repeat(depth)}${depth > 0 ? ' ' : ''}${row.resourceName}`,
        disabled: disabledIds.has(row.id)
      });

      if (Array.isArray(row.children) && row.children.length > 0) {
        appendParentOptions(row.children, depth + 1, disabledIds, result);
      }
    });
  }

  function markDescendants (rows: MenuPermissionRecord[], targetId: string, ids: Set<string>): boolean {
    for (const row of rows) {
      if (row.id === targetId) {
        ids.add(row.id);
        markNodeChildren(row, ids);
        return true;
      }

      if (Array.isArray(row.children) && row.children.length > 0) {
        const found = markDescendants(row.children, targetId, ids);
        if (found) {
          return true;
        }
      }
    }

    return false;
  }

  function markNodeChildren (row: MenuPermissionRecord, ids: Set<string>) {
    if (!Array.isArray(row.children) || row.children.length === 0) {
      return;
    }

    row.children.forEach((child) => {
      ids.add(child.id);
      markNodeChildren(child, ids);
    });
  }

  async function loadParentOptions (disabledId?: string) {
    const response = await menuPermissionApi.getPermissionTree();
    if (response.code !== 200) {
      throw new Error(response.message || '获取权限树失败');
    }

    const treeRows = Array.isArray(response.data) ? response.data : [];
    const disabledIds = new Set<string>();
    if (disabledId) {
      markDescendants(treeRows, disabledId, disabledIds);
    }

    const options: ParentOption[] = [{
      value: '0',
      label: '顶级权限'
    }];
    appendParentOptions(treeRows, 0, disabledIds, options);
    parentOptions.value = options;
  }

  async function loadResourceTypeOptions () {
    const response = await menuPermissionApi.getResourceTypeEnum();
    if (response.code === 200 && Array.isArray(response.data)) {
      resourceTypeOptions.value = response.data;
      return;
    }

    resourceTypeOptions.value = [];
  }

  function tableSearch (keyword: string) {
    searchForm.resourceName = keyword;
    void onSearch();
  }

  function onKeywordUpdate (keyword: string) {
    searchForm.resourceName = keyword;
  }

  function onResetSearch () {
    searchForm.resourceType = '';
    resetForm(searchRef, 'resourceName');
  }

  async function openCreateDialog (parentId = '0') {
    createParentId.value = parentId;
    await crud.openCreate();
  }

  async function openEditDialog (mode: Extract<DialogMode, 'detail' | 'edit'>, row: MenuPermissionRecord) {
    if (mode === 'edit') {
      await crud.openEdit(row);
      return;
    }

    await crud.openDetail(row);
  }

  function handleCreateCommand (command: string, row: MenuPermissionRecord) {
    const parentId = command === 'child' ? row.id : row.parentId || '0';
    void openCreateDialog(parentId);
  }

  async function handleDelete (row: MenuPermissionRecord) {
    try {
      await obConfirm.warn(`是否确认删除权限「${row.resourceName}」？若存在下级权限会一并删除。`,
        '删除确认');

      const response = await menuPermissionApi.deletePermission(row.id);
      if (response.code !== 200) {
        throw new Error(response.message || '删除失败');
      }

      message.success('删除成功');
      await onSearch(false);
    } catch (error) {
      if (error === 'cancel' || error === 'close') {
        return;
      }
      const errorMessage = error instanceof Error ? error.message : '删除失败';
      message.error(errorMessage);
    }
  }

  async function onConfirmCrud () {
    try {
      await crud.confirm();
    } catch {
      // 错误提示由 onError 统一处理，避免重复弹窗。
    }
  }

  function handleCrudError (error: unknown, context: CrudErrorContext<MenuPermissionRecord>) {
    const fallbackMessage
      = context.stage === 'beforeOpen'
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
      searchForm
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
      menuPermissionFormRules
    },
    actions: {
      tableSearch,
      onKeywordUpdate,
      onResetSearch,
      openCreateDialog,
      openEditDialog,
      handleCreateCommand,
      handleDelete,
      onConfirmCrud
    }
  };
}
