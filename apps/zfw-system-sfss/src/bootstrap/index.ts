import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import {
  installRouteDynamicImportRecovery,
  resolveAppRedirectTarget,
  setObHttpClient,
  setupRouterGuards
} from '@one-base-template/core';
import { registerMessageUtils } from '@one-base-template/ui';
import App from '@/App.vue';
import { buildAppRoutes } from '@/router/assemble-routes';
import { getAppEnv } from '@/config/env';
import {
  appLayoutMode,
  appSidebarCollapsedWidth,
  appSidebarWidth,
  appSystemSwitchStyle,
  appTopbarHeight
} from '@/config';
import { routePaths } from '@/router/constants';
import { guardOpenRoutePaths } from '@/router/public-routes';
import { createAppHttp } from './http';
import { createAppAdapter } from './adapter';
import { installCore } from './core';
import { installAppShellPlugins } from './plugins';

export async function bootstrapZfwSystemSfssApp() {
  const appEnv = getAppEnv();

  const app = createApp(App);
  registerMessageUtils(app);

  const pinia = createPinia();
  app.use(pinia);
  setActivePinia(pinia);

  const routeAssemblyResult = await buildAppRoutes({
    enabledModules: appEnv.enabledModules,
    defaultSystemCode: appEnv.defaultSystemCode,
    systemHomeMap: appEnv.systemHomeMap,
    storageNamespace: appEnv.storageNamespace
  });

  const router = createRouter({
    history: createWebHistory(appEnv.baseUrl),
    routes: routeAssemblyResult.routes,
    strict: true
  });

  const http = createAppHttp({
    backend: appEnv.backend,
    isProd: appEnv.isProd,
    apiBaseUrl: appEnv.apiBaseUrl,
    authMode: appEnv.authMode,
    tokenKey: appEnv.tokenKey,
    idTokenKey: appEnv.idTokenKey,
    basicHeaders: appEnv.basicHeaders,
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
    basicSystemPermissionCode: appEnv.basicSystemPermissionCode
  });

  installCore(app, {
    adapter,
    authMode: appEnv.authMode,
    tokenKey: appEnv.tokenKey,
    menuMode: appEnv.menuMode,
    routes: routeAssemblyResult.routes,
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
    publicRoutePaths: [...guardOpenRoutePaths],
    loginRoutePath: routePaths.login,
    forbiddenRoutePath: routePaths.forbidden,
    resolveAuthedLoginRedirect: ({ to }) =>
      resolveAppRedirectTarget(to.query.redirect, {
        fallback: routePaths.root,
        baseUrl: appEnv.baseUrl
      }),
    onNavigationStart: () => {
      http.cancelRouteRequests();
    }
  });
  installRouteDynamicImportRecovery(router);

  app.use(router);
  installAppShellPlugins({
    app,
    pinia,
    router,
    storageNamespace: appEnv.storageNamespace
  });

  return {
    app,
    router,
    pinia
  };
}
