import { describe, expect, it } from 'vite-plus/test';
import type { RouteRecordRaw } from 'vue-router';
import { createStaticMenusFromRoutes } from './fromRoutes';

describe('menu/fromRoutes', () => {
  it('应过滤开放路由与旧 public 路由', () => {
    const routes: RouteRecordRaw[] = [
      {
        path: '/',
        children: [
          {
            path: '/login',
            name: 'Login',
            meta: {
              title: '登录页',
              access: 'open'
            }
          } as unknown as RouteRecordRaw,
          {
            path: '/legacy',
            name: 'LegacyPublic',
            meta: {
              title: '旧开放页',
              public: true
            }
          } as unknown as RouteRecordRaw,
          {
            path: '/dashboard',
            name: 'Dashboard',
            meta: {
              title: '工作台'
            }
          } as unknown as RouteRecordRaw
        ]
      }
    ];

    expect(createStaticMenusFromRoutes(routes, { rootPath: '/' })).toEqual([
      {
        path: '/dashboard',
        title: '工作台',
        icon: undefined,
        order: undefined,
        keepAlive: false,
        external: undefined,
        children: undefined
      }
    ]);
  });
});
