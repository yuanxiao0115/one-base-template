/* eslint-disable @typescript-eslint/no-explicit-any */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { BASE_TAB_CONTAINER_INDEX_NAME, normalizeTabContainerTabs } from '../schema/tab-container';
import { deepClone } from '../utils/deep';

export interface PortalLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  component?: {
    cmptConfig?: any;
  };
  [k: string]: unknown;
}

export interface PortalTabLayoutGroup {
  id: string;
  title?: string;
  layoutItems: PortalLayoutItem[];
  [k: string]: unknown;
}

export type PortalLayoutSelection =
  | { type: 'root-item'; itemId: string }
  | { type: 'tab-child-item'; parentItemId: string; tabId: string; itemId: string };

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

export function resolveLayoutItemComponentName(item: PortalLayoutItem | null | undefined): string | undefined {
  const name = item?.component?.cmptConfig?.index?.name;
  return typeof name === 'string' ? name : undefined;
}

export function isTabContainerLayoutItem(item: PortalLayoutItem | null | undefined): boolean {
  return resolveLayoutItemComponentName(item) === BASE_TAB_CONTAINER_INDEX_NAME;
}

export const usePortalPageLayoutStore = defineStore('portalPageLayout', () => {
  // 当前画布中的所有组件
  const layoutItems = ref<PortalLayoutItem[]>([]);

  // 当前选中的上下文（根组件 or Tab 子组件）
  const currentSelection = ref<PortalLayoutSelection | null>(null);

  // 组件配置表单数据（选中组件时从 item.component.cmptConfig 深拷贝出来）
  const configForm = ref<any>({});

  // 当前激活的属性标签页
  const activeName = ref<'content' | 'style'>('content');

  // 组件加载状态（用于骨架屏/过渡）
  const loadingComponents = ref({
    content: false,
    style: false,
  });

  const currentSelectionType = computed<PortalLayoutSelection['type'] | null>(() => currentSelection.value?.type || null);

  const currentLayoutItemId = computed<string | null>(() => {
    if (!currentSelection.value) {
      return null;
    }
    return currentSelection.value.itemId;
  });

  const currentRootLayoutItemId = computed<string | null>(() => {
    if (!currentSelection.value) {
      return null;
    }
    if (currentSelection.value.type === 'root-item') {
      return currentSelection.value.itemId;
    }
    return currentSelection.value.parentItemId;
  });

  function findRootLayoutItem(itemId: string): PortalLayoutItem | null {
    return layoutItems.value.find((item) => item.i === itemId) || null;
  }

  function resolveTabsOfRootItem(item: PortalLayoutItem | null): PortalTabLayoutGroup[] {
    if (!item) {
      return [];
    }
    return normalizeTabContainerTabs<PortalLayoutItem>(item.component?.cmptConfig?.content?.tabs);
  }

  function findTabGroup(rootItem: PortalLayoutItem | null, tabId: string): PortalTabLayoutGroup | null {
    const tabs = resolveTabsOfRootItem(rootItem);
    return tabs.find((tab) => tab.id === tabId) || null;
  }

  function resolveSelectedItem(selection: PortalLayoutSelection | null): PortalLayoutItem | null {
    if (!selection) {
      return null;
    }

    if (selection.type === 'root-item') {
      return findRootLayoutItem(selection.itemId);
    }

    const rootItem = findRootLayoutItem(selection.parentItemId);
    if (!rootItem) {
      return null;
    }
    const tab = findTabGroup(rootItem, selection.tabId);
    if (!tab) {
      return null;
    }
    return tab.layoutItems.find((item) => item.i === selection.itemId) || null;
  }

  const currentLayoutItem = computed(() => resolveSelectedItem(currentSelection.value));

  const currentParentLayoutItem = computed(() => {
    if (!currentSelection.value || currentSelection.value.type !== 'tab-child-item') {
      return null;
    }
    return findRootLayoutItem(currentSelection.value.parentItemId);
  });

  const currentTabId = computed(() => {
    if (!currentSelection.value || currentSelection.value.type !== 'tab-child-item') {
      return null;
    }
    return currentSelection.value.tabId;
  });

  const contentComponentName = computed(() => configForm.value?.content?.name);
  const styleComponentName = computed(() => configForm.value?.style?.name);
  const componentBaseName = computed(() => configForm.value?.index?.name);

  function syncConfigFormWithSelection(selection: PortalLayoutSelection | null) {
    const selectedItem = resolveSelectedItem(selection);
    if (selectedItem?.component?.cmptConfig) {
      configForm.value = deepClone(selectedItem.component.cmptConfig);
      activeName.value = 'content';
      loadingComponents.value = {
        content: true,
        style: true,
      };
      setTimeout(() => {
        loadingComponents.value = {
          content: false,
          style: false,
        };
      }, 50);
      return;
    }

    configForm.value = {};
  }

  function selectLayoutItem(itemId: string) {
    if (currentSelection.value?.type === 'root-item' && currentSelection.value.itemId === itemId) {
      return;
    }

    currentSelection.value = {
      type: 'root-item',
      itemId,
    };
    syncConfigFormWithSelection(currentSelection.value);
  }

  function selectTabChildItem(parentItemId: string, tabId: string, itemId: string) {
    if (
      currentSelection.value?.type === 'tab-child-item' &&
      currentSelection.value.parentItemId === parentItemId &&
      currentSelection.value.tabId === tabId &&
      currentSelection.value.itemId === itemId
    ) {
      return;
    }

    currentSelection.value = {
      type: 'tab-child-item',
      parentItemId,
      tabId,
      itemId,
    };
    syncConfigFormWithSelection(currentSelection.value);
  }

  function selectTabContainer(parentItemId: string) {
    selectLayoutItem(parentItemId);
  }

  function writeTabLayoutItems(parentItemId: string, tabId: string, nextItems: PortalLayoutItem[]): boolean {
    const rootItem = findRootLayoutItem(parentItemId);
    if (!rootItem) {
      return false;
    }

    if (!rootItem.component) {
      rootItem.component = {};
    }

    const cmptConfig = asRecord(rootItem.component.cmptConfig);
    const content = asRecord(cmptConfig.content);
    const tabs = normalizeTabContainerTabs<PortalLayoutItem>(content.tabs);
    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);

    if (tabIndex < 0) {
      return false;
    }

    const nextTabs = tabs.map((tab, idx) =>
      idx === tabIndex
        ? {
            ...tab,
            layoutItems: deepClone(nextItems),
          }
        : tab
    );

    content.tabs = nextTabs;
    cmptConfig.content = content;
    rootItem.component.cmptConfig = cmptConfig;
    return true;
  }

  function ensureSelectionStillValid() {
    if (!currentSelection.value) {
      return;
    }

    const selectedItem = resolveSelectedItem(currentSelection.value);
    if (selectedItem) {
      return;
    }

    if (currentSelection.value.type === 'tab-child-item') {
      const parentItemId = currentSelection.value.parentItemId;
      if (findRootLayoutItem(parentItemId)) {
        selectLayoutItem(parentItemId);
        return;
      }
    }

    deselectLayoutItem();
  }

  function deselectLayoutItem() {
    currentSelection.value = null;
    configForm.value = {};
  }

  function updateLayoutItems(next: PortalLayoutItem[]) {
    layoutItems.value = next;
    ensureSelectionStillValid();
  }

  function removeLayoutItem(itemId: string) {
    updateLayoutItems(layoutItems.value.filter((i) => i.i !== itemId));
  }

  function updateTabChildLayoutItems(parentItemId: string, tabId: string, nextItems: PortalLayoutItem[]) {
    const updated = writeTabLayoutItems(parentItemId, tabId, nextItems);
    if (!updated) {
      return;
    }
    ensureSelectionStillValid();
  }

  function removeTabChildLayoutItem(parentItemId: string, tabId: string, itemId: string) {
    const rootItem = findRootLayoutItem(parentItemId);
    const tab = findTabGroup(rootItem, tabId);
    if (!tab) {
      return;
    }

    const nextItems = tab.layoutItems.filter((item) => item.i !== itemId);
    updateTabChildLayoutItems(parentItemId, tabId, nextItems);
  }

  function getTabChildLayoutItems(parentItemId: string, tabId: string): PortalLayoutItem[] {
    const rootItem = findRootLayoutItem(parentItemId);
    const tab = findTabGroup(rootItem, tabId);
    if (!tab) {
      return [];
    }
    return tab.layoutItems;
  }

  function updateCurrentItemConfig(config: any) {
    if (!currentSelection.value) {
      return;
    }

    const cloned = deepClone(config);
    configForm.value = cloned;

    if (currentSelection.value.type === 'root-item') {
      const idx = layoutItems.value.findIndex((item) => item.i === currentSelection.value?.itemId);
      if (idx === -1) {
        return;
      }

      const item = layoutItems.value[idx];
      if (!item) {
        return;
      }
      if (!item.component) {
        item.component = {};
      }
      item.component.cmptConfig = deepClone(cloned);
      return;
    }

    const selection = currentSelection.value;
    const rootItem = findRootLayoutItem(selection.parentItemId);
    const tab = findTabGroup(rootItem, selection.tabId);
    if (!tab) {
      return;
    }

    const nextItems = tab.layoutItems.map((item) => {
      if (item.i !== selection.itemId) {
        return item;
      }
      return {
        ...item,
        component: {
          ...(item.component || {}),
          cmptConfig: deepClone(cloned),
        },
      };
    });

    updateTabChildLayoutItems(selection.parentItemId, selection.tabId, nextItems);
  }

  function updateTabContainerTabs(parentItemId: string, tabs: PortalTabLayoutGroup[], activeTabId?: string) {
    const rootItem = findRootLayoutItem(parentItemId);
    if (!rootItem) {
      return;
    }

    if (!rootItem.component) {
      rootItem.component = {};
    }

    const cmptConfig = asRecord(rootItem.component.cmptConfig);
    const content = asRecord(cmptConfig.content);
    content.tabs = deepClone(tabs);

    if (typeof activeTabId === 'string' && activeTabId.trim()) {
      content.activeTabId = activeTabId.trim();
    }

    cmptConfig.content = content;
    rootItem.component.cmptConfig = cmptConfig;
    ensureSelectionStillValid();
  }

  function reset() {
    layoutItems.value = [];
    deselectLayoutItem();
  }

  return {
    layoutItems,
    currentSelection,
    currentSelectionType,
    currentLayoutItemId,
    currentRootLayoutItemId,
    currentParentLayoutItem,
    currentTabId,
    configForm,
    activeName,
    loadingComponents,
    currentLayoutItem,
    contentComponentName,
    styleComponentName,
    componentBaseName,
    reset,
    selectLayoutItem,
    selectTabChildItem,
    selectTabContainer,
    deselectLayoutItem,
    updateLayoutItems,
    removeLayoutItem,
    updateTabChildLayoutItems,
    removeTabChildLayoutItem,
    getTabChildLayoutItems,
    updateTabContainerTabs,
    updateCurrentItemConfig,
  };
});
