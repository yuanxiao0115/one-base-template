<script setup lang="ts">
  import { computed, nextTick, ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { confirm, message } from "@one-base-template/ui";
  import {
    createPortalPageSettingsSession,
    normalizePortalPageSettingsV2,
    PortalDesignerPreviewFrame,
    PREVIEW_MODE_SAFE,
    PREVIEW_VIEWPORT_DEFAULT,
    sendPreviewRuntime,
    sendPreviewShellDetails,
    sendPreviewViewport,
    type BizResponse,
    type PortalPageSettingsDrawerTab,
    type PortalPageSettingsV2,
    type PortalPreviewFrameTarget,
    type PortalPreviewMode,
    type PortalPreviewViewport,
    usePortalCurrentTabActions,
    useTemplateWorkbench,
  } from "@one-base-template/portal-engine";

  import { portalApi } from "../../api";
  import { findTabById, isPortalTabEditable } from "../../utils/portalTree";
  import {
    loadPortalTabPageSettings,
    savePortalTabPageSettings,
  } from "../composables/portal-template/usePortalTabPageSettings";

  import PortalDesignerActionStrip from "../components/portal-template/PortalDesignerActionStrip.vue";
  import PortalDesignerHeaderBar from "../components/portal-template/PortalDesignerHeaderBar.vue";
  import PortalDesignerTreePanel from "../components/portal-template/PortalDesignerTreePanel.vue";
  import PortalPageSettingsDrawer from "../components/portal-template/PortalPageSettingsDrawer.vue";
  import PortalShellSettingsDialog from "../components/portal-template/PortalShellSettingsDialog.vue";
  import TabAttributeDialog from "../components/portal-template/TabAttributeDialog.vue";

  defineOptions({
    name: "PortalDesigner",
  });

  const route = useRoute();
  const router = useRouter();

  const templateId = computed(() => {
    const id = route.query.id;
    if (typeof id === "string") {
      return id;
    }
    const nextTemplateId = route.query.templateId;
    return typeof nextTemplateId === "string" ? nextTemplateId : "";
  });

  const routeTabId = computed(() => {
    const value = route.query.tabId;
    return typeof value === "string" ? value : "";
  });

  function cloneByJson<T>(input: T): T {
    return JSON.parse(JSON.stringify(input)) as T;
  }

  type BizResLike = Pick<BizResponse<unknown>, "code" | "message" | "success">;

  function normalizeBizOk(res: BizResLike | null | undefined): boolean {
    const code = res?.code;
    return res?.success === true || code === 0 || code === 200 || String(code) === "0" || String(code) === "200";
  }

  function updateRouteTabId(tabId: string) {
    const next = tabId || undefined;
    const current = routeTabId.value || undefined;
    if (current === next) {
      return;
    }

    router
      .replace({
        query: {
          ...route.query,
          tabId: next,
        },
      })
      .catch((error) => {
        console.warn("[PortalTemplateSettingPage] 更新路由参数失败", error);
      });
  }

  const pageSettingsSession = createPortalPageSettingsSession<PortalPageSettingsV2>({
    clone: cloneByJson,
  });
  const {
    visible: pageSettingsVisible,
    loading: pageSettingsLoading,
    saving: pageSettingsSaving,
    activeTab: pageSettingsActiveTab,
    editingTabId: pageSettingsEditingTabId,
    form: pageSettingsForm,
    persisted: pageSettingsPersisted,
    components: pageSettingsComponents,
    pageShellSaving: pageShellSettingSaving,
    pageShellPreviewDetailsDraft,
  } = pageSettingsSession;

  const workbench = useTemplateWorkbench({
    templateId,
    routeTabId,
    lockedTabId: computed(() => (pageSettingsVisible.value ? pageSettingsEditingTabId.value : "")),
    api: {
      template: {
        detail: portalApi.template.detail,
        update: portalApi.template.update,
        hideToggle: portalApi.template.hideToggle,
      },
      tab: {
        detail: portalApi.tab.detail,
        add: portalApi.tab.add,
        update: portalApi.tab.update,
        delete: portalApi.tab.delete,
      },
    },
    notify: {
      success: (text) => message.success(text),
      error: (text) => message.error(text),
      warning: (text) => message.warning(text),
    },
    confirm: async ({ message: text, title }) => {
      await confirm.warn(text, title);
    },
    syncRouteTabId: updateRouteTabId,
    openEditor: ({ templateId: nextTemplateId, tabId }) => {
      router.push({
        path: "/portal/page/edit",
        query: {
          id: nextTemplateId,
          tabId,
        },
      });
    },
  });

  const {
    loading,
    creating,
    sortingTabs,
    templateInfo,
    currentTabId,
    currentTab,
    attrVisible,
    attrMode,
    attrLoading,
    attrInitial,
    setCurrentTab,
    loadTemplate,
    openCreateRoot,
    openCreateSibling,
    openCreateChild,
    openAttribute,
    onSubmitAttr,
    toggleHide,
    deleteTab,
    onTreeSortDrop,
    onEdit,
  } = workbench;

  const shellSettingVisible = ref(false);
  const shellSettingSaving = ref(false);
  const shellSettingSavedInThisRound = ref(false);
  const previewMode = ref<PortalPreviewMode>(PREVIEW_MODE_SAFE);
  const previewViewport = ref<PortalPreviewViewport>(PREVIEW_VIEWPORT_DEFAULT);
  const previewScale = ref(1);
  const previewInteractionMode = ref<"auto" | "manual">("auto");
  const shellPreviewDetailsDraft = ref("");

  interface PreviewFrameExpose extends PortalPreviewFrameTarget {
    setInteractionMode: (mode: "auto" | "manual") => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
  }

  const previewFrameRef = ref<PreviewFrameExpose | null>(null);

  const pageSettingsCurrentTabId = computed(() =>
    pageSettingsVisible.value && pageSettingsEditingTabId.value ? pageSettingsEditingTabId.value : currentTabId.value
  );
  const pageSettingsCurrentTab = computed(() =>
    findTabById(templateInfo.value?.tabList ?? [], pageSettingsCurrentTabId.value)
  );
  const pageSettingsCurrentTabName = computed(() => {
    const value = pageSettingsCurrentTab.value?.tabName;
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    return "未命名页面";
  });

  const {
    editCurrentTab,
    openCurrentPageSettings,
    toggleCurrentTabHide,
    deleteCurrentTab,
    openPreviewWindow,
  } = usePortalCurrentTabActions({
    templateId,
    currentTabId,
    currentTab,
    previewMode,
    resolvePreviewHref: ({ templateId: nextTemplateId, tabId, previewMode: nextPreviewMode }) =>
      router.resolve({
        name: "PortalPreview",
        query: {
          templateId: nextTemplateId,
          tabId,
          previewMode: nextPreviewMode,
        },
      }).href,
    notifyWarning: (text) => message.warning(text),
    onEditTab: onEdit,
    onOpenPageSettings: openPageSettingsDrawer,
    onOpenAttribute: openAttribute,
    onToggleHide: toggleHide,
    onDeleteTab: deleteTab,
    isTabEditable: (tab) => isPortalTabEditable(tab.tabType),
  });

  const previewFrameSrc = computed(() => {
    if (!(templateId.value && currentTabId.value)) {
      return "";
    }
    return router.resolve({
      name: "PortalPreview",
      query: {
        templateId: templateId.value,
        tabId: currentTabId.value,
        previewMode: previewMode.value,
      },
    }).href;
  });

  function postShellPreviewDetails(details: string) {
    if (!(templateId.value && currentTabId.value)) {
      return;
    }

    sendPreviewShellDetails(previewFrameRef.value, {
      details,
      templateId: templateId.value,
      tabId: currentTabId.value,
    });
  }

  function postPreviewViewport() {
    if (!(templateId.value && currentTabId.value)) {
      return;
    }
    sendPreviewViewport(previewFrameRef.value, {
      templateId: templateId.value,
      tabId: currentTabId.value,
      width: previewViewport.value.width,
      height: previewViewport.value.height,
    });
  }

  function postPageRuntimePreview(settings: PortalPageSettingsV2 | null | undefined): boolean {
    if (!(templateId.value && currentTabId.value && settings)) {
      return false;
    }

    const normalizedSettings = normalizePortalPageSettingsV2(settings);
    const runtimeComponents = Array.isArray(pageSettingsComponents.value) ? cloneByJson(pageSettingsComponents.value) : [];
    return sendPreviewRuntime(previewFrameRef.value, {
      templateId: templateId.value,
      tabId: currentTabId.value,
      settings: cloneByJson(normalizedSettings),
      component: runtimeComponents,
    });
  }

  async function openPageSettingsDrawer(tabId: string, targetTab: PortalPageSettingsDrawerTab = "layout") {
    if (!tabId || pageSettingsLoading.value) {
      return;
    }
    if (pageSettingsVisible.value && pageSettingsEditingTabId.value && pageSettingsEditingTabId.value !== tabId) {
      message.warning("页面设置已打开，请先保存或关闭后再切换页面");
      return;
    }

    pageSettingsSession.prepareOpen(tabId, targetTab);
    try {
      const detail = await loadPortalTabPageSettings(tabId);
      if (pageSettingsEditingTabId.value !== tabId) {
        pageSettingsSession.failOpen();
        return;
      }
      pageSettingsSession.applyLoadedDetail({
        settings: detail.settings,
        components: detail.components,
      });
      postPageRuntimePreview(pageSettingsForm.value);
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : "加载页面设置失败";
      pageSettingsSession.failOpen();
      message.error(text);
    }
  }

  function onPageSettingsPreviewChange(settings: PortalPageSettingsV2) {
    postPageRuntimePreview(settings);
  }

  async function onSubmitPageSettings(settings: PortalPageSettingsV2) {
    const editingTabId = pageSettingsEditingTabId.value || currentTabId.value;
    if (!(templateId.value && editingTabId) || pageSettingsSaving.value) {
      return;
    }

    pageSettingsSaving.value = true;
    try {
      await savePortalTabPageSettings({
        tabId: editingTabId,
        templateId: templateId.value,
        settings,
      });
      message.success("页面设置保存成功");
      pageSettingsSession.markPageSettingsSaved(settings);
      postPageRuntimePreview(pageSettingsForm.value);
      await loadTemplate(editingTabId);
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : "页面设置保存失败";
      message.error(text);
    } finally {
      pageSettingsSaving.value = false;
    }
  }

  function onBack() {
    router.push("/portal/setting");
  }

  function onPreviewScaleChange(value: number) {
    previewScale.value = value;
  }

  function onPreviewInteractionStateChange(payload: { mode: "auto" | "manual"; scale: number }) {
    previewInteractionMode.value = payload.mode;
    previewScale.value = payload.scale;
  }

  function onPreviewChange(payload: { mode: PortalPreviewMode; viewport: PortalPreviewViewport }) {
    previewMode.value = payload.mode;
    previewViewport.value = payload.viewport;
    postPreviewViewport();
  }

  function onPreviewInteractionChange(payload: { mode: "auto" | "manual" }) {
    previewInteractionMode.value = payload.mode;
    previewFrameRef.value?.setInteractionMode(payload.mode);
  }

  function onZoomInPreview() {
    previewFrameRef.value?.zoomIn();
  }

  function onZoomOutPreview() {
    previewFrameRef.value?.zoomOut();
  }

  function onResetPreviewView() {
    previewFrameRef.value?.resetView();
  }

  function onPreviewFrameLoad() {
    postPreviewViewport();
    const draftDetails =
      (shellSettingVisible.value && shellPreviewDetailsDraft.value) ||
      (
        pageSettingsVisible.value &&
        (pageSettingsActiveTab.value === "header" || pageSettingsActiveTab.value === "footer") &&
        pageShellPreviewDetailsDraft.value
      ) ||
      "";
    if (draftDetails) {
      postShellPreviewDetails(draftDetails);
    }
    const runtimeSettings = pageSettingsVisible.value ? pageSettingsForm.value : pageSettingsPersisted.value;
    postPageRuntimePreview(runtimeSettings);
  }

  function openShellSettings() {
    if (!templateInfo.value) {
      message.warning("请先选择门户模板");
      return;
    }
    shellSettingVisible.value = true;
  }

  function onShellPreviewChange(payload: { details: string }) {
    shellPreviewDetailsDraft.value = payload.details;
    postShellPreviewDetails(payload.details);
  }

  async function onSubmitShellSetting(payload: { details: string }) {
    if (!templateId.value || shellSettingSaving.value) {
      return;
    }

    shellSettingSaving.value = true;
    try {
      const currentTemplate = templateInfo.value ?? {};
      const res = await portalApi.template.update({
        ...currentTemplate,
        id: templateId.value,
        details: payload.details,
      });
      if (!normalizeBizOk(res)) {
        message.error(res?.message || "页眉页脚配置保存失败");
        return;
      }

      message.success("页眉页脚配置保存成功");
      shellSettingSavedInThisRound.value = true;
      shellPreviewDetailsDraft.value = payload.details;
      shellSettingVisible.value = false;
      await loadTemplate(currentTabId.value);
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : "页眉页脚配置保存失败";
      message.error(text);
    } finally {
      shellSettingSaving.value = false;
    }
  }

  function onPageShellPreviewChange(payload: { details: string }) {
    pageSettingsSession.markPageShellPreviewDraft(payload.details);
    postShellPreviewDetails(payload.details);
  }

  async function onSubmitPageShellSetting(payload: { details: string }) {
    const editingTabId = pageSettingsEditingTabId.value || currentTabId.value;
    if (!(templateId.value && editingTabId) || pageShellSettingSaving.value) {
      return;
    }

    pageShellSettingSaving.value = true;
    try {
      const currentTemplate = templateInfo.value ?? {};
      const res = await portalApi.template.update({
        ...currentTemplate,
        id: templateId.value,
        details: payload.details,
      });
      if (!normalizeBizOk(res)) {
        message.error(res?.message || "页面级页眉页脚配置保存失败");
        return;
      }

      message.success("页面级页眉页脚配置保存成功");
      pageSettingsSession.markPageShellSaved(payload.details);
      await loadTemplate(editingTabId);
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : "页面级页眉页脚配置保存失败";
      message.error(text);
    } finally {
      pageShellSettingSaving.value = false;
    }
  }

  watch(
    () => currentTabId.value,
    () => {
      if (!currentTabId.value) {
        previewInteractionMode.value = "auto";
      }
      pageSettingsSession.resetOnCurrentTabChange();
    }
  );

  watch(pageSettingsVisible, (opened) => {
    if (opened) {
      pageSettingsSession.onDrawerOpened(currentTabId.value);
      return;
    }
    const closeState = pageSettingsSession.onDrawerClosed(templateInfo.value?.details || "");
    if (closeState.restoreShellDetails !== null) {
      postShellPreviewDetails(closeState.restoreShellDetails);
    }
    if (closeState.restoreRuntimeSettings) {
      postPageRuntimePreview(closeState.restoreRuntimeSettings);
    }
  });

  watch(shellSettingVisible, (opened) => {
    if (opened) {
      shellPreviewDetailsDraft.value = "";
      shellSettingSavedInThisRound.value = false;
      return;
    }
    if (shellSettingSavedInThisRound.value) {
      shellSettingSavedInThisRound.value = false;
      return;
    }
    const persistedDetails = templateInfo.value?.details || "";
    shellPreviewDetailsDraft.value = "";
    postShellPreviewDetails(persistedDetails);
  });

  watch(
    () => [previewFrameSrc.value, currentTabId.value, shellSettingVisible.value, shellPreviewDetailsDraft.value] as const,
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
        currentTabId.value,
        pageSettingsVisible.value,
        pageSettingsActiveTab.value,
        pageShellPreviewDetailsDraft.value,
      ] as const,
    async ([, tabId, opened, activeTab, draftDetails]) => {
      if (!(opened && (activeTab === "header" || activeTab === "footer") && draftDetails && tabId)) {
        return;
      }
      await nextTick();
      postShellPreviewDetails(draftDetails);
    }
  );

  void loadTemplate();
