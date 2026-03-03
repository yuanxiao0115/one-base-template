import { describe, expect, it } from 'vitest';
import type { RouteRecordRaw } from 'vue-router';

import { getSkipMenuAuthRouteName, isSkipMenuAuthRoute, toRouteNameKey } from '../skip-menu-auth';

describe('router/skip-menu-auth', () => {
  it('toRouteNameKey 支持 string / symbol', () => {
    expect(toRouteNameKey('DemoPageA')).toBe('DemoPageA');
    expect(toRouteNameKey(Symbol.for('demo'))).toBe('Symbol(demo)');
    expect(toRouteNameKey(undefined)).toBeNull();
  });

  it('isSkipMenuAuthRoute 仅在 meta.skipMenuAuth=true 时命中', () => {
    const routeA = { path: '/a', component: {}, meta: { skipMenuAuth: true } } as RouteRecordRaw;
    const routeB = { path: '/b', component: {}, meta: { skipMenuAuth: false } } as RouteRecordRaw;

    expect(isSkipMenuAuthRoute(routeA)).toBe(true);
    expect(isSkipMenuAuthRoute(routeB)).toBe(false);
  });

  it('getSkipMenuAuthRouteName 仅返回带 name 的 skipMenuAuth 路由', () => {
    const routeA = {
      path: '/a',
      component: {},
      name: 'DemoPageA',
      meta: { skipMenuAuth: true }
    } as RouteRecordRaw;
    const routeB = {
      path: '/b',
      component: {},
      meta: { skipMenuAuth: true }
    } as RouteRecordRaw;
    const routeC = {
      path: '/c',
      component: {},
      name: 'DemoPageC',
      meta: { skipMenuAuth: false }
    } as RouteRecordRaw;

    expect(getSkipMenuAuthRouteName(routeA)).toBe('DemoPageA');
    expect(getSkipMenuAuthRouteName(routeB)).toBeNull();
    expect(getSkipMenuAuthRouteName(routeC)).toBeNull();
  });
});
