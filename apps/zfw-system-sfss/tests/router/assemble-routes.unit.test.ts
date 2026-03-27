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
    storageNamespace: 'zfw-system-sfss-test',
    ...overrides
  };
}

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

describe('router/assemble-routes', () => {
  it('应保留公共固定路由', async () => {
    const { routes } = await buildAppRoutes(createRouteAssemblyOptions(['home']));
    const routePathList = flattenRoutes(routes).map((item) => item.path);

    expect(routePathList.some((path) => isSamePath(path, routePaths.login))).toBe(true);
    expect(routePathList.some((path) => isSamePath(path, routePaths.sso))).toBe(true);
    expect(routePathList.some((path) => isSamePath(path, routePaths.forbidden))).toBe(true);
    expect(routePathList.some((path) => isSamePath(path, routePaths.notFound))).toBe(true);
    expect(routePathList.some((path) => isSamePath(path, routePaths.catchall))).toBe(true);
  });

  it('应按 enabledModules 过滤业务模块路由', async () => {
    const homeOnly = await buildAppRoutes(createRouteAssemblyOptions(['home']));
    const withDemo = await buildAppRoutes(createRouteAssemblyOptions(['home', 'demo']));
    const homeOnlyRoutes = flattenRoutes(homeOnly.routes);
    const withDemoRoutes = flattenRoutes(withDemo.routes);

    expect(homeOnlyRoutes.some((item) => isSamePath(item.path, '/demo/about'))).toBe(false);
    expect(withDemoRoutes.some((item) => isSamePath(item.path, '/demo/about'))).toBe(true);
  });

  it('应保留 access 语义并输出 diagnostics', async () => {
    const { routes, diagnostics } = await buildAppRoutes(
      createRouteAssemblyOptions(['home', 'demo'])
    );
    const allRoutes = flattenRoutes(routes);
    const homeRoute = allRoutes.find(
      (item) => isSamePath(item.path, '/home/index') && item.name === 'ZfwSystemSfssHome'
    );
    const demoRoute = allRoutes.find(
      (item) => isSamePath(item.path, '/demo/about') && item.name === 'ZfwSystemSfssAbout'
    );
    const loginRoute = allRoutes.find((item) => isSamePath(item.path, routePaths.login));

    expect((homeRoute?.meta as Record<string, unknown> | undefined)?.access).toBe('auth');
    expect((demoRoute?.meta as Record<string, unknown> | undefined)?.access).toBe('auth');
    expect((loginRoute?.meta as Record<string, unknown> | undefined)?.access).toBe('open');
    expect(diagnostics.routeCount).toBe(flattenRoutes(routes).length);
    expect(diagnostics.signature).toBe(getRouteSignature(routes));
  });
});
