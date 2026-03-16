import { computed, ref } from 'vue';
import { describe, expect, it, vi } from 'vite-plus/test';

import type { CreateTemplateWorkbenchPageControllerOptions } from './template-workbench-page-controller';
import type { PortalRouteQueryLike } from './template-workbench-route';
import { useTemplateWorkbenchPageByRoute } from './useTemplateWorkbenchPageByRoute';

describe('useTemplateWorkbenchPageByRoute', () => {
  function createFactoryFixture() {
    let capturedOptions: CreateTemplateWorkbenchPageControllerOptions | null = null;
    const controllerFactory = vi
      .fn()
      .mockImplementation((options: CreateTemplateWorkbenchPageControllerOptions) => {
        capturedOptions = options;
        return {
          marker: 'mock-controller'
        };
      });

    return {
      controllerFactory,
      getCapturedOptions: () => capturedOptions
    };
  }

  function createOptions() {
    const routeQuery = ref<PortalRouteQueryLike>({
      id: 'tpl-1',
      tabId: 'tab-1',
      keep: 'yes'
    });
    const previewTarget = ref({
      postMessageToFrame: vi.fn().mockReturnValue(true),
      setInteractionMode: vi.fn(),
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      resetView: vi.fn()
    });
    const replaceRouteQuery = vi.fn();
    const pushRoute = vi.fn();
    const resolveRouteHref = vi
      .fn()
      .mockImplementation((payload: { name: string; query: unknown }) => {
        return `/resolved/${payload.name}`;
      });
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
    const notify = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    };
    const confirm = vi.fn().mockResolvedValue(undefined);
    const fixture = createFactoryFixture();

    const binding = useTemplateWorkbenchPageByRoute({
      routeQuery: computed(() => routeQuery.value),
      previewTarget,
      api,
      notify,
      confirm: ({ message, title }) => confirm({ message, title }),
      replaceRouteQuery,
      pushRoute,
      resolveRouteHref,
      controllerFactory: fixture.controllerFactory
    });

    return {
      routeQuery,
      replaceRouteQuery,
      pushRoute,
      resolveRouteHref,
      fixture,
      binding
    };
  }

  it('应解析 templateId/routeTabId 并在 tabId 变化时同步路由', async () => {
    const { binding, replaceRouteQuery, routeQuery } = createOptions();

    expect(binding.templateId.value).toBe('tpl-1');
    expect(binding.routeTabId.value).toBe('tab-1');

    binding.syncRouteTabId('tab-1');
    expect(replaceRouteQuery).not.toHaveBeenCalled();

    binding.syncRouteTabId('tab-2');
    expect(replaceRouteQuery).toHaveBeenCalledWith({
      id: 'tpl-1',
      tabId: 'tab-2',
      keep: 'yes'
    });

    routeQuery.value = {
      templateId: 'tpl-2',
      tabId: 'tab-9'
    };
    expect(binding.templateId.value).toBe('tpl-2');
    expect(binding.routeTabId.value).toBe('tab-9');
  });

  it('应构造 openEditor/resolvePreviewHref 并透传给 controller', () => {
    const { fixture, pushRoute, resolveRouteHref, binding } = createOptions();
    const capturedOptions = fixture.getCapturedOptions();
    expect(capturedOptions).not.toBeNull();

    capturedOptions!.openEditor({
      templateId: 'tpl-3',
      tabId: 'tab-3'
    });
    expect(pushRoute).toHaveBeenCalledWith({
      path: '/portal/page/edit',
      query: {
        id: 'tpl-3',
        tabId: 'tab-3'
      }
    });

    const href = capturedOptions!.resolvePreviewHref({
      templateId: 'tpl-3',
      tabId: 'tab-3',
      previewMode: 'live'
    });
    expect(resolveRouteHref).toHaveBeenCalledWith({
      name: 'PortalPreview',
      query: {
        templateId: 'tpl-3',
        tabId: 'tab-3',
        previewMode: 'live'
      }
    });
    expect(href).toBe('/resolved/PortalPreview');
    expect(binding.controller).toEqual({ marker: 'mock-controller' });
  });

  it('replaceRouteQuery 失败时应回调错误处理', async () => {
    const { routeQuery, previewTarget, api, notify, fixture } = (() => {
      const routeQuery = ref<PortalRouteQueryLike>({
        id: 'tpl-1',
        tabId: 'tab-1'
      });
      const previewTarget = ref({
        postMessageToFrame: vi.fn().mockReturnValue(true),
        setInteractionMode: vi.fn(),
        zoomIn: vi.fn(),
        zoomOut: vi.fn(),
        resetView: vi.fn()
      });
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
      const notify = {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn()
      };
      return {
        routeQuery,
        previewTarget,
        api,
        notify,
        fixture: createFactoryFixture()
      };
    })();

    const error = new Error('replace failed');
    const onReplaceRouteQueryError = vi.fn();
    const replaceRouteQuery = vi.fn().mockRejectedValue(error);

    const binding = useTemplateWorkbenchPageByRoute({
      routeQuery: computed(() => routeQuery.value),
      previewTarget,
      api,
      notify,
      confirm: vi.fn().mockResolvedValue(undefined),
      replaceRouteQuery,
      onReplaceRouteQueryError,
      pushRoute: vi.fn(),
      resolveRouteHref: vi.fn().mockReturnValue('/resolved/PortalPreview'),
      controllerFactory: fixture.controllerFactory
    });

    binding.syncRouteTabId('tab-2');
    await Promise.resolve();
    await Promise.resolve();
    expect(onReplaceRouteQueryError).toHaveBeenCalledWith(error);
  });
});
