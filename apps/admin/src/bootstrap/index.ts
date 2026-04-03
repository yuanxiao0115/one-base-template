import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import {
  installRouteDynamicImportRecovery,
  resolveAuthRedirectTargetFromQuery,
  setObHttpClient,
  setupRouterGuards
} from '@one-base-template/core';
import { registerMessageUtils } from '@one-base-template/ui';

import App from '../App.vue';
import { buildAppRoutes } from '../router/assemble-routes';
import { authApi } from '../config';
import { routePaths } from '../router/constants';
import { guardOpenRoutePaths } from '../router/public-routes';

import { createAppHttp } from './http';
import { createAppAdapter } from './adapter';
import { installCore } from './core';
import { installAppShellPlugins } from './plugins';
import { createStartupProfiler } from './startup-profiler';
import { getRuntime } from './runtime';

function createRouterHistory(historyMode: 'history' | 'hash', baseUrl: string) {
  return historyMode === 'hash' ? createWebHashHistory(baseUrl) : createWebHistory(baseUrl);
}

export async function bootstrapAdminApp() {
  const profiler = createStartupProfiler();
  let runtime: ReturnType<typeof getRuntime> | null = null;

  try {
    const resolvedRuntime = await profiler.runStage(
      'resolve-runtime',
      () => getRuntime(),
      (nextRuntime) => ({
        baseUrl: nextRuntime.baseUrl,
        menuMode: nextRuntime.menuMode
      })
    );
    runtime = resolvedRuntime;

    const app = await profiler.runStage('create-app', () => {
      const nextApp = createApp(App);
      registerMessageUtils(nextApp);
      return nextApp;
    });

    const pinia = await profiler.runStage('create-pinia', () => {
      const nextPinia = createPinia();
      app.use(nextPinia);
      setActivePinia(nextPinia);
      return nextPinia;
    });

    const routeAssemblyResult = await profiler.runStage(
      'assemble-routes',
      () =>
        buildAppRoutes({
          enabledModules: resolvedRuntime.enabledModules,
          defaultSystemCode: resolvedRuntime.defaultSystemCode,
          systemHomeMap: resolvedRuntime.systemHomeMap,
          storageNamespace: resolvedRuntime.storageNamespace
        }),
      (result) => ({ ...result.diagnostics })
    );
    const router = await profiler.runStage(
      'create-router',
      () => {
        const nextRouter = createRouter({
          history: createRouterHistory(resolvedRuntime.historyMode, resolvedRuntime.baseUrl),
          routes: routeAssemblyResult.routes,
          strict: true
        });
        return nextRouter;
      },
      () => ({
        routeCount: routeAssemblyResult.diagnostics.routeCount
      })
    );

    const http = await profiler.runStage('create-http', () => {
      const nextHttp = createAppHttp({
        backend: resolvedRuntime.backend,
        isProd: resolvedRuntime.isProd,
        apiBaseUrl: resolvedRuntime.apiBaseUrl,
        authMode: resolvedRuntime.authMode,
        tokenKey: resolvedRuntime.tokenKey,
        idTokenKey: resolvedRuntime.idTokenKey,
        basicHeaders: resolvedRuntime.basicHeaders,
        clientSignatureSalt: resolvedRuntime.clientSignatureSalt,
        clientSignatureClientId: resolvedRuntime.clientSignatureClientId,
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
          backend: resolvedRuntime.backend,
          http,
          tokenKey: resolvedRuntime.tokenKey,
          basicSystemPermissionCode: resolvedRuntime.basicSystemPermissionCode,
          systemConfig: resolvedRuntime.systemConfig,
          basicTicketSsoEndpoint: authApi.ticketSsoEndpoint
        }),
      () => ({
        backend: resolvedRuntime.backend
      })
    );

    await profiler.runStage('install-core', () =>
      installCore(app, {
        adapter,
        authMode: resolvedRuntime.authMode,
        tokenKey: resolvedRuntime.tokenKey,
        menuMode: resolvedRuntime.menuMode,
        routes: routeAssemblyResult.routes,
        storageNamespace: resolvedRuntime.storageNamespace,
        defaultSystemCode: resolvedRuntime.defaultSystemCode,
        systemHomeMap: resolvedRuntime.systemHomeMap
      })
    );

    await profiler.runStage(
      'setup-router-guards',
      () =>
        setupRouterGuards(router, {
          publicRoutePaths: [...guardOpenRoutePaths],
          loginRoutePath: routePaths.login,
          forbiddenRoutePath: routePaths.forbidden,
          resolveAuthedLoginRedirect: ({ to }) =>
            resolveAuthRedirectTargetFromQuery(to.query, {
              fallback: routePaths.root,
              baseUrl: resolvedRuntime.baseUrl
            }),
          onNavigationStart: () => {
            http.cancelRouteRequests();
          }
        }),
      () => ({
        routeCount: routeAssemblyResult.diagnostics.routeCount
      })
    );

    await profiler.runStage('install-route-dynamic-import-recovery', () =>
      installRouteDynamicImportRecovery(router)
    );

    await profiler.runStage('install-router', () => {
      app.use(router);
    });

    await profiler.runStage('install-app-shell-plugins', () =>
      installAppShellPlugins({
        app,
        pinia,
        router,
        storageNamespace: resolvedRuntime.storageNamespace
      })
    );

    profiler.complete({
      baseUrl: resolvedRuntime.baseUrl,
      menuMode: resolvedRuntime.menuMode,
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
      runtime
        ? {
            baseUrl: runtime.baseUrl,
            menuMode: runtime.menuMode
          }
        : undefined
    );
    throw error;
  }
}
