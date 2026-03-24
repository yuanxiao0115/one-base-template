import { computed, reactive, type Ref } from 'vue';
import { type CrudFormLike, useCrudPage } from '@one-base-template/core';
import { message } from '@one-base-template/ui';
import { clearDictCache } from '@/services/dict';
import { dictColumns } from '../columns';
import { dictApi } from '../api';
import type { DictRecord, DictSavePayload } from '../types';
import { defaultDictForm, type DictForm, dictFormRules, toDictForm, toDictPayload } from '../form';
import {
  type DictSearchFormState,
  getErrorMessage,
  type SearchFormExpose
} from './dict-page-shared';

interface UseDictCrudSectionOptions {
  tableRef: Ref<unknown>;
  searchRef: Ref<SearchFormExpose | undefined>;
  editFormRef: Ref<CrudFormLike | undefined>;
  searchForm: DictSearchFormState;
}

export function useDictCrudSection(options: UseDictCrudSectionOptions) {
  const { tableRef, searchRef, editFormRef, searchForm } = options;

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
        clearDictCache();
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
          clearDictCache();
          message.success(mode === 'create' ? '新增字典成功' : '更新字典成功');
        }
      }
    }
  });

  const dictTable = dictCrudPage.table;
  const dictEditor = dictCrudPage.editor;

  const dictColumnsRef = computed(() => dictColumns);
  const dictPagination = computed(() => ({ ...dictTable.pagination }));

  function isDictEditorBusy() {
    return dictEditor.opening.value || dictEditor.submitting.value;
  }

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

  async function openDictCreate() {
    if (isDictEditorBusy()) {
      return;
    }

    await dictEditor.openCreate();
  }

  async function openDictEdit(row: DictRecord) {
    if (isDictEditorBusy()) {
      return;
    }

    await dictEditor.openEdit(row);
  }

  async function openDictDetail(row: DictRecord) {
    if (isDictEditorBusy()) {
      return;
    }

    await dictEditor.openDetail(row);
  }

  return {
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
    actions: {
      tableSearch,
      onKeywordUpdate,
      onResetSearch,
      openDictCreate,
      openDictEdit,
      openDictDetail,
      handleSelectionChange: dictTable.handleSelectionChange,
      handleSizeChange: dictTable.handleSizeChange,
      handleCurrentChange: dictTable.handleCurrentChange,
      handleDelete: dictCrudPage.actions.remove
    }
  };
}
