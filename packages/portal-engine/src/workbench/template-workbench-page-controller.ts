import { computed, nextTick, ref, watch, type Ref } from 'vue';

import { findPortalTabById, isPortalTabEditable, normalizePortalTabName } from '../domain/tab-tree';
import { usePortalCurrentTabActions } from '../editor/current-tab-actions';
import {
  createPortalPageSettingsSession,
  type PortalPageSettingsDrawerTab
} from '../editor/page-settings-session';
import {
  sendPreviewRuntime,
  sendPreviewShellDetails,
  sendPreviewViewport,
  type PortalPreviewFrameTarget
} from '../editor/preview-bridge';
import { getDefaultPortalEngineContext, type PortalEngineContext } from '../runtime/context';
import { normalizePortalPageSettingsV2, type PortalPageSettingsV2 } from '../schema/page-settings';
import type { PortalTab } from '../schema/types';
import { createPortalPageSettingsService } from '../services/page-settings';
import { isPortalBizOk } from '../utils/biz-response';
import {
  PREVIEW_MODE_SAFE,
  PREVIEW_VIEWPORT_DEFAULT,
  type PortalPreviewMode,
  type PortalPreviewViewport
} from '../utils/preview';

import {
  createTemplateWorkbenchController,
  type CreateTemplateWorkbenchControllerOptions
} from './template-workbench-controller';

function cloneByJson<T>(input: T): T {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(input);
    } catch {
      // 预览配置中若混入不可结构化克隆字段，退回 JSON 语义拷贝。
    }
  }
  return JSON.parse(JSON.stringify(input)) as T;
}

