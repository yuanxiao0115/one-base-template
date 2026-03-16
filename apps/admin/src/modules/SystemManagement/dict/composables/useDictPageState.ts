import { computed, reactive, ref } from 'vue';
import { type CrudFormLike, useCrudPage } from '@one-base-template/core';
import { obConfirm } from '@one-base-template/ui';
import { message } from '@one-base-template/ui';
import { dictColumns, dictItemColumns } from '../columns';
import { dictApi, dictItemApi } from '../api';
import type { DictItemRecord, DictItemSavePayload, DictRecord, DictSavePayload } from '../types';
import {
  defaultDictForm,
  defaultDictItemForm,
  type DictForm,
  dictFormRules,
  type DictItemForm,
  dictItemFormRules,
  toDictForm,
  toDictItemForm,
  toDictItemPayload,
  toDictPayload
} from '../form';

interface SearchFormExpose {
  resetFields?: () => void;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useDictPageState() {
  const tableRef = ref<unknown>(null);
  const searchRef = ref<SearchFormExpose>();
  const editFormRef = ref<CrudFormLike>();

  const itemTableRef = ref<unknown>(null);
  const itemSearchRef = ref<SearchFormExpose>();
  const itemEditFormRef = ref<CrudFormLike>();

  const settingVisible = ref(false);
  const currentDict = ref<DictRecord | null>(null);

  const searchForm = reactive({
    dictCode: '',
    dictName: ''
  });

  const itemSearchForm = reactive({
    dictId: '',
    itemName: '',
    itemValue: ''
  });

  const dictTableOpt = reactive({
    query: {
      api: dictApi.page,
      params: searchForm,
      pagination: true
    },
    remove: {
      api: dictApi.remove,
      buildPayload: (row: DictRecord) => ({ idList: row.id }),
      deleteConfirm: {
        nameKey: 'dictName',
        title: '删除确认',
        message: '是否确认删除字典「{name}」？'
      },
      onSuccess: () => {
        message.success('删除字典成功');
      },
      onError: (error: unknown) => {
        message.error(getErrorMessage(error, '删除字典失败'));
      }
    }
  });

  const dictCrudPage = useCrudPage<DictForm, DictRecord, DictRecord, DictSavePayload>({
    table: dictTableOpt,
    tableRef,
    editor: {
      entity: {
        name: '字典'
      },
      form: {
        create: () => ({ ...defaultDictForm }),
        ref: editFormRef
      },
      detail: {
        load: async ({ row }) => row,
        mapToForm: ({ detail }) => toDictForm(detail)
      },
      save: {
        buildPayload: ({ form }) => toDictPayload(form),
        request: async ({ mode, payload }) => {
          const response =
            mode === 'create' ? await dictApi.add(payload) : await dictApi.update(payload);

          if (response.code !== 200) {
            throw new Error(response.message || '保存字典失败');
          }

          return response;
        },
        onSuccess: async ({ mode }) => {
          message.success(mode === 'create' ? '新增字典成功' : '更新字典成功');
        }
      }
    }
  });

  const dictTable = dictCrudPage.table;
  const dictEditor = dictCrudPage.editor;

  const dictColumnsRef = computed(() => dictColumns);
  const dictPagination = computed(() => ({ ...dictTable.pagination }));

  const itemTableOpt = reactive({
    query: {
      api: async (params: Record<string, unknown>) => {
        const dictId = String(params.dictId ?? '');
        const currentPage = Number(params.currentPage ?? 1);
        const pageSize = Number(params.pageSize ?? 10);

        if (!dictId) {
          return {
            code: 200,
            data: {
              records: [],
              total: 0,
              currentPage,
              pageSize
            }
          };
        }

        return dictItemApi.page({
          dictId,
          itemName: String(params.itemName ?? ''),
          itemValue: String(params.itemValue ?? ''),
          currentPage,
          pageSize
        });
      },
      params: itemSearchForm,
      pagination: true,
      immediate: false,
      paginationKey: {
        current: 'currentPage',
        size: 'pageSize'
      }
    },
    remove: {
      api: dictItemApi.remove,
      buildPayload: (row: DictItemRecord) => ({ idList: row.id }),
      deleteConfirm: {
        nameKey: 'itemName',
        title: '删除确认',
        message: '是否确认删除字段「{name}」？'
      },
      onSuccess: () => {
        message.success('删除字段成功');
      },
      onError: (error: unknown) => {
        message.error(getErrorMessage(error, '删除字段失败'));
      }
    }
  });

  const itemCrudPage = useCrudPage<
    DictItemForm,
    DictItemRecord,
    DictItemRecord,
    DictItemSavePayload
  >({
    table: itemTableOpt,
    tableRef: itemTableRef,
    editor: {
      entity: {
        name: '字段'
      },
      form: {
        create: () => ({
          ...defaultDictItemForm,
          dictId: itemSearchForm.dictId
        }),
        ref: itemEditFormRef
      },
      detail: {
        beforeOpen: async ({ mode, form }) => {
          if (mode === 'create') {
            form.dictId = itemSearchForm.dictId;
          }
        },
        load: async ({ row }) => row,
        mapToForm: ({ detail }) => toDictItemForm(detail)
      },
      save: {
        buildPayload: ({ form }) => toDictItemPayload(form),
        request: async ({ mode, payload }) => {
          const response =
            mode === 'create' ? await dictItemApi.add(payload) : await dictItemApi.update(payload);

          if (response.code !== 200) {
            throw new Error(response.message || '保存字段失败');
          }

          return response;
        },
        onSuccess: async ({ mode }) => {
          message.success(mode === 'create' ? '新增字段成功' : '更新字段成功');
        }
      }
    }
  });

  const itemTable = itemCrudPage.table;
  const itemEditor = itemCrudPage.editor;

  const dictItemColumnsRef = computed(() => dictItemColumns);
  const dictItemPagination = computed(() => ({ ...itemTable.pagination }));

  const settingTitle = computed(() => {
    const dictName = currentDict.value?.dictName || '字典配置';
    return `字典配置 - ${dictName}`;
  });

  const currentDictInfo = computed(() => ({
    dictCode: currentDict.value?.dictCode || '--',
    dictName: currentDict.value?.dictName || '--'
  }));

  function tableSearch(keyword: string) {
    searchForm.dictCode = keyword;
    void dictTable.onSearch();
  }

  function onKeywordUpdate(keyword: string) {
    searchForm.dictCode = keyword;
  }

  function onResetSearch() {
    searchForm.dictName = '';
    dictTable.resetForm(searchRef, 'dictCode');
  }

  async function openSetting(row: DictRecord) {
    currentDict.value = row;
    itemSearchForm.dictId = row.id;
    itemSearchForm.itemName = '';
    itemSearchForm.itemValue = '';
    settingVisible.value = true;
    await itemTable.onSearch(true);
  }

  function closeSetting() {
    settingVisible.value = false;
    currentDict.value = null;
    itemSearchForm.dictId = '';
    itemSearchForm.itemName = '';
    itemSearchForm.itemValue = '';
    itemEditor.close();
  }

  function itemTableSearch(keyword: string) {
    itemSearchForm.itemName = keyword;
    void itemTable.onSearch();
  }

  function onItemKeywordUpdate(keyword: string) {
    itemSearchForm.itemName = keyword;
  }

  function onResetItemSearch() {
    itemSearchForm.itemValue = '';
    itemTable.resetForm(itemSearchRef, 'itemName');
  }

  async function handleToggleItemStatus(row: DictItemRecord) {
    try {
      const nextEnable = row.disabled !== 0;
      await obConfirm.warn(
        `您确认要${nextEnable ? '启用' : '停用'}字段「${row.itemName}」吗？`,
        '状态确认'
      );

      const response = await dictItemApi.toggleStatus({
        ids: row.id,
        isEnable: nextEnable
      });

      if (response.code !== 200) {
        throw new Error(response.message || '更新字段状态失败');
      }

      message.success(`${nextEnable ? '启用' : '停用'}字段成功`);
      await itemTable.onSearch(false);
    } catch (error) {
      if (error === 'cancel' || error === 'close') {
        return;
      }
      message.error(getErrorMessage(error, '更新字段状态失败'));
    }
  }

  return {
    refs: {
      tableRef,
      searchRef,
      editFormRef,
      itemTableRef,
      itemSearchRef,
      itemEditFormRef
    },
    table: {
      loading: dictTable.loading,
      dataList: dictTable.dataList,
      tableColumns: dictColumnsRef,
      tablePagination: dictPagination,
      searchForm
    },
    editor: {
      crud: dictEditor,
      crudVisible: dictEditor.visible,
      crudMode: dictEditor.mode,
      crudTitle: dictEditor.title,
      crudReadonly: dictEditor.readonly,
      crudSubmitting: dictEditor.submitting,
      crudForm: dictEditor.form,
      dictFormRules
    },
    setting: {
      settingVisible,
      settingTitle,
      currentDictInfo,
      itemLoading: itemTable.loading,
      itemDataList: itemTable.dataList,
      itemTableColumns: dictItemColumnsRef,
      itemTablePagination: dictItemPagination,
      itemSearchForm,
      itemCrud: itemEditor,
      itemCrudVisible: itemEditor.visible,
      itemCrudMode: itemEditor.mode,
      itemCrudTitle: itemEditor.title,
      itemCrudReadonly: itemEditor.readonly,
      itemCrudSubmitting: itemEditor.submitting,
      itemCrudForm: itemEditor.form,
      dictItemFormRules
    },
    actions: {
      tableSearch,
      onKeywordUpdate,
      onResetSearch,
      openSetting,
      closeSetting,
      itemTableSearch,
      onItemKeywordUpdate,
      onResetItemSearch,
      handleSelectionChange: dictTable.handleSelectionChange,
      handleSizeChange: dictTable.handleSizeChange,
      handleCurrentChange: dictTable.handleCurrentChange,
      handleDelete: dictCrudPage.actions.remove,
      handleItemSelectionChange: itemTable.handleSelectionChange,
      handleItemSizeChange: itemTable.handleSizeChange,
      handleItemCurrentChange: itemTable.handleCurrentChange,
      handleDeleteItem: itemCrudPage.actions.remove,
      handleToggleItemStatus
    }
  };
}
