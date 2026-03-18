import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import {
  definePortalMaterialCategory,
  definePortalMaterialExtension,
  type PortalMaterialExtension,
  usePortalMaterialCatalog
} from '@one-base-template/portal-engine';
import * as portalEngine from '@one-base-template/portal-engine';

import { PORTAL_ADMIN_MATERIAL_EXTENSIONS } from '../materials/extensions';
import { resetPortalEngineAdminSetupForTesting, setupPortalEngineForAdmin } from './register';

function createTestCategory(categoryId: string) {
  return definePortalMaterialCategory({
    id: categoryId,
    title: `${categoryId}-title`,
    name: `${categoryId}-name`,
    cmptTypeName: `${categoryId}-type`
  });
}

describe('PortalManagement/engine/register', () => {
  beforeEach(() => {
    resetPortalEngineAdminSetupForTesting();
  });

  afterEach(() => {
    resetPortalEngineAdminSetupForTesting();
  });

  it('应合并默认扩展与调用方扩展，并允许仅扩分类', () => {
    const adminMaterialExtensions = PORTAL_ADMIN_MATERIAL_EXTENSIONS as PortalMaterialExtension[];
    const previousExtensions = [...adminMaterialExtensions];

    try {
      adminMaterialExtensions.push(
        definePortalMaterialExtension({
          category: createTestCategory('admin-default-category')
        })
      );

      const context = setupPortalEngineForAdmin({
        materialExtensions: [
          definePortalMaterialExtension({
            category: createTestCategory('admin-runtime-category')
          })
        ]
      });

      const { categories } = usePortalMaterialCatalog({
        context,
        scene: 'editor'
      });
      const defaultCategory = categories.find(
        (category) => category.id === 'admin-default-category'
      );
      const runtimeCategory = categories.find(
        (category) => category.id === 'admin-runtime-category'
      );

      expect(defaultCategory?.title).toBe('admin-default-category-title');
      expect(defaultCategory?.cmptList).toEqual([]);
      expect(runtimeCategory?.title).toBe('admin-runtime-category-title');
      expect(runtimeCategory?.cmptList).toEqual([]);
    } finally {
      adminMaterialExtensions.splice(0, adminMaterialExtensions.length, ...previousExtensions);
    }
  });

  it('registerDemoMaterial 默认为 false，不应注册 admin quick demo 物料', () => {
    const context = setupPortalEngineForAdmin();
    const { materialsMap } = usePortalMaterialCatalog({
      context,
      scene: 'editor'
    });

    expect(materialsMap['admin-quick-demo-index']).toBeUndefined();
  });

  it('reset 后应重建 context，并清空前一次测试注册的分类状态', () => {
    const firstContext = setupPortalEngineForAdmin({
      materialExtensions: [
        definePortalMaterialExtension({
          category: createTestCategory('reset-check-category')
        })
      ]
    });

    const firstCatalog = usePortalMaterialCatalog({
      context: firstContext,
      scene: 'editor'
    });

    expect(firstCatalog.categories.some((category) => category.id === 'reset-check-category')).toBe(
      true
    );

    resetPortalEngineAdminSetupForTesting();

    const nextContext = setupPortalEngineForAdmin();
    const nextCatalog = usePortalMaterialCatalog({
      context: nextContext,
      scene: 'editor'
    });

    expect(nextContext).not.toBe(firstContext);
    expect(nextCatalog.categories.some((category) => category.id === 'reset-check-category')).toBe(
      false
    );
  });

  it('重复 setup 不应重复注册同签名扩展', () => {
    const registerSpy = vi.spyOn(portalEngine, 'registerMaterialExtensions');
    const runtimeExtension = definePortalMaterialExtension({
      category: createTestCategory('idempotent-category')
    });

    try {
      setupPortalEngineForAdmin({
        materialExtensions: [runtimeExtension]
      });
      setupPortalEngineForAdmin({
        materialExtensions: [runtimeExtension]
      });

      expect(registerSpy).toHaveBeenCalledTimes(1);
    } finally {
      registerSpy.mockRestore();
    }
  });
});
