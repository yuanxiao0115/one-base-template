import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vite-plus/test';
import { getPlatformConfig } from '@/config/platform-config';
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

describe('router/route-policy', () => {
  it('应生成路由策略清单并落盘产物', async () => {
    const config = getPlatformConfig();
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
    expect(report.publicRoutes.length).toBeGreaterThan(0);
  });

  it('public 路由清单应保持在受控范围内', async () => {
    const config = getPlatformConfig();
    const result = await buildAppRoutes({
      enabledModules: config.enabledModules,
      defaultSystemCode: config.defaultSystemCode,
      systemHomeMap: config.systemHomeMap,
      storageNamespace: config.storageNamespace
    });
    const report = buildRoutePolicyReport(result.routes);

    const expectedPublicPaths = [
      routePaths.login,
      routePaths.sso,
      routePaths.forbidden,
      routePaths.notFound,
      routePaths.catchall,
      '/portal/preview'
    ].sort();
    const actualPublicPaths = [...new Set(report.publicRoutes.map((item) => item.path))].sort();

    expect(actualPublicPaths).toEqual(expectedPublicPaths);
    expect(report.publicRoutes.every((item) => item.skipMenuAuth === false)).toBe(true);
  });

  it('skipMenuAuth 与 activePath 规则应保持一致', async () => {
    const config = getPlatformConfig();
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

    const expectedSkipNames = [...new Set(result.skipMenuAuthRouteNames)].sort();
    const actualSkipNames = [
      ...new Set(
        report.skipMenuAuthRoutes.map((item) => item.name).filter((item): item is string => !!item)
      )
    ].sort();

    expect(actualSkipNames).toEqual(expectedSkipNames);
  });
});
