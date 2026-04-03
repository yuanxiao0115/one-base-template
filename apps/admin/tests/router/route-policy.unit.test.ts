import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vite-plus/test';
import { buildRouteFullPath, getRouteAccess } from '@one-base-template/core';
import type { RouteRecordRaw, RouteMeta } from 'vue-router';
import { getApp } from '@/config/app';
import { buildAppRoutes } from '@/router/assemble-routes';
import { routePaths } from '@/router/constants';
import { buildRoutePolicyReport } from '@/router/route-policy';

vi.mock('@one-base-template/ui/shell', () => ({
  AdminLayout: {},
  ForbiddenPage: {},
  NotFoundPage: {}
}));

function resolvePolicyArtifactPath() {
  const repoRoot = path.resolve(process.cwd(), '../..');
  const artifactDir = path.join(repoRoot, '.codex', 'route-policy');
  mkdirSync(artifactDir, { recursive: true });
  return path.join(artifactDir, 'admin-route-policy.json');
}

interface RouteMetaSnapshot {
  name: string | symbol | null;
  path: string;
  meta: RouteMeta | undefined;
}

function flattenRoutesWithMeta(routes: RouteRecordRaw[], parentPath = '/'): RouteMetaSnapshot[] {
  const output: RouteMetaSnapshot[] = [];

  for (const route of routes) {
    const fullPath = buildRouteFullPath(parentPath, route.path, '/');
    output.push({
      name: route.name ?? null,
      path: fullPath,
      meta: route.meta as RouteMeta | undefined
    });

    if (Array.isArray(route.children) && route.children.length > 0) {
      output.push(...flattenRoutesWithMeta(route.children, fullPath));
    }
  }

  return output;
}

describe('router/route-policy', () => {
  it('应生成路由策略清单并落盘产物', async () => {
    const config = getApp();
    const result = await buildAppRoutes({
      enabledModules: config.enabledModules,
      defaultSystemCode: config.defaultSystemCode,
      systemHomeMap: config.systemHomeMap,
      storageNamespace: config.storageNamespace
    });
    const report = buildRoutePolicyReport(result.routes);

    const artifactPath = resolvePolicyArtifactPath();
    writeFileSync(artifactPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

    expect(report.routes.length).toBeGreaterThan(0);
    expect(report.openRoutes.length).toBeGreaterThan(0);
  });

  it('open 路由清单应保持在受控范围内', async () => {
    const config = getApp();
    const result = await buildAppRoutes({
      enabledModules: config.enabledModules,
      defaultSystemCode: config.defaultSystemCode,
      systemHomeMap: config.systemHomeMap,
      storageNamespace: config.storageNamespace
    });
    const report = buildRoutePolicyReport(result.routes);

    const expectedOpenPaths = [routePaths.login, routePaths.sso, '/portal/preview'].sort();
    const actualOpenPaths = [...new Set(report.openRoutes.map((item) => item.path))].sort();

    expect(actualOpenPaths).toEqual(expectedOpenPaths);
  });

  it('access 与 activePath 规则应保持一致', async () => {
    const config = getApp();
    const result = await buildAppRoutes({
      enabledModules: config.enabledModules,
      defaultSystemCode: config.defaultSystemCode,
      systemHomeMap: config.systemHomeMap,
      storageNamespace: config.storageNamespace
    });
    const report = buildRoutePolicyReport(result.routes);

    const routePathSet = new Set(report.routes.map((item) => item.path));
    for (const item of report.activePathRoutes) {
      expect(item.activePath).toBeDefined();
      expect(routePathSet.has(item.activePath as string)).toBe(true);
    }

    expect(report.authRoutes.some((item) => item.path === routePaths.forbidden)).toBe(true);
    expect(report.authRoutes.some((item) => item.path === routePaths.notFound)).toBe(true);
    expect(report.authRoutes.some((item) => item.path === '/home/index')).toBe(true);
    expect(report.menuRoutes.some((item) => item.path === '/portal/design')).toBe(true);

    const routeMetaSnapshots = flattenRoutesWithMeta(result.routes);

    const keepAliveRoutes = routeMetaSnapshots.filter((item) => item.meta?.keepAlive === true);
    for (const item of keepAliveRoutes) {
      expect(typeof item.name === 'string' && item.name.length > 0).toBe(true);
    }

    const openRoutes = routeMetaSnapshots.filter(
      (item) => getRouteAccess(item.meta, 'menu') === 'open'
    );
    for (const item of openRoutes) {
      expect(item.meta?.hiddenTab).toBe(true);
      expect(item.meta?.activePath).toBeUndefined();
    }
  });
});
