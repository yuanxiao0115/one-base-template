import { computed, reactive, type Ref } from 'vue';
import { type CrudFormLike, useCrudPage } from '@one-base-template/core';
import { obConfirm } from '@one-base-template/ui';
import { message } from '@one-base-template/ui';
import { dictItemColumns } from '../columns';
import { dictItemApi } from '../api';
import type { DictItemRecord, DictItemSavePayload } from '../types';
import {
  defaultDictItemForm,
  type DictItemForm,
  dictItemFormRules,
  toDictItemForm,
  toDictItemPayload
} from '../form';
import {
  type DictItemSearchFormState,
  getErrorMessage,
  type SearchFormExpose
} from './dict-page-shared';

interface UseDictItemSectionOptions {
  itemTableRef: Ref<unknown>;
  itemSearchRef: Ref<SearchFormExpose | undefined>;
  itemEditFormRef: Ref<CrudFormLike | undefined>;
  itemSearchForm: DictItemSearchFormState;
}

export function useDictItemSection(options: UseDictItemSectionOptions) {
  const { itemTableRef, itemSearchRef, itemEditFormRef, itemSearchForm } = options;

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

  function isItemEditorBusy() {
    return itemEditor.opening.value || itemEditor.submitting.value;
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

  async function openItemCreate() {
    if (isItemEditorBusy()) {
      return;
    }

    await itemEditor.openCreate();
  }

  async function openItemEdit(row: DictItemRecord) {
    if (isItemEditorBusy()) {
      return;
    }

    await itemEditor.openEdit(row);
  }

  async function openItemDetail(row: DictItemRecord) {
    if (isItemEditorBusy()) {
      return;
    }

    await itemEditor.openDetail(row);
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
    itemTable,
    itemEditor,
    setting: {
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
      itemTableSearch,
      onItemKeywordUpdate,
      onResetItemSearch,
      openItemCreate,
      openItemEdit,
      openItemDetail,
      handleItemSelectionChange: itemTable.handleSelectionChange,
      handleItemSizeChange: itemTable.handleSizeChange,
      handleItemCurrentChange: itemTable.handleCurrentChange,
      handleDeleteItem: itemCrudPage.actions.remove,
      handleToggleItemStatus
    }
  };
}
