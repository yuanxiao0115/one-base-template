import { nextTick, ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import type { BizResponse } from '../schema/types';
import { createPortalEngineContext } from '../runtime/context';
import { setPortalPageSettingsApi as setPageSettingsApi } from '../services/page-settings';

import { createTemplateWorkbenchPageController } from './template-workbench-page-controller';

function ok<T>(data: T): BizResponse<T> {
  return {
    code: 0,
    data
  };
}

describe('template workbench page controller', () => {
  function createController() {
    const context = createPortalEngineContext({ appId: 'test-template-workbench-page' });
    const templateId = ref('tpl-1');
    const routeTabId = ref('tab-1');
    const previewMessages: unknown[] = [];
    const previewTarget = ref({
      postMessageToFrame: (message: unknown) => {
        previewMessages.push(message);
        return true;
      },
      setInteractionMode: vi.fn(),
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      resetView: vi.fn()
    });
    const notify = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    };
    const confirm = vi.fn().mockResolvedValue(undefined);
    const syncRouteTabId = vi.fn();
    const openEditor = vi.fn();
    const api = {
      template: {
        detail: vi.fn(),
        update: vi.fn(),
        hideToggle: vi.fn()
      },
      tab: {
        detail: vi.fn(),
        add: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      }
    };
    const pageSettingsApi = {
      getTabDetail: vi.fn(),
      updateTab: vi.fn()
    };

    setPageSettingsApi(pageSettingsApi, context);

    const controller = createTemplateWorkbenchPageController({
      context,
      templateId,
      routeTabId,
      previewTarget,
      api,
      notify,
      confirm: ({ message, title }) => confirm({ message, title }),
      syncRouteTabId,
      openEditor,
      resolvePreviewHref: ({ templateId: nextTemplateId, tabId, previewMode }) =>
        `/portal/preview?templateId=${nextTemplateId}&tabId=${tabId}&previewMode=${String(previewMode)}`
    });

    return {
      controller,
      context,
      templateId,
      routeTabId,
      previewTarget,
      previewMessages,
      notify,
      confirm,
      syncRouteTabId,
      openEditor,
      api,
      pageSettingsApi
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('打开页面设置后应加载详情并向预览舞台发送运行时消息', async () => {
    const { controller, pageSettingsApi, previewMessages } = createController();

    controller.currentTabId.value = 'tab-1';
    await nextTick();
    pageSettingsApi.getTabDetail.mockResolvedValue(
      ok({
        id: 'tab-1',
        tabName: '页面A',
        templateId: 'tpl-1',
        pageLayout: JSON.stringify({
          settings: {
            basic: {
              pageTitle: '页面A'
            }
          },
          component: [{ id: 'comp-1' }]
        })
      })
    );

    await controller.openPageSettingsDrawer('tab-1');

    expect(controller.pageSettingsVisible.value).toBe(true);
    expect(controller.pageSettingsCurrentTabId.value).toBe('tab-1');
    expect(controller.pageSettingsForm.value?.basic.pageTitle).toBe('页面A');
    expect(previewMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'preview-page-runtime'
        })
      ])
    );
  });

  it('保存页眉页脚后应关闭抽屉并刷新模板', async () => {
    const { controller, api, notify } = createController();

    controller.currentTabId.value = 'tab-1';
    await nextTick();
    controller.templateInfo.value = {
      id: 'tpl-1',
      templateName: '门户A',
      details: '{"header":{}}',
      tabList: [
        {
          id: 'tab-1',
          tabType: 2,
          tabName: '页面A'
        }
      ]
    };
    controller.shellSettingVisible.value = true;

    api.template.update.mockResolvedValue(ok(true));
    api.template.detail.mockResolvedValue(
      ok({
        id: 'tpl-1',
        templateName: '门户A',
        details: '{"header":{"title":"新标题"}}',
        tabList: [
          {
            id: 'tab-1',
            tabType: 2,
            tabName: '页面A'
          }
        ]
      })
    );

    await controller.onSubmitShellSetting({
      details: '{"header":{"title":"新标题"}}'
    });

    expect(api.template.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'tpl-1',
        details: '{"header":{"title":"新标题"}}'
      })
    );
    expect(controller.shellSettingVisible.value).toBe(false);
    expect(notify.success).toHaveBeenCalledWith('页眉页脚配置保存成功');
    expect(api.template.detail).toHaveBeenCalledWith({ id: 'tpl-1' });
  });
});
