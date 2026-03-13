<script setup lang="ts">
  import { computed, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { confirm, message } from "@one-base-template/ui";
  import {
    PortalDesignerPreviewFrame,
    PortalTemplateWorkbenchShell,
    type TemplateWorkbenchPagePreviewTarget,
    useTemplateWorkbenchPage,
  } from "@one-base-template/portal-engine";

  import { portalApi } from "../../api";
  import { setupPortalEngineForAdmin } from "../../engine/register";

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
  const portalEngineContext = setupPortalEngineForAdmin();

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

  const previewFrameRef = ref<TemplateWorkbenchPagePreviewTarget | null>(null);

  const workbenchPage = useTemplateWorkbenchPage({
    context: portalEngineContext,
    templateId,
    routeTabId,
    previewTarget: previewFrameRef,
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
    resolvePreviewHref: ({ templateId: nextTemplateId, tabId, previewMode }) =>
      router.resolve({
        name: "PortalPreview",
        query: {
          templateId: nextTemplateId,
          tabId,
          previewMode,
        },
      }).href,
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
    shellSettingVisible,
    shellSettingSaving,
    previewScale,
    previewInteractionMode,
    previewViewport,
    previewFrameSrc,
    pageSettingsVisible,
    pageSettingsActiveTab,
    pageSettingsSaving,
    pageShellSettingSaving,
    pageSettingsForm,
    pageSettingsCurrentTabId,
    pageSettingsCurrentTabName,
    editCurrentTab,
    openCurrentPageSettings,
    toggleCurrentTabHide,
    deleteCurrentTab,
    openPreviewWindow,
    openShellSettings,
    onShellPreviewChange,
    onSubmitShellSetting,
    onPageSettingsPreviewChange,
    onPageShellPreviewChange,
    onSubmitPageSettings,
    onSubmitPageShellSetting,
    onPreviewScaleChange,
    onPreviewInteractionStateChange,
    onPreviewChange,
    onPreviewInteractionChange,
    onZoomInPreview,
    onZoomOutPreview,
    onResetPreviewView,
    onPreviewFrameLoad,
  } = workbenchPage;

  function onBack() {
    router.push("/portal/setting");
  }

  void loadTemplate();
</script>

<template>
  <PortalTemplateWorkbenchShell :loading="loading">
    <template #header>
      <PortalDesignerHeaderBar
        :title="templateInfo?.templateName || '门户配置工作台'"
        :template-id="templateId"
        :loading="loading"
        @back="onBack"
        @refresh="loadTemplate(currentTabId)"
        @shell-settings="openShellSettings"
      />
    </template>

    <template #tree>
      <PortalDesignerTreePanel
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
    </template>

    <template #toolbar>
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
    </template>

    <template #preview>
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
    </template>

    <template #dialogs>
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
    </template>
  </PortalTemplateWorkbenchShell>
</template>
