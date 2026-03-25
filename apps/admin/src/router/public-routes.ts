import type { PublicRouteDefinition } from '@one-base-template/core';
import { ForbiddenPage, NotFoundPage } from '@one-base-template/ui/shell';
import { routePaths } from './constants';
import { createAuthRouteMeta, createOpenRouteMeta } from './meta';

export const publicRoutes: PublicRouteDefinition[] = [
  {
    path: routePaths.login,
    name: 'login',
    component: async () => import('../pages/login/LoginPage.vue'),
    meta: createOpenRouteMeta()
  },
  {
    path: routePaths.sso,
    name: 'sso',
    component: async () => import('../pages/sso/SsoCallbackPage.vue'),
    meta: createOpenRouteMeta()
  },
  {
    path: routePaths.forbidden,
    name: 'forbidden',
    component: ForbiddenPage,
    meta: createAuthRouteMeta({
      hiddenTab: true
    })
  },
  {
    path: routePaths.notFound,
    name: 'not-found',
    component: NotFoundPage,
    meta: createAuthRouteMeta({
      hiddenTab: true
    })
  }
];

export const guardOpenRoutePaths = publicRoutes
  .filter((item) => item.meta?.access === 'open')
  .map((item) => item.path);

export const reservedRoutePaths = new Set<string>([
  routePaths.root,
  routePaths.catchall,
  ...publicRoutes.map((item) => item.path)
]);

export const reservedRouteNames = new Set<string>(publicRoutes.map((item) => item.name));