</script>

<template>
  <div class="page">
    <PortalDesignerHeaderBar
      :title="templateInfo?.templateName || '门户配置工作台'"
      :template-id="templateId"
      :loading="loading"
      @back="onBack"
      @refresh="loadTemplate(currentTabId)"
      @shell-settings="openShellSettings"
    />

    <div v-loading="loading" class="layout">
      <aside class="tree-pane">
        <PortalDesignerTreePanel
          class="tree-content"
          :tabs="templateInfo?.tabList ?? []"
          :current-tab-id="currentTabId"
          :sorting="sortingTabs"
          @create-root="openCreateRoot"
          @select="setCurrentTab"
          @edit="onEdit"
          @create-sibling="openCreateSibling"
          @create-child="openCreateChild"
          @attribute="openAttribute"
          @toggle-hide="toggleHide"
          @delete="deleteTab"
          @sort-drop="onTreeSortDrop"
        />
      </aside>

      <section class="editor-pane">
        <PortalDesignerActionStrip
          :current-tab="currentTab"
          :preview-scale="previewScale"
          :interaction-mode="previewInteractionMode"
          @edit="editCurrentTab"
          @page-settings="openCurrentPageSettings"
          @toggle-hide="toggleCurrentTabHide"
          @preview="openPreviewWindow"
          @delete="deleteCurrentTab"
          @preview-change="onPreviewChange"
          @interaction-change="onPreviewInteractionChange"
          @zoom-in="onZoomInPreview"
          @zoom-out="onZoomOutPreview"
          @reset-view="onResetPreviewView"
        />

        <PortalDesignerPreviewFrame
          ref="previewFrameRef"
          :template-id="templateId"
          :current-tab-id="currentTabId"
          :preview-frame-src="previewFrameSrc"
          :viewport-width="previewViewport.width"
          :viewport-height="previewViewport.height"
          @create-root="openCreateRoot"
          @scale-change="onPreviewScaleChange"
          @interaction-state-change="onPreviewInteractionStateChange"
          @frame-load="onPreviewFrameLoad"
        />
      </section>
    </div>

    <TabAttributeDialog
      v-model="attrVisible"
      :mode="attrMode"
      :loading="creating || attrLoading"
      :initial="attrInitial"
      @submit="onSubmitAttr"
    />

    <PortalPageSettingsDrawer
      v-model="pageSettingsVisible"
      v-model:active-tab="pageSettingsActiveTab"
      :loading="pageSettingsSaving"
      :shell-loading="pageShellSettingSaving"
      :page-name="pageSettingsCurrentTabName"
      :settings="pageSettingsForm"
      :details="templateInfo?.details || ''"
      :tabs="templateInfo?.tabList || []"
      :current-tab-id="pageSettingsCurrentTabId"
      @preview-change="onPageSettingsPreviewChange"
      @preview-shell-change="onPageShellPreviewChange"
      @submit="onSubmitPageSettings"
      @submit-shell="onSubmitPageShellSetting"
    />

    <PortalShellSettingsDialog
      v-model="shellSettingVisible"
      :loading="shellSettingSaving"
      :details="templateInfo?.details || ''"
      :tabs="templateInfo?.tabList || []"
      @submit="onSubmitShellSetting"
      @preview-change="onShellPreviewChange"
    />
  </div>
</template>

<style scoped>
  .page {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    background: #fff;
  }

  .layout {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    background: #fff;
  }

  .tree-pane {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-right: 1px solid #e5ebf2;
    overflow: hidden;
    background: #fff;
  }

  .tree-content {
    flex: 1;
    min-height: 0;
  }

  .editor-pane {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    background: #fff;
  }

  .page :deep(.el-button) {
    border-radius: 0;
  }

  .page :deep(.el-input__wrapper) {
    border-radius: 0;
  }

  @media (max-width: 1366px) {
    .layout {
      grid-template-columns: 300px minmax(0, 1fr);
    }
  }

  @media (max-width: 960px) {
    .layout {
      grid-template-columns: 1fr;
      grid-template-rows: 340px minmax(0, 1fr);
    }
  }
</style>
