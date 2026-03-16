import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { setObHttpClient, setupRouterGuards } from '@one-base-template/core';
import { registerMessageUtils } from '@one-base-template/ui';

import App from '../App.vue';
import { assembleRoutes } from '../router/assemble-routes';
import { getAppEnv } from '../infra/env';
import {
  appLayoutMode,
  appSidebarCollapsedWidth,
  appSidebarWidth,
  appSystemSwitchStyle,
  appTopbarHeight
} from '../config';
import { routePaths } from '../router/constants';
import { guardPublicRoutePaths } from '../router/public-routes';

import { createAppHttp } from './http';
import { createAppAdapter } from './adapter';
import { installCore } from './core';
import { installAppShellPlugins } from './plugins';

const DYNAMIC_IMPORT_RELOAD_KEY = 'ob:route:dynamic-import-reload-target';
const DYNAMIC_IMPORT_ERROR_MARKERS = [
  'failed to fetch dynamically imported module',
  'importing a module script failed',
  'failed to load module script',
  'loading chunk'
];

function isDynamicImportLoadError(error: unknown): boolean {
  const text = error instanceof Error ? error.message : String(error || '');
  const normalized = text.toLowerCase();
  return DYNAMIC_IMPORT_ERROR_MARKERS.some((marker) => normalized.includes(marker));
}

function installRouteDynamicImportRecovery(router: ReturnType<typeof createRouter>) {
  if (typeof window === 'undefined') {
    return;
  }

  router.onError((error, to) => {
    if (!isDynamicImportLoadError(error)) {
      return;
    }

    const target =
      typeof to?.fullPath === 'string' && to.fullPath
        ? to.fullPath
        : `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const previousTarget = window.sessionStorage.getItem(DYNAMIC_IMPORT_RELOAD_KEY);

    if (previousTarget === target) {
      // 同一路由自动刷新后仍失败，停止自动重试，避免死循环。
      window.sessionStorage.removeItem(DYNAMIC_IMPORT_RELOAD_KEY);
      console.error('[router] 动态模块加载失败，自动刷新未恢复，请手动刷新页面。', error);
      return;
    }

    window.sessionStorage.setItem(DYNAMIC_IMPORT_RELOAD_KEY, target);
    console.warn('[router] 检测到动态模块加载失败，准备自动刷新恢复。', {
      target,
      reason: error instanceof Error ? error.message : String(error)
    });
    window.location.assign(target);
  });

  router.afterEach((to) => {
    const previousTarget = window.sessionStorage.getItem(DYNAMIC_IMPORT_RELOAD_KEY);
    if (previousTarget === to.fullPath) {
      window.sessionStorage.removeItem(DYNAMIC_IMPORT_RELOAD_KEY);
    }
  });
}

export async function bootstrapAdminApp() {
  const appEnv = getAppEnv();

  const app = createApp(App);
  registerMessageUtils(app);

  const pinia = createPinia();
  app.use(pinia);
  // 允许在路由守卫 / http hooks 等“组件外”场景安全使用 store
  setActivePinia(pinia);

  const routeAssemblyResult = await assembleRoutes({
    enabledModules: appEnv.enabledModules,
    defaultSystemCode: appEnv.defaultSystemCode,
    systemHomeMap: appEnv.systemHomeMap,
    storageNamespace: appEnv.storageNamespace
  });
  const { skipMenuAuthRouteNames } = routeAssemblyResult;
  const router = createRouter({
    history: createWebHistory(appEnv.baseUrl),
    routes: routeAssemblyResult.routes,
    strict: true
  });
  app.use(router);
  installAppShellPlugins({
    app,
    pinia,
    router,
    storageNamespace: appEnv.storageNamespace
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
    publicRoutePaths: [...guardPublicRoutePaths],
    loginRoutePath: routePaths.login,
    forbiddenRoutePath: routePaths.forbidden,
    // 路由白名单由“已装配路由 + meta.skipMenuAuth”自动生成，避免手工常量与模块启停漂移。
    allowedSkipMenuAuthRouteNames: skipMenuAuthRouteNames,
    onNavigationStart: () => {
      http.cancelRouteRequests();
    }
  });
  installRouteDynamicImportRecovery(router);

  return {
    app,
    router,
    pinia
  };
}
