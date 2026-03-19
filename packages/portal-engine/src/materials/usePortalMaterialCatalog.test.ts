import type { Component } from 'vue';
import { describe, expect, it } from 'vite-plus/test';

import { createPortalEngineContext } from '../runtime/context';
import { getPortalMaterialRegistryController } from '../registry/materials-registry';
import { registerPortalMaterialComponent } from './material-component-loader';
import { usePortalMaterialCatalog } from './usePortalMaterialCatalog';

const TEST_INDEX_COMPONENT = {
  name: 'custom-test-index'
} as Component;

describe('usePortalMaterialCatalog', () => {
  it('同一个 context 下 categories 和 materialsMap 应同时感知扩展物料', () => {
    const context = createPortalEngineContext({ appId: 'catalog-a' });
    const registry = getPortalMaterialRegistryController(context);

    registry.registerPortalMaterial(
      {
        id: 'catalog-test-material',
        type: 'catalog-test-material',
        cmptName: '目录测试物料',
        cmptWidth: 12,
        cmptHeight: 8,
        cmptIcon: 'ri:test-tube-line',
        cmptConfig: {
          index: { name: 'catalog-test-material-index' }
        }
      },
      {
        category: {
          id: 'catalog-test',
          title: '目录测试'
        }
      }
    );

    registerPortalMaterialComponent(
      {
        name: 'catalog-test-material-index',
        component: TEST_INDEX_COMPONENT,
        strategy: 'replace'
      },
      context
    );

    const { categories, materialsMap } = usePortalMaterialCatalog({
      context,
      scene: 'renderer'
    });

    expect(categories.some((category) => category.id === 'catalog-test')).toBe(true);
    expect(materialsMap['catalog-test-material-index']).toBe(TEST_INDEX_COMPONENT);
  });

  it('不同 context 的 categories 和 materialsMap 应保持隔离', () => {
    const contextA = createPortalEngineContext({ appId: 'catalog-a' });
    const contextB = createPortalEngineContext({ appId: 'catalog-b' });
    const registryA = getPortalMaterialRegistryController(contextA);

    registryA.registerPortalMaterial(
      {
        id: 'isolated-material',
        type: 'isolated-material',
        cmptName: '隔离物料',
        cmptWidth: 12,
        cmptHeight: 8,
        cmptIcon: 'ri:flask-line',
        cmptConfig: {
          index: { name: 'isolated-material-index' }
        }
      },
      {
        category: {
          id: 'isolated-category',
          title: '隔离分类'
        }
      }
    );

    registerPortalMaterialComponent(
      {
        name: 'isolated-material-index',
        component: TEST_INDEX_COMPONENT,
        strategy: 'replace'
      },
      contextA
    );

    const catalogA = usePortalMaterialCatalog({
      context: contextA,
      scene: 'renderer'
    });
    const catalogB = usePortalMaterialCatalog({
      context: contextB,
      scene: 'renderer'
    });

    expect(catalogA.categories.some((category) => category.id === 'isolated-category')).toBe(true);
    expect(catalogB.categories.some((category) => category.id === 'isolated-category')).toBe(false);
    expect(catalogA.materialsMap['isolated-material-index']).toBe(TEST_INDEX_COMPONENT);
    expect(catalogB.materialsMap['isolated-material-index']).toBeUndefined();
  });
});
