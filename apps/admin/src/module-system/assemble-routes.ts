import type { RouteRecordRaw } from 'vue-router';
import { resolveInitialPathFromStorage } from '@one-base-template/core';
import { AdminLayout, ForbiddenPage, NotFoundPage } from '@one-base-template/ui';

import { appEnv } from '../infra/env';
import { getEnabledModules } from './registry';

function getRootRedirect(): string {
  return resolveInitialPathFromStorage({
    defaultSystemCode: appEnv.defaultSystemCode,
    systemHomeMap: appEnv.systemHomeMap,
    storageNamespace: appEnv.storageNamespace,
    fallbackHome: '/home/index'
  });
}

export function getAppRoutes(): RouteRecordRaw[] {
  const modules = getEnabledModules(appEnv.enabledModules);
  const layoutRoutes = modules.flatMap((item) => item.routes.layout);
  const standaloneRoutes = modules.flatMap((item) => item.routes.standalone ?? []);

  return [
    ...standaloneRoutes,
    {
      path: '/',
      component: AdminLayout,
      redirect: () => getRootRedirect(),
      children: layoutRoutes
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
      component: ForbiddenPage,
      meta: { public: true, hiddenTab: true }
    },
    {
      path: '/404',
      name: 'NotFound',
      component: NotFoundPage,
      meta: { public: true, hiddenTab: true }
    },
    {
      path: '/:pathMatch(.*)*',
      // 404 跳转使用 push（replace=false），保留上一页历史，便于在 404 页执行“返回上一页”。
      redirect: () => ({
        path: '/404',
        replace: false
      }),
      meta: { public: true, hiddenTab: true }
    }
  ];
}
