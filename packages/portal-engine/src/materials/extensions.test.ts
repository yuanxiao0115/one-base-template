import type { Component } from 'vue';
import { describe, expect, it } from 'vite-plus/test';

import {
  definePortalMaterial,
  definePortalMaterialCategory,
  definePortalMaterialExtension
} from './extensions';

const TEST_INDEX_COMPONENT = {
  name: 'extension-helper-index'
} as Component;

describe('portal material extension helpers', () => {
  it('helper 可以返回可直接复用的分类与物料声明', () => {
    const category = definePortalMaterialCategory({
      id: 'marketing',
      title: '营销专区',
      name: '营销专区',
      cmptTypeName: '营销专区'
    });
    const material = definePortalMaterial({
      id: 'marketing-banner',
      type: 'marketing-banner',
      name: '营销横幅',
      icon: 'ri:advertisement-line',
      config: {
        index: { name: 'marketing-banner-index' }
      },
      components: {
        index: TEST_INDEX_COMPONENT
      }
    });
    const extension = definePortalMaterialExtension({
      category,
      materials: [material]
    });

    expect(extension.category).toEqual(category);
    expect(extension.materials).toEqual([material]);
  });

  it('extension helper 支持只扩分类与只扩物料', () => {
    const categoryOnly = definePortalMaterialExtension({
      category: definePortalMaterialCategory({
        id: 'oa',
        title: 'OA专区',
        name: 'OA专区',
        cmptTypeName: 'OA专区'
      })
    });
    const materialOnly = definePortalMaterialExtension({
      materials: [
        definePortalMaterial({
          id: 'oa-shortcut',
          type: 'oa-shortcut',
          name: 'OA快捷入口',
          icon: 'ri:apps-2-line',
          config: {
            index: { name: 'oa-shortcut-index' }
          },
          components: {
            index: TEST_INDEX_COMPONENT
          }
        })
      ]
    });

    expect(categoryOnly.category?.id).toBe('oa');
    expect(categoryOnly.materials).toEqual([]);
    expect(materialOnly.category).toBeUndefined();
    expect(materialOnly.materials).toHaveLength(1);
  });
});
