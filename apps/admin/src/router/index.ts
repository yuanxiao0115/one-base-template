import type { RouteRecordRaw } from 'vue-router';
import { AdminLayout } from '@one-base-template/ui';

import { appEnv } from '../infra/env';

type RouteModule = { default?: RouteRecordRaw[]; routes?: RouteRecordRaw[] };
const modules = import.meta.glob('../modules/**/routes.ts', { eager: true }) as Record<string, RouteModule>;

const moduleRoutes: RouteRecordRaw[] = [];
for (const mod of Object.values(modules)) {
  const routes = mod.default ?? mod.routes;
  if (Array.isArray(routes)) {
    moduleRoutes.push(...routes);
  }
}

function resolveRootRedirect(): string {
  // 与 core 的 systemStore 持久化 key 保持一致
  const currentSystemCode = (() => {
    try {
      return localStorage.getItem('ob_system_current') || '';
    } catch {
      return '';
    }
  })();

  const code = currentSystemCode || (appEnv.defaultSystemCode ?? '');

  const mapped = code ? appEnv.systemHomeMap[code] : undefined;
  return typeof mapped === 'string' && mapped.startsWith('/') ? mapped : '/home/index';
}

export const routes: RouteRecordRaw[] = [
  {
    // 门户预览页：必须是顶层路由，避免被 AdminLayout（侧栏/顶栏）包裹
    path: '/portal/preview/:tabId?',
    name: 'PortalPreview',
    component: () => import('../modules/portal/pages/PortalPreviewRenderPage.vue'),
    meta: { public: true, hiddenTab: true }
  },
  {
    path: '/',
    component: AdminLayout,
    redirect: () => resolveRootRedirect(),
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
