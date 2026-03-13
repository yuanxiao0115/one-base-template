import type { Ref } from "vue";
import type { Router } from "vue-router";

import type { PortalTab } from "../../../types";
import { isPortalTabEditable } from "../../../utils/portalTree";
import type { PortalPreviewMode } from "@one-base-template/portal-engine";

interface UsePortalCurrentTabActionsOptions {
  router: Router;
  templateId: Readonly<Ref<string>>;
  currentTabId: Readonly<Ref<string>>;
  currentTab: Readonly<Ref<PortalTab | null>>;
  previewMode: Readonly<Ref<PortalPreviewMode>>;
  notifyWarning: (message: string) => void;
  onEditTab: (tabId: string) => void;
  onOpenAttribute: (tab: PortalTab) => Promise<void> | void;
  onOpenPageSettings: (tabId: string) => Promise<void> | void;
  onToggleHide: (tab: PortalTab) => Promise<void> | void;
  onDeleteTab: (tab: PortalTab) => Promise<void> | void;
}

export function usePortalCurrentTabActions(options: UsePortalCurrentTabActionsOptions) {
  function editCurrentTab() {
    const tabId = options.currentTabId.value;
    const tab = options.currentTab.value;
    if (!(tabId && tab && isPortalTabEditable(tab.tabType))) {
      options.notifyWarning("请先选择可编辑页面");
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

  function openCurrentPageSettings() {
    const tabId = options.currentTabId.value;
    const tab = options.currentTab.value;
    if (!(tabId && tab)) {
      options.notifyWarning("请先选择页面");
      return;
    }
    void options.onOpenPageSettings(tabId);
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
    openCurrentPageSettings,
    openCurrentAttribute,
    toggleCurrentTabHide,
    deleteCurrentTab,
    openPreviewWindow,
  };
}
