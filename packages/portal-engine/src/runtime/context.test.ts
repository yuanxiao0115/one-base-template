import { describe, expect, it, vi } from 'vite-plus/test';

import { createPortalEngineContext } from './context';
import { getPortalCmsApi, setPortalCmsApi } from '../materials/api';
import {
  navigatePortalCmsList,
  resetPortalCmsNavigation,
  setPortalCmsNavigation
} from '../materials/navigation';
import { getPortalMaterialRegistryController } from '../registry/materials-registry';
import {
  createPortalPageSettingsService,
  resetPortalPageSettingsApi,
  setPortalPageSettingsApi
} from '../services/page-settings';

describe('portal engine context', () => {
  it('不同 context 的 cmsApi 应相互隔离', async () => {
    const contextA = createPortalEngineContext({ appId: 'admin-a' });
    const contextB = createPortalEngineContext({ appId: 'admin-b' });

    setPortalCmsApi(
      {
        getCategoryTree: vi.fn().mockResolvedValue({
          success: true,
          code: 200,
          data: ['cat-a']
        })
      },
      contextA
    );

    await expect(getPortalCmsApi(contextA).getCategoryTree()).resolves.toMatchObject({
      success: true,
      data: ['cat-a']
    });
    await expect(getPortalCmsApi(contextB).getCategoryTree()).resolves.toMatchObject({
      success: false,
      message: expect.stringContaining('未配置')
    });
  });

  it('不同 context 的页面设置服务应读取各自注入的 api', async () => {
    const contextA = createPortalEngineContext({ appId: 'page-a' });
    const contextB = createPortalEngineContext({ appId: 'page-b' });

    resetPortalPageSettingsApi(contextA);
    resetPortalPageSettingsApi(contextB);

    setPortalPageSettingsApi(
      {
        getTabDetail: vi.fn().mockResolvedValue({
          success: true,
          code: 200,
          data: {
            id: 'tab-a',
            tabName: '页面 A',
            templateId: 'tpl-a',
            pageLayout: JSON.stringify({
              settings: {},
              component: []
            })
          }
        })
      },
      contextA
    );

    const serviceA = createPortalPageSettingsService(undefined, contextA);
    const serviceB = createPortalPageSettingsService(undefined, contextB);

    await expect(serviceA.loadTabPageSettings('tab-a')).resolves.toMatchObject({
      tab: {
        id: 'tab-a'
      },
      settings: {
        basic: {
          pageTitle: '页面 A'
        }
      }
    });
    await expect(serviceB.loadTabPageSettings('tab-b')).rejects.toThrow('未配置');
  });

  it('不同 context 的导航 handler 应相互隔离', async () => {
    const contextA = createPortalEngineContext({ appId: 'nav-a' });
    const contextB = createPortalEngineContext({ appId: 'nav-b' });
    const openList = vi.fn().mockResolvedValue({ handled: true });

    resetPortalCmsNavigation(contextA);
    resetPortalCmsNavigation(contextB);
    setPortalCmsNavigation(
      {
        openList
      },
      contextA
    );

    await expect(
      navigatePortalCmsList(
        {
          router: { push: vi.fn() },
          categoryId: 'cat-a'
        },
        contextA
      )
    ).resolves.toEqual({ handled: true });

    await expect(
      navigatePortalCmsList(
        {
          router: { push: vi.fn() },
          categoryId: 'cat-b'
        },
        contextB
      )
    ).resolves.toEqual({
      handled: false,
      message: '当前应用未配置 CMS 列表跳转'
    });
  });

  it('不同 context 的物料 registry 应相互隔离', () => {
    const contextA = createPortalEngineContext({ appId: 'registry-a' });
    const contextB = createPortalEngineContext({ appId: 'registry-b' });

    const registryA = getPortalMaterialRegistryController(contextA);
    const registryB = getPortalMaterialRegistryController(contextB);

    registryA.registerPortalMaterial(
      {
        id: 'test-material-a',
        type: 'test-material-a',
        cmptName: '测试物料 A',
        cmptWidth: 12,
        cmptHeight: 12,
        cmptIcon: 'ri:test-tube-line',
        cmptConfig: {
          index: { name: 'test-material-a-index' },
          content: { name: 'test-material-a-content' },
          style: { name: 'test-material-a-style' }
        }
      },
      {
        category: {
          id: 'custom-test',
          title: '自定义测试'
        }
      }
    );

    expect(
      registryA.categories.some(
        (category) =>
          category.id === 'custom-test' &&
          category.cmptList.some((item) => item.id === 'test-material-a')
      )
    ).toBe(true);
    expect(
      registryB.categories.some(
        (category) =>
          category.id === 'custom-test' &&
          category.cmptList.some((item) => item.id === 'test-material-a')
      )
    ).toBe(false);
  });
});
