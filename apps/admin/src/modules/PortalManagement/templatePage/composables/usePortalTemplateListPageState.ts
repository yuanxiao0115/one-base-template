import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { TableColumnList } from '@one-base-template/ui';
import { confirm, message } from '@one-base-template/ui';

import { portalApi } from '../../api';
import type { PortalTab } from '../../types';
import {
  buildPortalTabPermissionUpdatePayload,
  buildTemplatePagePermissionTree,
  collectTemplatePagePermissionTabs,
  type PagePermissionSubmitPayload,
  type TemplatePagePermissionTreeNode
} from '../../utils/pagePermission';
import { findFirstPageTabId } from '../../utils/portalTree';
import { templateApi } from '../api';
import type { BizResponse, PageResult, PortalTemplate } from '../types';
import { createLatestRequestGuard } from './latestRequest';

type BizResLike = Pick<BizResponse<unknown>, 'code' | 'message' | 'success'>;

interface PortalAuthorityPayload {
  authType: 'person' | 'role';
  whiteDTOS: Array<{ typeId: string; type: number; typeName: string }>;
  blackDTOS: Array<{ typeId: string; type: number; typeName: string }>;
  userIds: string[];
  whiteList: Array<{ typeId: string; type: number; typeName: string }>;
  blackList: Array<{ typeId: string; type: number; typeName: string }>;
  editUsers: Array<{ typeId: string; type: number; typeName: string }>;
  allowRole: { roleIds: string[] };
  forbiddenRole: { roleIds: string[] };
  configRole: { roleIds: string[] };
}

interface PortalAuthorityUpdatePayload extends PortalAuthorityPayload {
  id: string;
  templateName: string;
  templateType: number;
  isOpen: number;
}

function normalizeBizOk(res: BizResLike | null | undefined): boolean {
  const code = res?.code;
  return (
    res?.success === true ||
    code === 0 ||
    code === 200 ||
    String(code) === '0' ||
    String(code) === '200'
  );
}

function normalizePageTotal(data: PageResult<unknown> | null | undefined): number {
  const raw =
    (data as Record<string, unknown> | null)?.total ??
    (data as Record<string, unknown> | null)?.totalCount ??
    0;
  const val = Number(raw);
  return Number.isFinite(val) ? val : 0;
}

function normalizeRecords(data: PageResult<PortalTemplate> | null | undefined): PortalTemplate[] {
  const raw = (data as PageResult<PortalTemplate> | null)?.records;
  return Array.isArray(raw) ? raw : [];
}

function normalizeIdLike(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
}

