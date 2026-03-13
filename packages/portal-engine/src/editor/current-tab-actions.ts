import type { Ref } from 'vue';

export interface UsePortalCurrentTabActionsOptions<TTab, TPreviewMode = unknown> {
  templateId: Readonly<Ref<string>>;
  currentTabId: Readonly<Ref<string>>;
  currentTab: Readonly<Ref<TTab | null>>;
  previewMode: Readonly<Ref<TPreviewMode>>;
  resolvePreviewHref: (payload: { templateId: string; tabId: string; previewMode: TPreviewMode }) => string;
  isTabEditable?: (tab: TTab) => boolean;
  notifyWarning: (message: string) => void;
  onEditTab: (tabId: string) => void;
  onOpenAttribute: (tab: TTab) => Promise<void> | void;
  onOpenPageSettings: (tabId: string) => Promise<void> | void;
  onToggleHide: (tab: TTab) => Promise<void> | void;
  onDeleteTab: (tab: TTab) => Promise<void> | void;
  openWindow?: (href: string, target: string, features: string) => void;
}

function defaultOpenWindow(href: string, target: string, features: string) {
  if (typeof window !== 'undefined' && typeof window.open === 'function') {
    window.open(href, target, features);
  }
}

export function usePortalCurrentTabActions<TTab, TPreviewMode = unknown>(
  options: UsePortalCurrentTabActionsOptions<TTab, TPreviewMode>
) {
  function editCurrentTab() {
    const tabId = options.currentTabId.value;
    const tab = options.currentTab.value;
    if (!tabId || !tab) {
      options.notifyWarning('请先选择可编辑页面');
      return;
    }

    if (options.isTabEditable && !options.isTabEditable(tab)) {
      options.notifyWarning('请先选择可编辑页面');
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
      options.notifyWarning('请先选择页面');
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
      options.notifyWarning('请先选择可预览页面');
      return;
    }

    const href = options.resolvePreviewHref({
      templateId: options.templateId.value,
      tabId: options.currentTabId.value,
      previewMode: options.previewMode.value,
    });

    (options.openWindow || defaultOpenWindow)(href, '_blank', 'noopener,noreferrer');
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
