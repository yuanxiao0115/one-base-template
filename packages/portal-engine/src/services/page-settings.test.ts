import { describe, expect, it, vi, beforeEach } from 'vitest';

import {
  createPortalPageSettingsService,
  resetPortalPageSettingsApi,
  setPortalPageSettingsApi,
} from './page-settings';

describe('portal page settings service', () => {
  beforeEach(() => {
    resetPortalPageSettingsApi();
  });

  it('未注入 API 时，加载应失败', async () => {
    const service = createPortalPageSettingsService();

    await expect(service.loadTabPageSettings('tab-1')).rejects.toThrow('未配置');
  });

  it('应加载并标准化页面设置', async () => {
    setPortalPageSettingsApi({
      getTabDetail: vi.fn().mockResolvedValue({
        success: true,
        code: 200,
        data: {
          id: 'tab-1',
          tabName: '门户首页',
          templateId: 'tpl-1',
          pageLayout: JSON.stringify({
            settings: {
              basic: {
                pageTitle: '',
              },
            },
            component: [{ i: 'm-1', x: 0, y: 0, w: 12, h: 6 }],
          }),
        },
      }),
    });

    const service = createPortalPageSettingsService();
    const detail = await service.loadTabPageSettings('tab-1');

    expect(detail.tab.id).toBe('tab-1');
    expect(detail.settings.basic.pageTitle).toBe('门户首页');
    expect(detail.components).toHaveLength(1);
  });

  it('应合并设置并保存回 tab.update', async () => {
    const updateTab = vi.fn().mockResolvedValue({
      success: true,
      code: 200,
      message: '',
    });

    setPortalPageSettingsApi({
      getTabDetail: vi.fn().mockResolvedValue({
        success: true,
        code: 200,
        data: {
          id: 'tab-2',
          tabName: '原页面',
          templateId: 'tpl-real',
          pageLayout: JSON.stringify({
            settings: {
              basic: {
                pageTitle: '原页面',
              },
              layout: {
                mode: 'scroll',
              },
            },
            component: [{ i: 'm-2', x: 0, y: 0, w: 24, h: 8 }],
          }),
        },
      }),
      updateTab,
    });

    const service = createPortalPageSettingsService();

    await service.saveTabPageSettings({
      tabId: 'tab-2',
      templateId: 'tpl-input',
      settings: {
        basic: {
          pageTitle: '新页面标题',
        },
      },
    });

    expect(updateTab).toHaveBeenCalledTimes(1);
    const firstCall = updateTab.mock.calls.at(0);
    expect(firstCall).toBeDefined();
    const payload = firstCall![0] as Record<string, unknown>;
    expect(payload.id).toBe('tab-2');
    expect(payload.templateId).toBe('tpl-real');
    expect(payload.tabName).toBe('原页面');

    const pageLayout = JSON.parse(String(payload.pageLayout)) as {
      settings?: { basic?: { pageTitle?: string } };
      component?: unknown[];
    };
    expect(pageLayout.settings?.basic?.pageTitle).toBe('新页面标题');
    expect(pageLayout.component).toHaveLength(1);
  });
});
