import { reactive, ref } from 'vue';
import { message, obConfirm, type CrudFormLike, type TablePagination } from '@one-base-template/ui';
import { getStarterCrudDetail, pageStarterCrud, removeStarterCrud, saveStarterCrud } from '../api';
import {
  createDefaultStarterCrudForm,
  createDefaultStarterCrudSearchForm,
  toStarterCrudForm,
  toStarterCrudPayload,
  type StarterCrudSearchForm
} from '../form';
import starterCrudColumns from '../columns';
import type { StarterCrudRecord } from '../types';

interface SearchFormExpose {
  resetFields?: () => void;
}

function createTablePagination(): TablePagination {
  return {
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true,
    pageSizes: [10, 20, 50],
    layout: 'total, sizes, prev, pager, next, jumper'
  };
}

function isConfirmCanceled(error: unknown) {
  return error === 'cancel' || error === 'close';
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useStarterCrudPageState() {
  const refs = {
    tableRef: ref<unknown>(null),
    searchRef: ref<SearchFormExpose>(),
    editFormRef: ref<CrudFormLike>()
  };

  const table = reactive({
    loading: false,
    searchForm: reactive<StarterCrudSearchForm>(createDefaultStarterCrudSearchForm()),
    dataList: [] as StarterCrudRecord[],
    tableColumns: starterCrudColumns,
    tablePagination: reactive(createTablePagination())
  });

  const editor = reactive({
    crudVisible: false,
    crudMode: 'create' as 'create' | 'edit' | 'detail',
    crudTitle: '新增示例记录',
    crudSubmitting: false,
    crudReadonly: false,
    crudForm: createDefaultStarterCrudForm()
  });

  function syncEditorMeta() {
    editor.crudReadonly = editor.crudMode === 'detail';
    if (editor.crudMode === 'create') {
      editor.crudTitle = '新增示例记录';
      return;
    }
    if (editor.crudMode === 'edit') {
      editor.crudTitle = '编辑示例记录';
      return;
    }
    editor.crudTitle = '查看示例记录';
  }

  // 核心列表查询：用于演示 CRUD 查询、分页、筛选联动的标准写法。
  async function searchTable() {
    table.loading = true;
    try {
      const response = await pageStarterCrud({
        ...table.searchForm,
        currentPage: table.tablePagination.currentPage,
        pageSize: table.tablePagination.pageSize
      });
      table.dataList = response.records;
      table.tablePagination.total = response.total;
      table.tablePagination.currentPage = response.currentPage;
      table.tablePagination.pageSize = response.pageSize;
    } finally {
      table.loading = false;
    }
  }

  function onKeywordUpdate(keyword: string) {
    table.searchForm.keyword = keyword;
  }

  function tableSearch(keyword = table.searchForm.keyword) {
    table.searchForm.keyword = keyword;
    table.tablePagination.currentPage = 1;
    void searchTable();
  }

  function onResetSearch() {
    refs.searchRef.value?.resetFields?.();
    Object.assign(table.searchForm, createDefaultStarterCrudSearchForm());
    table.tablePagination.currentPage = 1;
    void searchTable();
  }

  function handleSizeChange(pageSize: number) {
    table.tablePagination.pageSize = pageSize;
    table.tablePagination.currentPage = 1;
    void searchTable();
  }

  function handleCurrentChange(currentPage: number) {
    table.tablePagination.currentPage = currentPage;
    void searchTable();
  }

  function closeEditor() {
    editor.crudVisible = false;
    editor.crudSubmitting = false;
    refs.editFormRef.value?.clearValidate?.();
  }

  function openCreate() {
    editor.crudMode = 'create';
    editor.crudForm = createDefaultStarterCrudForm();
    syncEditorMeta();
    refs.editFormRef.value?.clearValidate?.();
    editor.crudVisible = true;
  }

  async function openEdit(row: StarterCrudRecord) {
    editor.crudMode = 'edit';
    editor.crudForm = toStarterCrudForm(await getStarterCrudDetail(row.id));
    syncEditorMeta();
    refs.editFormRef.value?.clearValidate?.();
    editor.crudVisible = true;
  }

  async function openDetail(row: StarterCrudRecord) {
    editor.crudMode = 'detail';
    editor.crudForm = toStarterCrudForm(await getStarterCrudDetail(row.id));
    syncEditorMeta();
    refs.editFormRef.value?.clearValidate?.();
    editor.crudVisible = true;
  }

  async function confirmEditor() {
    if (editor.crudReadonly) {
      closeEditor();
      return;
    }

    const valid = await refs.editFormRef.value?.validate?.();
    if (valid === false) {
      return;
    }

    editor.crudSubmitting = true;
    try {
      await saveStarterCrud(toStarterCrudPayload(editor.crudForm));
      message.success(editor.crudMode === 'create' ? '新增示例记录成功' : '更新示例记录成功');
      closeEditor();
      table.tablePagination.currentPage = 1;
      await searchTable();
    } catch (error) {
      message.error(getErrorMessage(error, '保存示例记录失败'));
    } finally {
      editor.crudSubmitting = false;
    }
  }

  async function handleDelete(row: StarterCrudRecord) {
    try {
      await obConfirm.warn('是否确认删除示例记录「' + row.name + '」？', '删除确认');
      await removeStarterCrud(row.id);
      message.success('删除示例记录成功');
      if (table.dataList.length === 1 && table.tablePagination.currentPage > 1) {
        table.tablePagination.currentPage -= 1;
      }
      await searchTable();
    } catch (error) {
      if (isConfirmCanceled(error)) {
        return;
      }
      message.error(getErrorMessage(error, '删除示例记录失败'));
    }
  }

  syncEditorMeta();
  void searchTable();

  return {
    refs,
    table,
    editor,
    actions: {
      tableSearch,
      onKeywordUpdate,
      onResetSearch,
      handleSizeChange,
      handleCurrentChange,
      openCreate,
      openEdit,
      openDetail,
      confirmEditor,
      closeEditor,
      handleDelete
    }
  };
}
