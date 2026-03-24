import { computed, onMounted, reactive, ref } from 'vue';
import type { CrudFormLike } from '@one-base-template/ui';
import { useCrudPage } from '@one-base-template/core';
import { message } from '@one-base-template/ui';
import roleColumns from '../columns';
import { roleApi } from '../api';
import type { RoleRecord, RoleSavePayload } from '../types';
import { defaultRoleForm, type RoleForm, toRoleForm, toRolePayload } from '../form';

interface SearchRefExpose {
  resetFields?: () => void;
}

export function useRolePageState() {
  const tableRef = ref<unknown>(null);
  const searchRef = ref<SearchRefExpose>();
  const editFormRef = ref<CrudFormLike>();

  const permissionVisible = ref(false);
  const permissionRoleId = ref('');
  const permissionRoleName = ref('');

  const searchForm = reactive({
    roleName: ''
  });

  const tableOpt = reactive({
    query: {
      api: roleApi.page,
      params: searchForm,
      pagination: true,
      immediate: false
    },
    remove: {
      api: async (payload: { id: string }) => roleApi.remove({ idList: [payload.id] }),
      deleteConfirm: {
        nameKey: 'roleName',
        title: '删除确认',
        message: '是否确认删除角色「{name}」？'
      },
      onSuccess: () => {
        message.success('删除角色成功');
      },
      onError: (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : '删除角色失败';
        message.error(errorMessage);
      }
    }
  });

  const crudPage = useCrudPage<RoleForm, RoleRecord, RoleRecord, RoleSavePayload>({
    table: tableOpt,
    tableRef,
    editor: {
      entity: {
        name: '角色'
      },
      form: {
        create: () => ({ ...defaultRoleForm }),
        ref: editFormRef
      },
      detail: {
        load: async ({ row }) => row,
        mapToForm: ({ detail }) => toRoleForm(detail)
      },
      save: {
        buildPayload: async ({ form }) => toRolePayload(form),
        request: async ({ mode, payload }) => {
          const response =
            mode === 'create' ? await roleApi.add(payload) : await roleApi.update(payload);

          if (response.code !== 200) {
            throw new Error(response.message || '保存角色失败');
          }
          return response;
        },
        onSuccess: async ({ mode }) => {
          message.success(mode === 'create' ? '新增角色成功' : '更新角色成功');
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

  const crud = crudPage.editor;
  const { remove } = crudPage.actions;

  const tableColumns = computed(() => roleColumns);
  const tablePagination = computed(() => ({
    ...pagination
  }));

  const crudVisible = crud.visible;
  const crudMode = crud.mode;
  const crudTitle = crud.title;
  const crudReadonly = crud.readonly;
  const crudSubmitting = crud.submitting;
  const crudForm = crud.form;

  function tableSearch(keyword: string) {
    searchForm.roleName = keyword;
    void onSearch();
  }

  function onKeywordUpdate(keyword: string) {
    searchForm.roleName = keyword;
  }

  function onResetSearch() {
    resetForm(searchRef, 'roleName');
  }

  async function handleDelete(row: RoleRecord) {
    await remove(row);
  }

  function openPermissionDialog(row: RoleRecord) {
    permissionRoleId.value = row.id;
    permissionRoleName.value = row.roleName;
    permissionVisible.value = true;
  }

  function handlePermissionSaved() {
    void onSearch(false);
  }

  onMounted(() => {
    void onSearch(false);
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
      tablePagination,
      tableColumns,
      searchForm
    },
    editor: {
      crud,
      crudVisible,
      crudMode,
      crudTitle,
      crudReadonly,
      crudSubmitting,
      crudForm
    },
    dialogs: {
      permissionVisible,
      permissionRoleId,
      permissionRoleName
    },
    actions: {
      tableSearch,
      onKeywordUpdate,
      onResetSearch,
      handleSizeChange,
      handleCurrentChange,
      handleDelete,
      openPermissionDialog,
      handlePermissionSaved
    }
  };
}
