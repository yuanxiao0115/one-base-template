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
import { createStartupProfiler } from './startup-profiler';

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
  const profiler = createStartupProfiler();
  let appEnv: ReturnType<typeof getAppEnv> | null = null;

  try {
    const resolvedAppEnv = await profiler.runStage(
      'resolve-app-env',
      () => getAppEnv(),
      (env) => ({
        baseUrl: env.baseUrl,
        menuMode: env.menuMode
      })
    );
    appEnv = resolvedAppEnv;

    const app = await profiler.runStage('create-app', () => {
      const nextApp = createApp(App);
      registerMessageUtils(nextApp);
      return nextApp;
    });

    const pinia = await profiler.runStage('create-pinia', () => {
      const nextPinia = createPinia();
      app.use(nextPinia);
      // 允许在路由守卫 / http hooks 等“组件外”场景安全使用 store
      setActivePinia(nextPinia);
      return nextPinia;
    });

    const routeAssemblyResult = await profiler.runStage(
      'assemble-routes',
      () =>
        assembleRoutes({
          enabledModules: resolvedAppEnv.enabledModules,
          defaultSystemCode: resolvedAppEnv.defaultSystemCode,
          systemHomeMap: resolvedAppEnv.systemHomeMap,
          storageNamespace: resolvedAppEnv.storageNamespace
        }),
      (result) => ({ ...result.diagnostics })
    );
    const { skipMenuAuthRouteNames } = routeAssemblyResult;

    const router = await profiler.runStage(
      'create-router',
      () => {
        const nextRouter = createRouter({
          history: createWebHistory(resolvedAppEnv.baseUrl),
          routes: routeAssemblyResult.routes,
          strict: true
        });
        app.use(nextRouter);
        return nextRouter;
      },
      () => ({
        routeCount: routeAssemblyResult.diagnostics.routeCount
      })
    );

    await profiler.runStage('install-app-shell-plugins', () =>
      installAppShellPlugins({
        app,
        pinia,
        router,
        storageNamespace: resolvedAppEnv.storageNamespace
      })
    );

    const http = await profiler.runStage('create-http', () => {
      const nextHttp = createAppHttp({
        backend: resolvedAppEnv.backend,
        isProd: resolvedAppEnv.isProd,
        apiBaseUrl: resolvedAppEnv.apiBaseUrl,
        authMode: resolvedAppEnv.authMode,
        tokenKey: resolvedAppEnv.tokenKey,
        idTokenKey: resolvedAppEnv.idTokenKey,
        sczfwHeaders: resolvedAppEnv.sczfwHeaders,
        clientSignatureSalt: resolvedAppEnv.clientSignatureSalt,
        clientSignatureClientId: resolvedAppEnv.clientSignatureClientId,
        pinia,
        router
      });
      setObHttpClient(nextHttp);
      return nextHttp;
    });

    const adapter = await profiler.runStage(
      'create-adapter',
      () =>
        createAppAdapter({
          backend: resolvedAppEnv.backend,
          http,
          tokenKey: resolvedAppEnv.tokenKey,
          sczfwSystemPermissionCode: resolvedAppEnv.sczfwSystemPermissionCode
        }),
      () => ({
        backend: resolvedAppEnv.backend
      })
    );

    await profiler.runStage('install-core', () =>
      installCore(app, {
        adapter,
        menuMode: resolvedAppEnv.menuMode,
        routes: routeAssemblyResult.routes,
        layoutMode: appLayoutMode,
        systemSwitchStyle: appSystemSwitchStyle,
        topbarHeight: appTopbarHeight,
        sidebarWidth: appSidebarWidth,
        sidebarCollapsedWidth: appSidebarCollapsedWidth,
        storageNamespace: resolvedAppEnv.storageNamespace,
        defaultSystemCode: resolvedAppEnv.defaultSystemCode,
        systemHomeMap: resolvedAppEnv.systemHomeMap
      })
    );

    await profiler.runStage(
      'setup-router-guards',
      () =>
        setupRouterGuards(router, {
          publicRoutePaths: [...guardPublicRoutePaths],
          loginRoutePath: routePaths.login,
          forbiddenRoutePath: routePaths.forbidden,
          // 路由白名单由“已装配路由 + meta.skipMenuAuth”自动生成，避免手工常量与模块启停漂移。
          allowedSkipMenuAuthRouteNames: skipMenuAuthRouteNames,
          onNavigationStart: () => {
            http.cancelRouteRequests();
          }
        }),
      () => ({
        skipMenuAuthCount: routeAssemblyResult.diagnostics.skipMenuAuthCount
      })
    );

    await profiler.runStage('install-route-dynamic-import-recovery', () =>
      installRouteDynamicImportRecovery(router)
    );

    profiler.complete({
      baseUrl: resolvedAppEnv.baseUrl,
      menuMode: resolvedAppEnv.menuMode,
      routeSignature: routeAssemblyResult.diagnostics.signature
    });

    return {
      app,
      router,
      pinia
    };
  } catch (error) {
    profiler.fail(
      error,
      appEnv
        ? {
            baseUrl: appEnv.baseUrl,
            menuMode: appEnv.menuMode
          }
        : undefined
    );
    throw error;
  }
}
