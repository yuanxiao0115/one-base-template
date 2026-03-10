import { describe, expect, it } from 'vitest';
import { buildFixedRoutes } from './fixed-routes';

describe('core/router/fixed-routes', () => {
  it('应按固定顺序生成 layout/public/catchall 路由', () => {
    const routes = buildFixedRoutes({
      rootPath: '/',
      layoutComponent: {} as never,
      layoutRoutes: [{ path: '/home/index', name: 'HomeIndex', component: {} as never }],
      defaultHomePath: '/home/index',
      publicRouteMeta: {
        public: true,
        hiddenTab: true,
      },
      publicRoutes: [
        {
          path: '/login',
          name: 'Login',
          component: {} as never,
        },
        {
          path: '/403',
          name: 'Forbidden',
          component: {} as never,
        },
      ],
      notFoundCatchallPath: '/:pathMatch(.*)*',
      notFoundPath: '/404',
    });

    expect(routes).toHaveLength(4);
    expect(routes[0]!.path).toBe('/');
    expect(routes[1]!.path).toBe('/login');
    expect(routes[2]!.path).toBe('/403');
    expect(routes[3]!.path).toBe('/:pathMatch(.*)*');
    expect(typeof routes[3]!.redirect).toBe('function');

    const redirectTarget = (routes[3]!.redirect as () => { path: string; replace: boolean })();
    expect(redirectTarget).toEqual({
      path: '/404',
      replace: true,
    });
  });

  it('未显式传 notFoundPath 时应从 publicRoutes 推断', () => {
    const routes = buildFixedRoutes({
      rootPath: '/',
      layoutComponent: {} as never,
      layoutRoutes: [],
      defaultHomePath: '/home/index',
      publicRouteMeta: {
        public: true,
      },
      publicRoutes: [
        {
          path: '/404',
          name: 'not-found',
          component: {} as never,
        },
      ],
      notFoundCatchallPath: '/:pathMatch(.*)*',
    });

    const redirectTarget = (routes[2]!.redirect as () => { path: string; replace: boolean })();
    expect(redirectTarget).toEqual({
      path: '/404',
      replace: true,
    });
  });
});
