import type { Component } from 'vue';
import { describe, expect, it } from 'vite-plus/test';

import { createPortalEngineContext } from '../runtime/context';

import { registerMaterialExtensions } from './registerMaterialExtensions';
import { usePortalMaterialCatalog } from './usePortalMaterialCatalog';

const TEST_INDEX_COMPONENT = {
  name: 'oa-todo-card-index'
} as Component;

const TEST_CONTENT_COMPONENT = {
  name: 'oa-todo-card-content'
} as Component;

const TEST_STYLE_COMPONENT = {
  name: 'oa-todo-card-style'
} as Component;

describe('registerMaterialExtensions', () => {
  it('可以注册新分类及其物料组件', () => {
    const context = createPortalEngineContext({ appId: 'extensions-new-category' });

    registerMaterialExtensions(context, [
      {
        category: {
          id: 'oa',
          title: 'OA组件',
          name: 'OA组件',
          cmptTypeName: 'OA组件'
        },
        materials: [
          {
            id: 'oa-todo-card',
            type: 'oa-todo-card',
            name: '待办卡片',
            icon: 'ri:todo-line',
            config: {
              index: { name: 'oa-todo-card-index' },
              content: { name: 'oa-todo-card-content' },
              style: { name: 'oa-todo-card-style' }
            },
            components: {
              index: TEST_INDEX_COMPONENT,
              content: TEST_CONTENT_COMPONENT,
              style: TEST_STYLE_COMPONENT
            }
          }
        ]
      }
    ]);

    const { categories, materialsMap } = usePortalMaterialCatalog({
      context,
      scene: 'editor'
    });
    const oaCategory = categories.find((category) => category.id === 'oa');

    expect(oaCategory?.title).toBe('OA组件');
    expect(oaCategory?.cmptList.some((item) => item.id === 'oa-todo-card')).toBe(true);
    expect(materialsMap['oa-todo-card-index']).toBe(TEST_INDEX_COMPONENT);
    expect(materialsMap['oa-todo-card-content']).toBe(TEST_CONTENT_COMPONENT);
    expect(materialsMap['oa-todo-card-style']).toBe(TEST_STYLE_COMPONENT);
  });

  it('可以向已有分类追加物料', () => {
    const context = createPortalEngineContext({ appId: 'extensions-basic-category' });

    registerMaterialExtensions(context, [
      {
        materials: [
          {
            id: 'basic-shortcut-grid',
            type: 'basic-shortcut-grid',
            name: '快捷入口',
            icon: 'ri:apps-line',
            category: {
              id: 'basic',
              title: '基础组件'
            },
            config: {
              index: { name: 'basic-shortcut-grid-index' }
            },
            components: {
              index: TEST_INDEX_COMPONENT
            }
          }
        ]
      }
    ]);

    const { categories, materialsMap } = usePortalMaterialCatalog({
      context,
      scene: 'renderer'
    });
    const basicCategory = categories.find((category) => category.id === 'basic');

    expect(basicCategory?.cmptList.some((item) => item.id === 'basic-shortcut-grid')).toBe(true);
    expect(materialsMap['basic-shortcut-grid-index']).toBe(TEST_INDEX_COMPONENT);
  });
});
