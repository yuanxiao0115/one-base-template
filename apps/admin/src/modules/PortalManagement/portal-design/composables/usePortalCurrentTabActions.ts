import type { Ref } from "vue";
import type { Router } from "vue-router";

import type { PortalTab } from "../../types";
import type { PortalPreviewMode } from "../../utils/preview";

interface UsePortalCurrentTabActionsOptions {
  router: Router;
  templateId: Readonly<Ref<string>>;
  currentTabId: Readonly<Ref<string>>;
  currentTab: Readonly<Ref<PortalTab | null>>;
  previewMode: Readonly<Ref<PortalPreviewMode>>;
  notifyWarning: (message: string) => void;
  onEditTab: (tabId: string) => void;
  onOpenAttribute: (tab: PortalTab) => Promise<void> | void;
  onOpenPermission: () => Promise<void> | void;
  onToggleHide: (tab: PortalTab) => Promise<void> | void;
  onDeleteTab: (tab: PortalTab) => Promise<void> | void;
}

export function usePortalCurrentTabActions(options: UsePortalCurrentTabActionsOptions) {
  function editCurrentTab() {
    const tabId = options.currentTabId.value;
    if (!tabId) {
      return;
    }
    options.onEditTab(tabId);
  }

  function openCurrentAttribute() {
    const tab = options.currentTab.value;
    if (!tab) {
      return;
    }
    void options.onOpenAttribute(tab);
  }

  function openCurrentPermission() {
    if (!(options.templateId.value && options.currentTabId.value)) {
      options.notifyWarning("请先选择页面");
      return;
    }
    void options.onOpenPermission();
  }

  function toggleCurrentTabHide() {
    const tab = options.currentTab.value;
    if (!tab) {
      return;
    }
    void options.onToggleHide(tab);
  }

  function deleteCurrentTab() {
    const tab = options.currentTab.value;
    if (!tab) {
      return;
    }
    void options.onDeleteTab(tab);
  }

  function openPreviewWindow() {
    if (!(options.templateId.value && options.currentTabId.value)) {
      options.notifyWarning("请先选择可预览页面");
      return;
    }

    const resolved = options.router.resolve({
      name: "PortalPreview",
      query: {
        templateId: options.templateId.value,
        tabId: options.currentTabId.value,
        previewMode: options.previewMode.value,
      },
    });

    window.open(resolved.href, "_blank", "noopener,noreferrer");
  }

  return {
    editCurrentTab,
    openCurrentAttribute,
    openCurrentPermission,
    toggleCurrentTabHide,
    deleteCurrentTab,
    openPreviewWindow,
  };
}
