/* eslint-disable @typescript-eslint/no-explicit-any */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { deepClone } from '../utils/deep';

export type PortalLayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  component?: {
    cmptConfig?: any;
  };
};

export const usePortalPageLayoutStore = defineStore('portalPageLayout', () => {
  // 当前画布中的所有组件
  const layoutItems = ref<PortalLayoutItem[]>([]);

  // 当前选中的组件ID
  const currentLayoutItemId = ref<string | null>(null);

  // 组件配置表单数据（选中组件时从 item.component.cmptConfig 深拷贝出来）
  const configForm = ref<any>({});

  // 当前激活的属性标签页
  const activeName = ref<'content' | 'style'>('content');

  // 组件加载状态（用于骨架屏/过渡）
  const loadingComponents = ref({ content: false, style: false });

  const currentLayoutItem = computed(() => {
    if (!currentLayoutItemId.value) return null;
    return layoutItems.value.find((item) => item.i === currentLayoutItemId.value) || null;
  });

  const contentComponentName = computed(() => configForm.value?.content?.name);
  const styleComponentName = computed(() => configForm.value?.style?.name);
  const componentBaseName = computed(() => configForm.value?.index?.name);

  function selectLayoutItem(itemId: string) {
    if (currentLayoutItemId.value === itemId) return;

    currentLayoutItemId.value = itemId;
    const item = layoutItems.value.find((i) => i.i === itemId);

    if (item?.component?.cmptConfig) {
      configForm.value = deepClone(item.component.cmptConfig);
      activeName.value = 'content';

      // 轻量过渡：给 UI 一个“切换中”的机会
      loadingComponents.value = { content: true, style: true };
      setTimeout(() => {
        loadingComponents.value = { content: false, style: false };
      }, 50);
    } else {
      configForm.value = {};
    }
  }

  function deselectLayoutItem() {
    currentLayoutItemId.value = null;
    configForm.value = {};
  }

  function updateLayoutItems(next: PortalLayoutItem[]) {
    layoutItems.value = next;

    // 选中项被删除时，清空选中状态
    if (!currentLayoutItemId.value) return;
    const stillExists = next.some((i) => i.i === currentLayoutItemId.value);
    if (!stillExists) deselectLayoutItem();
  }

  function removeLayoutItem(itemId: string) {
    updateLayoutItems(layoutItems.value.filter((i) => i.i !== itemId));
  }

  function updateCurrentItemConfig(config: any) {
    if (!currentLayoutItemId.value) return;

    const cloned = deepClone(config);
    configForm.value = cloned;

    const idx = layoutItems.value.findIndex((i) => i.i === currentLayoutItemId.value);
    if (idx === -1) return;

    const item = layoutItems.value[idx];
    if (!item) return;
    if (!item.component) item.component = {};
    item.component.cmptConfig = deepClone(cloned);
  }

  function reset() {
    layoutItems.value = [];
    deselectLayoutItem();
  }

  return {
    layoutItems,
    currentLayoutItemId,
    configForm,
    activeName,
    loadingComponents,
    currentLayoutItem,
    contentComponentName,
    styleComponentName,
    componentBaseName,
    reset,
    selectLayoutItem,
    deselectLayoutItem,
    updateLayoutItems,
    removeLayoutItem,
    updateCurrentItemConfig,
  };
});
