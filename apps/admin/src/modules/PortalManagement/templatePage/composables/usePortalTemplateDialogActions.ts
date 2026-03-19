import { ref } from 'vue';
import type { Router } from 'vue-router';
import { findFirstPortalPageTabId } from '@one-base-template/portal-engine';
import { message } from '@one-base-template/ui';

import { templateApi } from '../api';
import type { BizResponse, PortalTemplate } from '../types';
import { extractTemplateId, normalizeBizOk } from './template-list-helpers';

interface SubmitTemplatePayload {
  templateName: string;
  description: string;
  templateType: number;
  isOpen: number;
}

interface UsePortalTemplateDialogActionsOptions {
  router: Router;
  queryList: (page?: number) => Promise<void>;
  loadTemplateForDialog: (
    id: string,
    fallback?: Partial<PortalTemplate>
  ) => Promise<Partial<PortalTemplate> | null>;
}

export function usePortalTemplateDialogActions(options: UsePortalTemplateDialogActionsOptions) {
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

  async function openEdit(row: PortalTemplate) {
    if (!row.id) {
      return;
    }

    const detail = await options.loadTemplateForDialog(row.id, row);
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

    const detail = await options.loadTemplateForDialog(row.id, row);
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

  async function onSubmitTemplate(payload: SubmitTemplatePayload) {
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
          options.router
            .push({
              path: '/portal/design',
              query: { id: newId }
            })
            .catch((error) => {
              console.warn('[PortalTemplateList] 跳转设计页失败', error);
            });
          return;
        }

        await options.queryList(1);
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
        await options.queryList();
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
      await options.queryList(1);
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
    options.router
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
      const tabIdFromTree = findFirstPortalPageTabId(tpl?.tabList);
      const tabId = tabIdFromTree || (Array.isArray(tpl?.tabIds) ? tpl?.tabIds?.[0] || '' : '');
      if (!tabId) {
        message.warning('该模板暂无可预览页面');
        return;
      }

      const previewHref = options.router.resolve({
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

  return {
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
  };
}
