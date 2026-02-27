import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { OneUiPlugin } from '@one-base-template/ui';
import OneTag from '@one-base-template/tag';
import '@one-base-template/tag/style';

import App from '../App.vue';
import { routes } from '../router';
import { setupRouterGuards } from '@one-base-template/core';

import { setObHttpClient } from '../infra/http';
import { appEnv } from '../infra/env';
import { appLayoutMode, appSystemSwitchStyle, appTopbarHeight, appSidebarWidth, appSidebarCollapsedWidth } from '../config';

import { createAppRouter } from './router';
import { createAppHttp } from './http';
import { createAppAdapter } from './adapter';
import { installCore } from './core';

export function bootstrapAdminApp() {
  const app = createApp(App);

  const pinia = createPinia();
  app.use(pinia);
  // 全局注册 @one-base-template/ui 组件（如 ObThemeSwitcher），避免页面里重复手动 import。
  app.use(OneUiPlugin, { prefix: 'Ob' });
  // 允许在路由守卫 / http hooks 等“组件外”场景安全使用 store
  setActivePinia(pinia);

  const router = createAppRouter();
  app.use(router);
  app.use(OneTag, {
    pinia,
    router,
    homePath: '/home/index',
    homeTitle: '首页',
    storageType: 'session',
    storageKey: 'ob_tags',
    ignoredRoutes: [
      { path: '/login' },
      { path: '/sso' },
      { path: '/403' },
      { path: '/404' },
      { path: '/' },
      { pathIncludes: '/redirect' },
      { pathIncludes: '/error' },
      {
        test: route => {
          if (!route || typeof route !== 'object') return false;
          const meta = (route as { meta?: Record<string, unknown> }).meta;
          return Boolean(meta?.hiddenTab || meta?.noTag);
        }
      }
    ]
  });

  const http = createAppHttp({
    backend: appEnv.backend,
    isProd: appEnv.isProd,
    apiBaseUrl: appEnv.apiBaseUrl,
    authMode: appEnv.authMode,
    tokenKey: appEnv.tokenKey,
    idTokenKey: appEnv.idTokenKey,
    sczfwHeaders: appEnv.sczfwHeaders,
    clientSignatureSalt: appEnv.clientSignatureSalt,
    clientSignatureClientId: appEnv.clientSignatureClientId,
    pinia,
    router
  });
  setObHttpClient(http);

  const adapter = createAppAdapter({
    backend: appEnv.backend,
    http,
    tokenKey: appEnv.tokenKey,
    sczfwSystemPermissionCode: appEnv.sczfwSystemPermissionCode
  });

  installCore(app, {
    adapter,
    menuMode: appEnv.menuMode,
    routes,
    layoutMode: appLayoutMode,
    systemSwitchStyle: appSystemSwitchStyle,
    topbarHeight: appTopbarHeight,
    sidebarWidth: appSidebarWidth,
    sidebarCollapsedWidth: appSidebarCollapsedWidth,
    storageNamespace: appEnv.storageNamespace,
    defaultSystemCode: appEnv.defaultSystemCode,
    systemHomeMap: appEnv.systemHomeMap
  });

  setupRouterGuards(router, {
    onNavigationStart: () => {
      http.cancelRouteRequests();
    }
  });

  return { app, router, pinia };
}
