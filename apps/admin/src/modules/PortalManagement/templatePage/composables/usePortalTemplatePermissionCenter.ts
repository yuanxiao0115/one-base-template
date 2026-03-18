import { computed, ref, type Ref } from 'vue';
import { message } from '@one-base-template/ui';

import { portalApi, templateApi } from '../../api';
import type { PortalTab } from '../../types';
import {
  buildPortalTabPermissionUpdatePayload,
  buildTemplatePagePermissionTree,
  collectTemplatePagePermissionTabs,
  type PagePermissionSubmitPayload,
  type TemplatePagePermissionTreeNode
} from '../../utils/pagePermission';
import type { PortalTemplate } from '../types';
import { createLatestRequestGuard } from './latestRequest';
import {
  normalizeBizOk,
  normalizeIdLike,
  normalizeIntegerLike,
  normalizeTemplateName
} from './template-list-helpers';

export interface PortalAuthorityPayload {
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

interface UsePortalTemplatePermissionCenterOptions {
  currentPage: Ref<number>;
  queryList: (page?: number) => Promise<void>;
  loadTemplateForDialog: (
    id: string,
    fallback?: Partial<PortalTemplate>
  ) => Promise<Partial<PortalTemplate> | null>;
}

export function usePortalTemplatePermissionCenter(
  options: UsePortalTemplatePermissionCenterOptions
) {
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

  const permissionDetailRequestGuard = createLatestRequestGuard();

  async function openPermissionCenter(row: PortalTemplate) {
    const id = normalizeIdLike(row.id);
    if (!id) {
      return;
    }

    const detail = await options.loadTemplateForDialog(id, row);
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
      await options.queryList(options.currentPage.value);
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
    const detail = await options.loadTemplateForDialog(id, authorityInitial.value);
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

  return {
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
  };
}