export interface TemplateWorkbenchPagePreviewTarget extends PortalPreviewFrameTarget {
  setInteractionMode: (mode: 'auto' | 'manual') => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

export interface CreateTemplateWorkbenchPageControllerOptions extends Omit<
  CreateTemplateWorkbenchControllerOptions,
  'lockedTabId'
> {
  context?: PortalEngineContext;
  clone?: <T>(value: T) => T;
  previewTarget: Readonly<Ref<TemplateWorkbenchPagePreviewTarget | null>>;
  resolvePreviewHref: (payload: {
    templateId: string;
    tabId: string;
    previewMode: PortalPreviewMode;
  }) => string;
}

export function createTemplateWorkbenchPageController(
  options: CreateTemplateWorkbenchPageControllerOptions
) {
  const clone = options.clone || cloneByJson;
  const context = options.context || getDefaultPortalEngineContext();
  const pageSettingsService = createPortalPageSettingsService(undefined, context);
  const pageSettingsSession = createPortalPageSettingsSession<PortalPageSettingsV2>({
    clone
  });

  const workbench = createTemplateWorkbenchController({
    ...options,
    lockedTabId: computed(() =>
      pageSettingsSession.visible.value ? pageSettingsSession.editingTabId.value : ''
    )
  });

  const shellSettingVisible = ref(false);
  const shellSettingSaving = ref(false);
  const shellSettingSavedInThisRound = ref(false);
  const shellPreviewDetailsDraft = ref('');

  const previewMode = ref<PortalPreviewMode>(PREVIEW_MODE_SAFE);
  const previewViewport = ref<PortalPreviewViewport>(PREVIEW_VIEWPORT_DEFAULT);
  const previewScale = ref(1);
  const previewInteractionMode = ref<'auto' | 'manual'>('auto');

  const pageSettingsCurrentTabId = computed(() =>
    pageSettingsSession.visible.value && pageSettingsSession.editingTabId.value
      ? pageSettingsSession.editingTabId.value
      : workbench.currentTabId.value
  );
  const pageSettingsCurrentTab = computed(() =>
    findPortalTabById(workbench.templateInfo.value?.tabList ?? [], pageSettingsCurrentTabId.value)
  );
  const pageSettingsCurrentTabName = computed(() =>
    normalizePortalTabName(pageSettingsCurrentTab.value?.tabName, '未命名页面')
  );
  const previewFrameSrc = computed(() => {
    if (!(options.templateId.value && workbench.currentTabId.value)) {
      return '';
    }

    return options.resolvePreviewHref({
      templateId: options.templateId.value,
      tabId: workbench.currentTabId.value,
      previewMode: previewMode.value
    });
  });

  function postShellPreviewDetails(details: string): boolean {
    if (!(options.templateId.value && workbench.currentTabId.value)) {
      return false;
    }

    return sendPreviewShellDetails(options.previewTarget.value, {
      details,
      templateId: options.templateId.value,
      tabId: workbench.currentTabId.value
    });
  }

  function postPreviewViewport(): boolean {
    if (!(options.templateId.value && workbench.currentTabId.value)) {
      return false;
    }

    return sendPreviewViewport(options.previewTarget.value, {
      templateId: options.templateId.value,
      tabId: workbench.currentTabId.value,
      width: previewViewport.value.width,
      height: previewViewport.value.height
    });
  }

  function postPageRuntimePreview(settings: PortalPageSettingsV2 | null | undefined): boolean {
    if (!(options.templateId.value && workbench.currentTabId.value && settings)) {
      return false;
    }

    const normalizedSettings = normalizePortalPageSettingsV2(settings);
    const runtimeComponents = Array.isArray(pageSettingsSession.components.value)
      ? pageSettingsSession.components.value
      : [];

    return sendPreviewRuntime(options.previewTarget.value, {
      templateId: options.templateId.value,
      tabId: workbench.currentTabId.value,
      settings: normalizedSettings,
      component: runtimeComponents
    });
  }

  async function openPageSettingsDrawer(
    tabId: string,
    targetTab: PortalPageSettingsDrawerTab = 'layout'
  ) {
    if (!tabId || pageSettingsSession.loading.value) {
      return;
    }
    if (
      pageSettingsSession.visible.value &&
      pageSettingsSession.editingTabId.value &&
      pageSettingsSession.editingTabId.value !== tabId
    ) {
      options.notify.warning('页面设置已打开，请先保存或关闭后再切换页面');
      return;
    }

    pageSettingsSession.prepareOpen(tabId, targetTab);
    try {
      const detail = await pageSettingsService.loadTabPageSettings(tabId);
      if (pageSettingsSession.editingTabId.value !== tabId) {
        pageSettingsSession.failOpen();
        return;
      }

      pageSettingsSession.applyLoadedDetail({
        settings: detail.settings,
        components: detail.components
      });
      postPageRuntimePreview(pageSettingsSession.form.value);
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : '加载页面设置失败';
      pageSettingsSession.failOpen();
      options.notify.error(text);
    }
  }

  function onPageSettingsPreviewChange(settings: PortalPageSettingsV2) {
    postPageRuntimePreview(settings);
  }

  async function onSubmitPageSettings(settings: PortalPageSettingsV2) {
    const editingTabId = pageSettingsSession.editingTabId.value || workbench.currentTabId.value;
    if (!(options.templateId.value && editingTabId) || pageSettingsSession.saving.value) {
      return;
    }

    pageSettingsSession.saving.value = true;
    try {
      await pageSettingsService.saveTabPageSettings({
        tabId: editingTabId,
        templateId: options.templateId.value,
        settings
      });
      options.notify.success('页面设置保存成功');
      pageSettingsSession.markPageSettingsSaved(settings);
      postPageRuntimePreview(pageSettingsSession.form.value);
      await workbench.loadTemplate(editingTabId);
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : '页面设置保存失败';
      options.notify.error(text);
    } finally {
      pageSettingsSession.saving.value = false;
    }
  }

  function openShellSettings() {
    if (!workbench.templateInfo.value) {
      options.notify.warning('请先选择门户模板');
      return;
    }

    shellSettingVisible.value = true;
  }

  function onShellPreviewChange(payload: { details: string }) {
    shellPreviewDetailsDraft.value = payload.details;
    postShellPreviewDetails(payload.details);
  }

  async function onSubmitShellSetting(payload: { details: string }) {
    if (!options.templateId.value || shellSettingSaving.value) {
      return;
    }

    shellSettingSaving.value = true;
    try {
      const currentTemplate = workbench.templateInfo.value ?? {};
      const res = await options.api.template.update({
        ...currentTemplate,
        id: options.templateId.value,
        details: payload.details
      });
      if (!isPortalBizOk(res)) {
        options.notify.error(res?.message || '页眉页脚配置保存失败');
        return;
      }

      options.notify.success('页眉页脚配置保存成功');
      shellSettingSavedInThisRound.value = true;
      shellPreviewDetailsDraft.value = payload.details;
      shellSettingVisible.value = false;
      await workbench.loadTemplate(workbench.currentTabId.value);
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : '页眉页脚配置保存失败';
      options.notify.error(text);
    } finally {
      shellSettingSaving.value = false;
    }
  }

  function onPageShellPreviewChange(payload: { details: string }) {
    pageSettingsSession.markPageShellPreviewDraft(payload.details);
    postShellPreviewDetails(payload.details);
  }

  async function onSubmitPageShellSetting(payload: { details: string }) {
    const editingTabId = pageSettingsSession.editingTabId.value || workbench.currentTabId.value;
    if (!(options.templateId.value && editingTabId) || pageSettingsSession.pageShellSaving.value) {
      return;
    }

    pageSettingsSession.pageShellSaving.value = true;
    try {
      const currentTemplate = workbench.templateInfo.value ?? {};
      const res = await options.api.template.update({
        ...currentTemplate,
        id: options.templateId.value,
        details: payload.details
      });
      if (!isPortalBizOk(res)) {
        options.notify.error(res?.message || '页面级页眉页脚配置保存失败');
        return;
      }

      options.notify.success('页面级页眉页脚配置保存成功');
      pageSettingsSession.markPageShellSaved(payload.details);
      await workbench.loadTemplate(editingTabId);
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : '页面级页眉页脚配置保存失败';
      options.notify.error(text);
    } finally {
      pageSettingsSession.pageShellSaving.value = false;
    }
  }

  const {
    editCurrentTab,
    openCurrentPageSettings,
    toggleCurrentTabHide,
    deleteCurrentTab,
    openPreviewWindow
  } = usePortalCurrentTabActions<PortalTab, PortalPreviewMode>({
    templateId: options.templateId,
    currentTabId: workbench.currentTabId,
    currentTab: workbench.currentTab,
    previewMode,
    resolvePreviewHref: options.resolvePreviewHref,
    notifyWarning: options.notify.warning,
    onEditTab: workbench.onEdit,
    onOpenPageSettings: openPageSettingsDrawer,
    onOpenAttribute: workbench.openAttribute,
    onToggleHide: workbench.toggleHide,
    onDeleteTab: workbench.deleteTab,
    isTabEditable: (tab) => isPortalTabEditable(tab.tabType)
  });

  function onPreviewScaleChange(value: number) {
    previewScale.value = value;
  }

  function onPreviewInteractionStateChange(payload: { mode: 'auto' | 'manual'; scale: number }) {
    previewInteractionMode.value = payload.mode;
    previewScale.value = payload.scale;
  }

  function onPreviewChange(payload: { mode: PortalPreviewMode; viewport: PortalPreviewViewport }) {
    previewMode.value = payload.mode;
    previewViewport.value = payload.viewport;
    postPreviewViewport();
  }

  function onPreviewInteractionChange(payload: { mode: 'auto' | 'manual' }) {
    previewInteractionMode.value = payload.mode;
    options.previewTarget.value?.setInteractionMode(payload.mode);
  }

  function onZoomInPreview() {
    options.previewTarget.value?.zoomIn();
  }

  function onZoomOutPreview() {
    options.previewTarget.value?.zoomOut();
  }

  function onResetPreviewView() {
    options.previewTarget.value?.resetView();
  }

  function onPreviewFrameLoad() {
    postPreviewViewport();
    const draftDetails =
      (shellSettingVisible.value && shellPreviewDetailsDraft.value) ||
      (pageSettingsSession.visible.value &&
        (pageSettingsSession.activeTab.value === 'header' ||
          pageSettingsSession.activeTab.value === 'footer') &&
        pageSettingsSession.pageShellPreviewDetailsDraft.value) ||
      '';

    if (draftDetails) {
      postShellPreviewDetails(draftDetails);
    }

    const runtimeSettings = pageSettingsSession.visible.value
      ? pageSettingsSession.form.value
      : pageSettingsSession.persisted.value;
    postPageRuntimePreview(runtimeSettings);
  }

  watch(
    () => workbench.currentTabId.value,
    () => {
      if (!workbench.currentTabId.value) {
        previewInteractionMode.value = 'auto';
      }
      pageSettingsSession.resetOnCurrentTabChange();
    }
  );

  watch(pageSettingsSession.visible, (opened) => {
    if (opened) {
      pageSettingsSession.onDrawerOpened(workbench.currentTabId.value);
      return;
    }

    const closeState = pageSettingsSession.onDrawerClosed(
      workbench.templateInfo.value?.details || ''
    );
    if (closeState.restoreShellDetails !== null) {
      postShellPreviewDetails(closeState.restoreShellDetails);
    }
    if (closeState.restoreRuntimeSettings) {
      postPageRuntimePreview(closeState.restoreRuntimeSettings);
    }
  });

  watch(shellSettingVisible, (opened) => {
    if (opened) {
      shellPreviewDetailsDraft.value = '';
      shellSettingSavedInThisRound.value = false;
      return;
    }
    if (shellSettingSavedInThisRound.value) {
      shellSettingSavedInThisRound.value = false;
      return;
    }

    const persistedDetails = workbench.templateInfo.value?.details || '';
    shellPreviewDetailsDraft.value = '';
    postShellPreviewDetails(persistedDetails);
  });

  watch(
    () =>
      [
        previewFrameSrc.value,
        workbench.currentTabId.value,
        shellSettingVisible.value,
        shellPreviewDetailsDraft.value
      ] as const,
    async ([, tabId, opened, draftDetails]) => {
      if (!(opened && draftDetails && tabId)) {
        return;
      }
      await nextTick();
      postShellPreviewDetails(draftDetails);
    }
  );

  watch(
    () =>
      [
        previewFrameSrc.value,
        workbench.currentTabId.value,
        pageSettingsSession.visible.value,
        pageSettingsSession.activeTab.value,
        pageSettingsSession.pageShellPreviewDetailsDraft.value
      ] as const,
    async ([, tabId, opened, activeTab, draftDetails]) => {
      if (
        !(opened && (activeTab === 'header' || activeTab === 'footer') && draftDetails && tabId)
      ) {
        return;
      }
      await nextTick();
      postShellPreviewDetails(draftDetails);
    }
  );

  return {
    ...workbench,
    pageSettingsVisible: pageSettingsSession.visible,
    pageSettingsLoading: pageSettingsSession.loading,
    pageSettingsSaving: pageSettingsSession.saving,
    pageSettingsActiveTab: pageSettingsSession.activeTab,
    pageSettingsEditingTabId: pageSettingsSession.editingTabId,
    pageSettingsForm: pageSettingsSession.form,
    pageSettingsPersisted: pageSettingsSession.persisted,
    pageSettingsComponents: pageSettingsSession.components,
    pageShellSettingSaving: pageSettingsSession.pageShellSaving,
    pageShellPreviewDetailsDraft: pageSettingsSession.pageShellPreviewDetailsDraft,
    pageSettingsCurrentTabId,
    pageSettingsCurrentTabName,
    shellSettingVisible,
    shellSettingSaving,
    previewMode,
    previewViewport,
    previewScale,
    previewInteractionMode,
    previewFrameSrc,
    editCurrentTab,
    openCurrentPageSettings,
    toggleCurrentTabHide,
    deleteCurrentTab,
    openPreviewWindow,
    openPageSettingsDrawer,
    onPageSettingsPreviewChange,
    onSubmitPageSettings,
    openShellSettings,
    onShellPreviewChange,
    onSubmitShellSetting,
    onPageShellPreviewChange,
    onSubmitPageShellSetting,
    onPreviewScaleChange,
    onPreviewInteractionStateChange,
    onPreviewChange,
    onPreviewInteractionChange,
    onZoomInPreview,
    onZoomOutPreview,
    onResetPreviewView,
    onPreviewFrameLoad
  };
}

export type TemplateWorkbenchPageController = ReturnType<
  typeof createTemplateWorkbenchPageController
>;