function normalizeIntegerLike(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeTemplateName(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function extractTemplateId(value: unknown): string {
  const direct = normalizeIdLike(value);
  if (direct) {
    return direct;
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return normalizeIdLike(obj.id) || normalizeIdLike(obj.templateId) || '';
  }

  return '';
}

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

  const dialogVisible = ref(false);
  const dialogSubmitting = ref(false);
  const dialogMode = ref<'create' | 'edit' | 'copy'>('create');
  const dialogTitle = ref('新增门户模板');
  const dialogSubmitText = ref('创建并配置');
  const dialogInitialValue = ref({
    templateName: '',
    description: '',
    templateType: 0,
    isOpen: 0
  });
  const activeTemplateId = ref('');

  const authoritySubmitting = ref(false);
  const authorityInitial = ref<Partial<PortalTemplate>>({});
  const authorityTemplateId = ref('');
  const permissionCenterVisible = ref(false);
  const permissionTemplateId = ref('');
  const permissionTemplateName = ref('');
  const permissionPageTree = ref<TemplatePagePermissionTreeNode[]>([]);
  const pagePermissionTemplateId = ref('');
  const pagePermissionInitial = ref<Partial<PortalTab>>({});
  const pagePermissionCurrentTabId = ref('');
  const pagePermissionDetailLoading = ref(false);
  const pagePermissionSubmitting = ref(false);
  const pagePermissionLoading = computed(
    () => pagePermissionDetailLoading.value || pagePermissionSubmitting.value
  );

  const listRequestGuard = createLatestRequestGuard();
  const permissionDetailRequestGuard = createLatestRequestGuard();

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

  function fillDialogInitialValue(source?: Partial<PortalTemplate> | null) {
    dialogInitialValue.value = {
      templateName: source?.templateName?.trim() || '',
      description: source?.description || '',
      templateType: Number(source?.templateType) || 0,
      isOpen: Number(source?.isOpen) || 0
    };
  }

  function openCreate() {
    activeTemplateId.value = '';
    dialogMode.value = 'create';
    dialogTitle.value = '新增门户模板';
    dialogSubmitText.value = '创建并配置';
    fillDialogInitialValue();
    dialogVisible.value = true;
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

  async function openEdit(row: PortalTemplate) {
    if (!row.id) {
      return;
    }

    const detail = await loadTemplateForDialog(row.id, row);
    if (!detail) {
      return;
    }

    activeTemplateId.value = row.id;
    dialogMode.value = 'edit';
    dialogTitle.value = '编辑门户模板';
    dialogSubmitText.value = '保存';
    fillDialogInitialValue(detail);
    dialogVisible.value = true;
  }

  async function openCopy(row: PortalTemplate) {
    if (!row.id) {
      return;
    }

    const detail = await loadTemplateForDialog(row.id, row);
    if (!detail) {
      return;
    }

    activeTemplateId.value = row.id;
    dialogMode.value = 'copy';
    dialogTitle.value = '复制门户模板';
    dialogSubmitText.value = '复制';
    fillDialogInitialValue({
      ...detail,
      templateName: `${detail.templateName || '门户模板'}-副本`
    });
    dialogVisible.value = true;
  }

  async function onSubmitTemplate(payload: {
    templateName: string;
    description: string;
    templateType: number;
    isOpen: number;
  }) {
    if (dialogSubmitting.value) {
      return;
    }

    dialogSubmitting.value = true;
    try {
      if (dialogMode.value === 'create') {
        const res = await templateApi.add({
          templateName: payload.templateName,
          description: payload.description || '',
          templateType: payload.templateType,
          isOpen: payload.isOpen,
          widthSize: 1280,
          widthType: 1,
          autoWidthSize: 100
        });

        if (!normalizeBizOk(res)) {
          message.error(res?.message || '创建失败');
          return;
        }

        const newId = extractTemplateId((res as BizResponse<unknown> | null)?.data);
        message.success('创建成功');
        dialogVisible.value = false;

        if (newId) {
          router
            .push({
              path: '/portal/design',
              query: { id: newId }
            })
            .catch((error) => {
              console.warn('[PortalTemplateList] 跳转设计页失败', error);
            });
          return;
        }

        await queryList(1);
        return;
      }

      if (dialogMode.value === 'edit') {
        const id = activeTemplateId.value;
        if (!id) {
          message.error('缺少模板 ID，无法编辑');
          return;
        }

        const res = await templateApi.update({
          id,
          templateName: payload.templateName,
          description: payload.description || '',
          templateType: payload.templateType,
          isOpen: payload.isOpen
        });

        if (!normalizeBizOk(res)) {
          message.error(res?.message || '编辑失败');
          return;
        }

        message.success('编辑成功');
        dialogVisible.value = false;
        await queryList();
        return;
      }

      const id = activeTemplateId.value;
      if (!id) {
        message.error('缺少模板 ID，无法复制');
        return;
      }

      const res = await templateApi.copy({
        id,
        templateName: payload.templateName
      });

      if (!normalizeBizOk(res)) {
        message.error(res?.message || '复制失败');
        return;
      }

      message.success('复制成功');
      dialogVisible.value = false;
      await queryList(1);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '提交失败';
      message.error(msg);
    } finally {
      dialogSubmitting.value = false;
    }
  }

  function goDesigner(row: PortalTemplate) {
    const { id } = row;
    if (!id) {
      return;
    }
    router
      .push({
        path: '/portal/design',
        query: { id }
      })
      .catch((error) => {
        console.warn('[PortalTemplateList] 跳转设计页失败', error);
      });
  }

  async function openPreview(row: PortalTemplate) {
    const { id } = row;
    if (!id) {
      return;
    }

    try {
      const res = await templateApi.detail({ id });
      if (!normalizeBizOk(res)) {
        message.error(res?.message || '获取模板详情失败');
        return;
      }

      const tpl = res.data;
      const tabIdFromTree = findFirstPageTabId(tpl?.tabList);
      const tabId = tabIdFromTree || (Array.isArray(tpl?.tabIds) ? tpl?.tabIds?.[0] || '' : '');
      if (!tabId) {
        message.warning('该模板暂无可预览页面');
        return;
      }

      const previewHref = router.resolve({
        path: '/portal/preview',
        query: {
          templateId: id,
          tabId,
          previewMode: 'live'
        }
      }).href;

      window.open(previewHref, '_blank', 'noopener,noreferrer');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '预览失败';
      message.error(msg);
    }
  }

  async function openPermissionCenter(row: PortalTemplate) {
    const id = normalizeIdLike(row.id);
    if (!id) {
      return;
    }

    const detail = await loadTemplateForDialog(id, row);
    if (!detail) {
      return;
    }

    permissionDetailRequestGuard.invalidate();
    pagePermissionDetailLoading.value = false;
    pagePermissionSubmitting.value = false;

    authorityTemplateId.value = id;
    authorityInitial.value = detail;
    permissionTemplateId.value = id;
    permissionTemplateName.value =
      normalizeTemplateName(detail.templateName) || normalizeTemplateName(row.templateName);
    permissionPageTree.value = buildTemplatePagePermissionTree(
      Array.isArray(detail.tabList) ? (detail.tabList as PortalTab[]) : []
    );

    const tabOptions = collectTemplatePagePermissionTabs(
      Array.isArray(detail.tabList) ? (detail.tabList as PortalTab[]) : []
    );

    pagePermissionTemplateId.value = id;
    pagePermissionCurrentTabId.value = tabOptions[0]?.tabId || '';
    pagePermissionInitial.value = {};
    permissionCenterVisible.value = true;

    if (pagePermissionCurrentTabId.value) {
      void loadPagePermissionDetail(pagePermissionCurrentTabId.value);
    }
  }

  async function loadPagePermissionDetail(tabId: string): Promise<boolean> {
    if (!tabId) {
      return false;
    }

    const requestToken = permissionDetailRequestGuard.next();
    pagePermissionDetailLoading.value = true;

    try {
      const res = await portalApi.tab.detail({
        id: tabId,
        templateId: pagePermissionTemplateId.value || undefined
      });

      if (!permissionDetailRequestGuard.isLatest(requestToken)) {
        return false;
      }

      if (!normalizeBizOk(res)) {
        message.error(res?.message || '加载页面权限失败');
        return false;
      }

      pagePermissionInitial.value = (res?.data ?? {}) as PortalTab;
      return true;
    } catch (e: unknown) {
      if (!permissionDetailRequestGuard.isLatest(requestToken)) {
        return false;
      }
      const msg = e instanceof Error ? e.message : '加载页面权限失败';
      message.error(msg);
      return false;
    } finally {
      if (permissionDetailRequestGuard.isLatest(requestToken)) {
        pagePermissionDetailLoading.value = false;
      }
    }
  }

  function onSelectPermissionPage(tabId: string) {
    if (!tabId || tabId === pagePermissionCurrentTabId.value) {
      return;
    }
    pagePermissionCurrentTabId.value = tabId;
    pagePermissionInitial.value = {};
    void loadPagePermissionDetail(tabId);
  }

  async function onSubmitPagePermission(payload: PagePermissionSubmitPayload) {
    const tabId = pagePermissionCurrentTabId.value;
    if (!(tabId && pagePermissionTemplateId.value) || pagePermissionSubmitting.value) {
      return;
    }

    pagePermissionSubmitting.value = true;
    try {
      const detailRes = await portalApi.tab.detail({
        id: tabId,
        templateId: pagePermissionTemplateId.value
      });
      if (!normalizeBizOk(detailRes)) {
        message.error(detailRes?.message || '加载页面详情失败，无法保存权限');
        return;
      }

      const detail = (detailRes?.data ?? {}) as PortalTab;
      const res = await portalApi.tab.update(
        buildPortalTabPermissionUpdatePayload(detail, payload)
      );
      if (!normalizeBizOk(res)) {
        message.error(res?.message || '页面权限保存失败');
        return;
      }

      message.success('页面权限保存成功');
      pagePermissionInitial.value = {
        ...detail,
        authType: payload.authType,
        allowPerms: payload.allowPerms,
        forbiddenPerms: payload.forbiddenPerms,
        configPerms: payload.configPerms
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '页面权限保存失败';
      message.error(msg);
    } finally {
      pagePermissionSubmitting.value = false;
    }
  }

  async function onSubmitAuthority(payload: PortalAuthorityPayload) {
    const id = authorityTemplateId.value;
    if (!id || authoritySubmitting.value) {
      return;
    }

    authoritySubmitting.value = true;
    try {
      const updatePayload = await buildAuthorityUpdatePayload(id, payload);
      if (!updatePayload) {
        return;
      }

      const res = await templateApi.update(updatePayload as unknown as Partial<PortalTemplate>);
      if (!normalizeBizOk(res)) {
        message.error(res?.message || '门户权限保存失败');
        return;
      }

      message.success('门户权限保存成功');
      await queryList(currentPage.value);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '门户权限保存失败';
      message.error(msg);
    } finally {
      authoritySubmitting.value = false;
    }
  }

  async function buildAuthorityUpdatePayload(
    id: string,
    payload: PortalAuthorityPayload
  ): Promise<PortalAuthorityUpdatePayload | null> {
    const detail = await loadTemplateForDialog(id, authorityInitial.value);
    if (!detail) {
      return null;
    }

    authorityInitial.value = detail;

    const templateName = normalizeTemplateName(detail.templateName);
    if (!templateName) {
      message.error('门户名称为空，无法保存权限');
      return null;
    }

    return {
      id: normalizeIdLike(detail.id) || id,
      templateName,
      templateType: normalizeIntegerLike(detail.templateType, 0),
      isOpen: normalizeIntegerLike(detail.isOpen, 0),
      ...payload
    };
  }

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
