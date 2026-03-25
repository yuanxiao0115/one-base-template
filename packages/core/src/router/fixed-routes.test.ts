import { describe, expect, it } from 'vite-plus/test';
import { buildFixedRoutes } from './fixed-routes';

describe('core/router/fixed-routes', () => {
  it('应支持将指定公共路由挂到 layout children 并保留其绝对路径', () => {
    const routes = buildFixedRoutes({
      rootPath: '/',
      layoutComponent: {} as never,
      layoutRoutes: [{ path: '/home/index', name: 'HomeIndex', component: {} as never }],
      defaultHomePath: '/home/index',
      publicRouteMeta: {
        public: true,
        hiddenTab: true
      },
      publicRoutes: [
        {
          path: '/login',
          name: 'Login',
          component: {} as never
        },
        {
          path: '/403',
          name: 'Forbidden',
          component: {} as never
        }
      ],
      layoutPublicRouteNames: ['Forbidden'],
      notFoundCatchallPath: '/:pathMatch(.*)*',
      notFoundPath: '/404'
    });

    expect(routes).toHaveLength(3);
    expect(routes[0]!.path).toBe('/');
    expect(routes[1]!.path).toBe('/login');
    expect(routes[2]!.path).toBe('/:pathMatch(.*)*');
    expect(typeof routes[2]!.redirect).toBe('function');

    const rootChildren = routes[0]!.children ?? [];
    expect(rootChildren).toHaveLength(2);
    expect(rootChildren[0]!.path).toBe('/home/index');
    expect(rootChildren[1]!.path).toBe('/403');

    const redirectTarget = (routes[2]!.redirect as (to: { fullPath: string }) => unknown)({
      fullPath: '/unknown/page?tab=1'
    });
    expect(redirectTarget).toEqual({
      path: '/404',
      query: {
        from: '/unknown/page?tab=1'
      }
    });
  });

  it('未显式传 notFoundPath 时应从 publicRoutes 推断', () => {
    const routes = buildFixedRoutes({
      rootPath: '/',
      layoutComponent: {} as never,
      layoutRoutes: [],
      defaultHomePath: '/home/index',
      publicRouteMeta: {
        public: true
      },
      publicRoutes: [
        {
          path: '/404',
          name: 'not-found',
          component: {} as never
        }
      ],
      notFoundCatchallPath: '/:pathMatch(.*)*'
    });

    const redirectTarget = (routes[2]!.redirect as (to: { fullPath: string }) => unknown)({
      fullPath: '/unknown/page'
    });
    expect(redirectTarget).toEqual({
      path: '/404',
      query: {
        from: '/unknown/page'
      }
    });
  });
});
