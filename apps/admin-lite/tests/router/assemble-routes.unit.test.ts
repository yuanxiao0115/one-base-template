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
    storageNamespace: 'admin-lite-test',
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

  it('基础模块应正确装配 adminManagement 与 system-management 路由', async () => {
    const { routes } = await buildAppRoutes(
      createRouteAssemblyOptions(['admin-management', 'system-management'])
    );
    const allRoutes = flattenRoutes(routes);

    const menuRoute = allRoutes.find(
      (item) => isSamePath(item.path, '/system/permission') && item.name === 'SystemMenuManagement'
    );
    const userRoute = allRoutes.find(
      (item) => isSamePath(item.path, '/system/user') && item.name === 'SystemUserManagement'
    );
    const dictRoute = allRoutes.find(
      (item) => isSamePath(item.path, '/system/dict') && item.name === 'SystemDictManagement'
    );

    expect(menuRoute).toBeDefined();
    expect(userRoute).toBeDefined();
    expect(dictRoute).toBeDefined();
    expect(menuRoute?.redirect).toBeUndefined();
    expect(userRoute?.redirect).toBeUndefined();
  });

  it('应保留 access 语义并输出 diagnostics', async () => {
    const { routes, diagnostics } = await buildAppRoutes(
      createRouteAssemblyOptions(['home', 'system-management'])
    );
    const allRoutes = flattenRoutes(routes);
    const homeRoute = allRoutes.find(
      (item) => isSamePath(item.path, '/home/index') && item.name === 'HomeIndex'
    );
    const dictRoute = allRoutes.find(
      (item) => isSamePath(item.path, '/system/dict') && item.name === 'SystemDictManagement'
    );

    expect((homeRoute?.meta as Record<string, unknown> | undefined)?.access).toBe('auth');
    expect((dictRoute?.meta as Record<string, unknown> | undefined)?.access).toBeUndefined();
    expect(diagnostics.routeCount).toBe(flattenRoutes(routes).length);
    expect(diagnostics.signature).toBe(getRouteSignature(routes));
  });
});
