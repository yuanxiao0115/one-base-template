import { computed, ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import type { BizResponse } from '../schema/types';

import { createTemplateWorkbenchController } from './template-workbench-controller';

function ok<T>(data: T): BizResponse<T> {
  return {
    code: 0,
    data
  };
}

describe('template workbench controller', () => {
  function createController() {
    const templateId = ref('tpl-1');
    const routeTabId = ref('tab-route');
    const lockedTabId = ref('');
    const syncRouteTabId = vi.fn();
    const openEditor = vi.fn();
    const notify = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    };
    const confirm = vi.fn().mockResolvedValue(undefined);
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

    const controller = createTemplateWorkbenchController({
      templateId,
      routeTabId,
      lockedTabId: computed(() => lockedTabId.value),
      api,
      notify,
      confirm: ({ message, title }) => confirm({ message, title }),
      syncRouteTabId,
      openEditor
    });

    return {
      controller,
      templateId,
      routeTabId,
      lockedTabId,
      syncRouteTabId,
      openEditor,
      notify,
      confirm,
      api
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('加载模板后应优先选择路由中的页面 tab', async () => {
    const { controller, api, syncRouteTabId } = createController();

    api.template.detail.mockResolvedValue(
      ok({
        id: 'tpl-1',
        templateName: '门户 A',
        tabList: [
          {
            id: 'group-1',
            tabType: 1,
            children: [
              {
                id: 'tab-route',
                tabType: 2
              }
            ]
          }
        ]
      })
    );

    await controller.loadTemplate();

    expect(api.template.detail).toHaveBeenCalledWith({ id: 'tpl-1' });
    expect(controller.currentTabId.value).toBe('tab-route');
    expect(syncRouteTabId).toHaveBeenCalledWith('tab-route');
  });

  it('锁定页面设置时切换 tab 应回退到锁定页', () => {
    const { controller, lockedTabId, notify, syncRouteTabId } = createController();

    controller.currentTabId.value = 'tab-1';
    lockedTabId.value = 'tab-1';

    controller.setCurrentTab('tab-2');

    expect(controller.currentTabId.value).toBe('tab-1');
    expect(notify.warning).toHaveBeenCalledWith('页面设置已打开，请先保存或关闭后再切换页面');
    expect(syncRouteTabId).toHaveBeenCalledWith('tab-1');
  });

  it('新建空白页时应落库并直接进入编辑页', async () => {
    const { controller, api, openEditor } = createController();

    api.tab.add.mockResolvedValue(ok('tab-new'));
    api.template.detail
      .mockResolvedValueOnce(
        ok({
          id: 'tpl-1',
          tabIds: ['tab-old'],
          tabList: [
            {
              id: 'tab-old',
              tabType: 2
            }
          ]
        })
      )
      .mockResolvedValueOnce(
        ok({
          id: 'tpl-1',
          tabIds: ['tab-old', 'tab-new'],
          tabList: [
            {
              id: 'tab-new',
              tabType: 2
            }
          ]
        })
      );
    api.template.update.mockResolvedValue(ok(true));

    await controller.onSubmitAttr({
      tabName: '新页面',
      tabType: 2,
      sort: 1
    });

    const addPayload = api.tab.add.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(api.tab.add).toHaveBeenCalledTimes(1);
    expect(addPayload).toMatchObject({
      templateId: 'tpl-1',
      tabName: '新页面',
      tabType: 2
    });
    expect(String(addPayload.pageLayout ?? '')).toContain('"settings"');
    expect(api.template.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'tpl-1',
        tabIds: ['tab-old', 'tab-new']
      })
    );
    expect(openEditor).toHaveBeenCalledWith({
      templateId: 'tpl-1',
      tabId: 'tab-new'
    });
  });

  it('删除当前页后应刷新模板并切换到剩余首个可编辑页', async () => {
    const { controller, api, notify } = createController();

    controller.currentTabId.value = 'tab-1';
    controller.templateInfo.value = {
      id: 'tpl-1',
      tabList: [
        {
          id: 'tab-1',
          tabType: 2
        },
        {
          id: 'tab-2',
          tabType: 2
        }
      ]
    };
    api.tab.delete.mockResolvedValue(ok(true));
    api.template.detail.mockResolvedValue(
      ok({
        id: 'tpl-1',
        tabList: [
          {
            id: 'tab-2',
            tabType: 2
          }
        ]
      })
    );

    await controller.deleteTab({
      id: 'tab-1',
      tabType: 2
    });

    expect(notify.success).toHaveBeenCalledWith('删除成功');
    expect(controller.currentTabId.value).toBe('tab-2');
  });

  it('拖拽排序后应按补丁更新页面顺序', async () => {
    const { controller, api, notify } = createController();

    controller.currentTabId.value = 'tab-1';
    controller.templateInfo.value = {
      id: 'tpl-1',
      tabList: [
        {
          id: 'tab-1',
          tabType: 2,
          sort: 1,
          parentId: 0
        },
        {
          id: 'tab-2',
          tabType: 2,
          sort: 2,
          parentId: 0
        }
      ]
    };
    api.tab.update.mockResolvedValue(ok(true));
    api.template.detail.mockResolvedValue(
      ok({
        id: 'tpl-1',
        tabList: [
          {
            id: 'tab-2',
            tabType: 2,
            sort: 1,
            parentId: 0
          },
          {
            id: 'tab-1',
            tabType: 2,
            sort: 2,
            parentId: 0
          }
        ]
      })
    );

    await controller.onTreeSortDrop({
      draggingId: 'tab-1',
      dropId: 'tab-2',
      dropType: 'after'
    });

    expect(api.tab.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        id: 'tab-2',
        sort: 1
      })
    );
    expect(api.tab.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        id: 'tab-1',
        sort: 2
      })
    );
    expect(api.tab.detail).not.toHaveBeenCalled();
    expect(notify.success).toHaveBeenCalledWith('页面排序已更新');
  });
});
