import { computed, ref } from 'vue';
import { describe, expect, it, vi } from 'vite-plus/test';

import type { CreatePageEditorControllerOptions } from './page-editor-controller';
import type { PortalRouteQueryLike } from './template-workbench-route';
import { usePageEditorWorkbenchByRoute } from './usePageEditorWorkbenchByRoute';

describe('usePageEditorWorkbenchByRoute', () => {
  function createFactoryFixture() {
    let capturedOptions: CreatePageEditorControllerOptions | null = null;
    const controllerFactory = vi
      .fn()
      .mockImplementation((options: CreatePageEditorControllerOptions) => {
        capturedOptions = options;
        return {
          marker: 'page-editor-controller',
          mount: vi.fn(),
          dispose: vi.fn()
        };
      });

    return {
      controllerFactory,
      getCapturedOptions: () => capturedOptions
    };
  }

  it('应按 route query 解析 tabId/templateId 并构造回跳路由', () => {
    const routeQuery = ref<PortalRouteQueryLike>({
      id: 'tpl-1',
      tabId: 'tab-1'
    });
    const fixture = createFactoryFixture();

    const binding = usePageEditorWorkbenchByRoute({
      routeQuery: computed(() => routeQuery.value),
      api: {
        tab: {
          detail: vi.fn(),
          update: vi.fn()
        }
      },
      notify: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn()
      },
      resolveRouteHref: vi.fn().mockReturnValue('/portal/preview?tabId=tab-1'),
      controllerFactory: fixture.controllerFactory
    });

    expect(binding.tabId.value).toBe('tab-1');
    expect(binding.templateId.value).toBe('tpl-1');
    expect(binding.backRouteLocation.value).toEqual({
      path: '/portal/design',
      query: {
        id: 'tpl-1',
        tabId: 'tab-1'
      }
    });

    routeQuery.value = {};
    expect(binding.backRouteLocation.value).toEqual({
      path: '/portal/setting'
    });
  });

  it('应把预览路由构造逻辑透传给控制器', () => {
    const routeQuery = ref<PortalRouteQueryLike>({
      id: 'tpl-2',
      tabId: 'tab-2'
    });
    const resolveRouteHref = vi
      .fn()
      .mockImplementation((payload: { name: string; query: PortalRouteQueryLike }) => {
        return `/resolved/${payload.name}`;
      });
    const fixture = createFactoryFixture();

    const binding = usePageEditorWorkbenchByRoute({
      routeQuery: computed(() => routeQuery.value),
      api: {
        tab: {
          detail: vi.fn(),
          update: vi.fn()
        }
      },
      notify: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn()
      },
      resolveRouteHref,
      previewRouteName: 'PortalPreview',
      controllerFactory: fixture.controllerFactory
    });

    const capturedOptions = fixture.getCapturedOptions();
    expect(capturedOptions).not.toBeNull();
    const href = capturedOptions!.resolvePreviewHref({
      tabId: 'tab-9',
      templateId: 'tpl-9',
      previewMode: 'live'
    });

    expect(resolveRouteHref).toHaveBeenCalledWith({
      name: 'PortalPreview',
      query: {
        templateId: 'tpl-9',
        tabId: 'tab-9',
        previewMode: 'live'
      }
    });
    expect(href).toBe('/resolved/PortalPreview');
    expect(binding.controller).toMatchObject({
      marker: 'page-editor-controller'
    });
  });
});
