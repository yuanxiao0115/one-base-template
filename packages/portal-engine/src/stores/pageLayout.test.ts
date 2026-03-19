import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { createPinia, setActivePinia } from 'pinia';

import type { PortalLayoutItem } from './pageLayout';
import { usePortalPageLayoutStore } from './pageLayout';

function createTabContainerLayoutItem(): PortalLayoutItem {
  return {
    i: 'root-tab-container',
    x: 0,
    y: 0,
    w: 12,
    h: 20,
    component: {
      cmptConfig: {
        index: { name: 'base-tab-container-index' },
        content: {
          tabs: [
            {
              id: 'tab-a',
              title: '页签A',
              layoutItems: [
                {
                  i: 'child-a1',
                  x: 0,
                  y: 0,
                  w: 6,
                  h: 8,
                  component: {
                    cmptConfig: {
                      index: { name: 'base-text-index' },
                      content: { text: 'old-content' },
                      style: { color: '#111111' }
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    }
  };
}

describe('portal pageLayout store (tab child selection)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('应支持选中 tab 子组件并暴露正确的上下文', () => {
    const store = usePortalPageLayoutStore();
    const rootItem = createTabContainerLayoutItem();
    store.updateLayoutItems([rootItem]);

    store.selectTabChildItem('root-tab-container', 'tab-a', 'child-a1');

    expect(store.currentSelectionType).toBe('tab-child-item');
    expect(store.currentRootLayoutItemId).toBe('root-tab-container');
    expect(store.currentLayoutItemId).toBe('child-a1');
    expect(store.currentLayoutItem?.i).toBe('child-a1');
    expect(store.componentBaseName).toBe('base-text-index');
  });

  it('应将 updateCurrentItemConfig 回写到 tab 子组件配置', () => {
    const store = usePortalPageLayoutStore();
    const rootItem = createTabContainerLayoutItem();
    store.updateLayoutItems([rootItem]);
    store.selectTabChildItem('root-tab-container', 'tab-a', 'child-a1');

    store.updateCurrentItemConfig({
      index: { name: 'base-text-index' },
      content: { text: 'new-content' },
      style: { color: '#222222' }
    });

    const savedContent = (
      store.layoutItems[0]?.component?.cmptConfig?.content?.tabs?.[0]?.layoutItems?.[0]?.component
        ?.cmptConfig?.content as Record<string, unknown> | undefined
    )?.text;

    expect(savedContent).toBe('new-content');
  });

  it('移除 tab 子组件后应自动回退到父容器选中态', () => {
    const store = usePortalPageLayoutStore();
    const rootItem = createTabContainerLayoutItem();
    store.updateLayoutItems([rootItem]);
    store.selectTabChildItem('root-tab-container', 'tab-a', 'child-a1');

    store.removeTabChildLayoutItem('root-tab-container', 'tab-a', 'child-a1');

    expect(store.currentSelectionType).toBe('root-item');
    expect(store.currentLayoutItemId).toBe('root-tab-container');
    expect(store.componentBaseName).toBe('base-tab-container-index');
  });
});
