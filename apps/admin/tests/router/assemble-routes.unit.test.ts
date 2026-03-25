import { describe, expect, it, vi } from 'vite-plus/test';
import type { RouteRecordRaw } from 'vue-router';
import { getRouteSignature } from '@one-base-template/core';

vi.mock('@one-base-template/ui/shell', () => ({
  AdminLayout: {},
  ForbiddenPage: {},
  NotFoundPage: {}
}));

import { routePaths } from '@/router/constants';
import { buildAppRoutes, type AppRouteAssemblyOptions } from '@/router/assemble-routes';

function createRouteAssemblyOptions(
  enabledModules: string[],
  overrides: Partial<AppRouteAssemblyOptions> = {}
): AppRouteAssemblyOptions {
  return {
    enabledModules,
    defaultSystemCode: 'admin_server',
    systemHomeMap: {
      admin_server: '/home/index'
    },
    storageNamespace: 'admin-test',
    ...overrides
  };
}

describe('router/assemble-routes', () => {
  function flattenRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
    return routes.flatMap((route) => {
      const children = Array.isArray(route.children) ? route.children : [];
      return [route, ...flattenRoutes(children)];
    });
  }

  function isSamePath(actualPath: unknown, expectedPath: string): boolean {
    if (typeof actualPath !== 'string') {
      return false;
    }
    return actualPath === expectedPath || actualPath === expectedPath.slice(1);
  }

  it('应保留公共固定路由', async () => {
    const { routes } = await buildAppRoutes(createRouteAssemblyOptions(['home']));
    const routePathList = flattenRoutes(routes).map((item) => item.path);

    expect(routePathList.some((path) => isSamePath(path, routePaths.login))).toBe(true);
    expect(routePathList.some((path) => isSamePath(path, routePaths.sso))).toBe(true);
    expect(routePathList.some((path) => isSamePath(path, routePaths.forbidden))).toBe(true);
    expect(routePathList.some((path) => isSamePath(path, routePaths.notFound))).toBe(true);
    expect(routePathList.some((path) => isSamePath(path, routePaths.catchall))).toBe(true);
  });

  it('PortalManagement 模块应使用语义化设计路径并移除历史 alias 路由', async () => {
    const { routes } = await buildAppRoutes(createRouteAssemblyOptions(['PortalManagement']));
    const allRoutes = flattenRoutes(routes);

    const listRoute = allRoutes.find(
      (item) => isSamePath(item.path, '/portal/setting') && item.name === 'PortalTemplateList'
    );
    const designerRoute = allRoutes.find(
      (item) => isSamePath(item.path, '/portal/design') && item.name === 'PortalDesigner'
    );
    const pageEditRoute = allRoutes.find(
      (item) => isSamePath(item.path, '/portal/page/edit') && item.name === 'PortalPageEditor'
    );
    const previewRoute = allRoutes.find(
      (item) => isSamePath(item.path, '/portal/preview') && item.name === 'PortalPreview'
    );

    const removedAliasPaths = ['/portal/templates', '/portal/layout', '/resource/portal/setting'];

    expect(listRoute).toBeDefined();
    expect(listRoute?.redirect).toBeUndefined();
    expect(designerRoute).toBeDefined();
    expect(pageEditRoute).toBeDefined();
    expect(previewRoute).toBeDefined();
    expect((designerRoute?.meta as Record<string, unknown> | undefined)?.activePath).toBe(
      '/portal/setting'
    );
    expect((pageEditRoute?.meta as Record<string, unknown> | undefined)?.activePath).toBe(
      '/portal/setting'
    );
    expect(
      removedAliasPaths.some((path) => allRoutes.some((item) => isSamePath(item.path, path)))
    ).toBe(false);
  });

  it('应从已装配路由自动收集 skipMenuAuth 白名单', async () => {
    const { routes, skipMenuAuthRouteNames, diagnostics } = await buildAppRoutes(
      createRouteAssemblyOptions(['home', 'PortalManagement'])
    );

    expect(skipMenuAuthRouteNames).toEqual(
      expect.arrayContaining([
        'HomeIndex',
        'PortalTemplateList',
        'PortalDesigner',
        'PortalPageEditor'
      ])
    );
    expect(skipMenuAuthRouteNames).not.toContain('PortalPreview');
    expect(diagnostics.routeCount).toBe(flattenRoutes(routes).length);
    expect(diagnostics.skipMenuAuthCount).toBe(skipMenuAuthRouteNames.length);
    expect(diagnostics.signature).toBe(getRouteSignature(routes));
  });
});
