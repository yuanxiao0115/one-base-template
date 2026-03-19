import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { TableColumnList } from '@one-base-template/ui';
import { confirm, message } from '@one-base-template/ui';

import { templateApi } from '../api';
import type { PortalTemplate } from '../types';
import { createLatestRequestGuard } from './latestRequest';
import { normalizeBizOk, normalizePageTotal, normalizeRecords } from './template-list-helpers';
import { usePortalTemplateDialogActions } from './usePortalTemplateDialogActions';
import { usePortalTemplatePermissionCenter } from './usePortalTemplatePermissionCenter';

export function usePortalTemplateListPageState() {
  const router = useRouter();

  const tableColumns: TableColumnList = [
    {
      label: '序号',
      type: 'index',
      width: 80,
      align: 'left'
    },
    {
      label: '门户名称',
      prop: 'templateName',
      minWidth: 220
    },
    {
      label: '状态',
      prop: 'publishStatus',
      width: 120,
      slot: 'publishStatus'
    },
    {
      label: '操作',
      width: 360,
      fixed: 'right',
      align: 'right',
      slot: 'operation'
    }
  ];

  const loading = ref(false);
  const rows = ref<PortalTemplate[]>([]);

  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);

  const searchForm = reactive<{
    searchKey: string;
    publishStatus: number | '';
  }>({
    searchKey: '',
    publishStatus: ''
  });

  const tablePagination = computed(() => ({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    total: total.value
  }));

  const listRequestGuard = createLatestRequestGuard();

  function isPublished(row: PortalTemplate): boolean {
    return Number(row.publishStatus) === 1;
  }

  function getPublishStatusText(row: PortalTemplate): string {
    const val = Number(row.publishStatus);
    if (val === 1) {
      return '已发布';
    }
    if (val === 0) {
      return '草稿';
    }
    return '未知';
  }

  async function queryList(page = currentPage.value) {
    const requestToken = listRequestGuard.next();
    loading.value = true;
    currentPage.value = page;

    try {
      const res = await templateApi.list({
        currentPage: currentPage.value,
        pageSize: pageSize.value,
        searchKey: searchForm.searchKey || undefined,
        publishStatus:
          searchForm.publishStatus === '' ? undefined : Number(searchForm.publishStatus)
      });

      if (!listRequestGuard.isLatest(requestToken)) {
        return;
      }

      if (!normalizeBizOk(res)) {
        message.error(res?.message || '加载失败');
        rows.value = [];
        total.value = 0;
        return;
      }

      rows.value = normalizeRecords(res?.data);
      total.value = normalizePageTotal(res?.data);
    } catch (e: unknown) {
      if (!listRequestGuard.isLatest(requestToken)) {
        return;
      }
      const msg = e instanceof Error ? e.message : '加载失败';
      message.error(msg);
      rows.value = [];
      total.value = 0;
    } finally {
      if (listRequestGuard.isLatest(requestToken)) {
        loading.value = false;
      }
    }
  }

  function tableSearch(keyword: string) {
    searchForm.searchKey = keyword;
    void queryList(1);
  }

  function onKeywordUpdate(keyword: string) {
    searchForm.searchKey = keyword;
  }

  function onResetSearch() {
    searchForm.publishStatus = '';
    void queryList(1);
  }

  function handlePageSizeChange(size: number) {
    pageSize.value = size;
    void queryList(1);
  }

  function handlePageCurrentChange(page: number) {
    void queryList(page);
  }

  async function loadTemplateForDialog(id: string, fallback?: Partial<PortalTemplate>) {
    try {
      const res = await templateApi.detail({ id });
      if (!normalizeBizOk(res)) {
        message.error(res?.message || '加载门户详情失败');
        return null;
      }

      return { ...fallback, ...res?.data };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '加载门户详情失败';
      message.error(msg);
      return null;
    }
  }

  const {
    dialogVisible,
    dialogSubmitting,
    dialogMode,
    dialogTitle,
    dialogSubmitText,
    dialogInitialValue,
    openCreate,
    openEdit,
    openCopy,
    onSubmitTemplate,
    goDesigner,
    openPreview
  } = usePortalTemplateDialogActions({
    router,
    queryList,
    loadTemplateForDialog
  });

  const {
    authoritySubmitting,
    authorityInitial,
    permissionCenterVisible,
    permissionTemplateId,
    permissionTemplateName,
    permissionPageTree,
    pagePermissionLoading,
    pagePermissionInitial,
    pagePermissionCurrentTabId,
    openPermissionCenter,
    onSelectPermissionPage,
    onSubmitPagePermission,
    onSubmitAuthority
  } = usePortalTemplatePermissionCenter({
    currentPage,
    queryList,
    loadTemplateForDialog
  });

  async function togglePublish(row: PortalTemplate) {
    const { id } = row;
    if (!id) {
      return;
    }

    const nextStatus = isPublished(row) ? 0 : 1;
    const text = nextStatus === 1 ? '发布' : '取消发布';

    const res = await templateApi.publish({
      id,
      status: nextStatus
    });
    if (!normalizeBizOk(res)) {
      message.error(res?.message || `${text}失败`);
      return;
    }

    message.success(`${text}成功`);
    await queryList();
  }

  async function deleteTemplate(row: PortalTemplate) {
    const { id } = row;
    if (!id) {
      return;
    }

    try {
      await confirm.warn('确定要删除该门户模板吗？', '删除确认');
    } catch {
      return;
    }

    const res = await templateApi.delete({ id });
    if (!normalizeBizOk(res)) {
      message.error(res?.message || '删除失败');
      return;
    }

    message.success('删除成功');

    const nextPage =
      rows.value.length <= 1 && currentPage.value > 1 ? currentPage.value - 1 : currentPage.value;
    await queryList(nextPage);
  }

  void queryList(1);

  return {
    tableColumns,
    loading,
    rows,
    searchForm,
    tablePagination,
    dialogVisible,
    dialogSubmitting,
    dialogMode,
    dialogTitle,
    dialogSubmitText,
    dialogInitialValue,
    authoritySubmitting,
    authorityInitial,
    permissionCenterVisible,
    permissionTemplateId,
    permissionTemplateName,
    permissionPageTree,
    pagePermissionLoading,
    pagePermissionInitial,
    pagePermissionCurrentTabId,
    tableSearch,
    onKeywordUpdate,
    onResetSearch,
    queryList,
    handlePageSizeChange,
    handlePageCurrentChange,
    isPublished,
    getPublishStatusText,
    openCreate,
    openEdit,
    goDesigner,
    openCopy,
    openPermissionCenter,
    openPreview,
    onSelectPermissionPage,
    onSubmitPagePermission,
    onSubmitAuthority,
    onSubmitTemplate,
    togglePublish,
    deleteTemplate
  };
}
