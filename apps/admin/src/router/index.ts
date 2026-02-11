import type { RouteRecordRaw } from 'vue-router';
import { AdminLayout } from '@standard-base-tamplate/ui';

type RouteModule = { default?: RouteRecordRaw[]; routes?: RouteRecordRaw[] };
const modules = import.meta.glob('../modules/**/routes.ts', { eager: true }) as Record<string, RouteModule>;

const moduleRoutes: RouteRecordRaw[] = [];
for (const mod of Object.values(modules)) {
  const routes = mod.default ?? mod.routes;
  if (Array.isArray(routes)) {
    moduleRoutes.push(...routes);
  }
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AdminLayout,
    redirect: '/home',
    children: moduleRoutes
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/login/LoginPage.vue'),
    meta: { public: true, hiddenTab: true }
  },
  {
    path: '/sso',
    name: 'Sso',
    component: () => import('../pages/sso/SsoCallbackPage.vue'),
    meta: { public: true, hiddenTab: true }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../pages/error/ForbiddenPage.vue'),
    meta: { public: true, hiddenTab: true }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('../pages/error/NotFoundPage.vue'),
    meta: { public: true, hiddenTab: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: { public: true, hiddenTab: true }
  }
];
