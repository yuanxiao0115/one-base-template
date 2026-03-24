import { describe, expect, it } from 'vite-plus/test';
import type { RouteRecordRaw } from 'vue-router';
import { createRouteAssemblyDiagnostics, getRouteCount } from './route-diagnostics';
import { getRouteSignature } from './route-signature';

const mockRoutes: RouteRecordRaw[] = [
  {
    path: '/a',
    name: 'RouteA'
  } as RouteRecordRaw,
  {
    path: '/b',
    name: 'RouteB',
    children: [
      {
        path: 'child',
        name: 'RouteBChild'
      } as RouteRecordRaw
    ]
  } as RouteRecordRaw
];

describe('router/route-diagnostics', () => {
  it('应统计嵌套路由总数', () => {
    expect(getRouteCount(mockRoutes)).toBe(3);
  });

  it('应输出确定性 diagnostics', () => {
    const diagnostics = createRouteAssemblyDiagnostics({
      routes: mockRoutes,
      skipMenuAuthRouteNames: ['RouteA']
    });

    expect(diagnostics).toEqual({
      routeCount: 3,
      skipMenuAuthCount: 1,
      signature: getRouteSignature(mockRoutes)
    });
  });
});
