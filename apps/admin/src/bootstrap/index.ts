import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import '@one-base-template/tag/style';

import App from '../App.vue';
import { getRouteAssemblyResult } from '../router';

import { setObHttpClient } from '../infra/http';
import { appEnv } from '../infra/env';
import {
  appLayoutMode,
  appSidebarCollapsedWidth,
  appSidebarWidth,
  appSystemSwitchStyle,
  appTopbarHeight
} from '../config';

import { createAppRouter } from './router';
import { createAppHttp } from './http';
import { createAppAdapter } from './adapter';
import { installCore } from './core';
import { installAppShellPlugins } from './plugins';
import { installAppRouterGuards } from './guards';
import { registerMessageUtils } from '../utils/message';

export function bootstrapAdminApp() {
  const app = createApp(App);
  registerMessageUtils(app);

  const pinia = createPinia();
  app.use(pinia);
  // 允许在路由守卫 / http hooks 等“组件外”场景安全使用 store
  setActivePinia(pinia);

  const { routes, skipMenuAuthRouteNames } = getRouteAssemblyResult();
  const router = createAppRouter(routes);
  app.use(router);
  installAppShellPlugins({ app, pinia, router });

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

  installAppRouterGuards({
    router,
    skipMenuAuthRouteNames,
    onNavigationStart: () => {
      http.cancelRouteRequests();
    }
  });

  return { app, router, pinia };
}
