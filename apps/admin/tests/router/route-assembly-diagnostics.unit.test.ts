import { describe, expect, it } from 'vite-plus/test';
import type { RouteRecordRaw } from 'vue-router';
import { countRoutes, createRouteAssemblyDiagnostics } from '@/router/route-assembly-diagnostics';
import { getRouteSignature } from '@/router/route-signature';

const MOCK_ROUTES: RouteRecordRaw[] = [
  {
    path: '/a',
    name: 'RouteA'
  },
  {
    path: '/b',
    name: 'RouteB',
    children: [
      {
        path: 'child',
        name: 'RouteBChild'
      }
    ]
  }
];

describe('router/route-assembly-diagnostics', () => {
  it('应统计嵌套路由总数', () => {
    expect(countRoutes(MOCK_ROUTES)).toBe(3);
  });

  it('应输出确定性 diagnostics', () => {
    const diagnostics = createRouteAssemblyDiagnostics({
      routes: MOCK_ROUTES,
      skipMenuAuthRouteNames: ['RouteA']
    });

    expect(diagnostics).toEqual({
      routeCount: 3,
      skipMenuAuthCount: 1,
      signature: getRouteSignature(MOCK_ROUTES)
    });
  });
});
