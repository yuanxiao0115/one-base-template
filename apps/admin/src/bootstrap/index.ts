import { createApp } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import { setObHttpClient, setupRouterGuards } from "@one-base-template/core";
import { registerMessageUtils } from "@one-base-template/ui";

import App from "../App.vue";
import { assembleRoutes } from "../router/assemble-routes";
import { getAppEnv } from "../infra/env";
import {
  appLayoutMode,
  appSidebarCollapsedWidth,
  appSidebarWidth,
  appSystemSwitchStyle,
  appTopbarHeight,
} from "../config";
import { routePaths } from "../router/constants";
import { guardPublicRoutePaths } from "../router/public-routes";

import { createAppHttp } from "./http";
import { createAppAdapter } from "./adapter";
import { installCore } from "./core";
import { installAppShellPlugins } from "./plugins";

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
    storageNamespace: appEnv.storageNamespace,
  });
  const { skipMenuAuthRouteNames } = routeAssemblyResult;
  const router = createRouter({
    history: createWebHistory(appEnv.baseUrl),
    routes: routeAssemblyResult.routes,
    strict: true,
  });
  app.use(router);
  installAppShellPlugins({
    app,
    pinia,
    router,
    storageNamespace: appEnv.storageNamespace,
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
    router,
  });
  setObHttpClient(http);

  const adapter = createAppAdapter({
    backend: appEnv.backend,
    http,
    tokenKey: appEnv.tokenKey,
    sczfwSystemPermissionCode: appEnv.sczfwSystemPermissionCode,
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
    systemHomeMap: appEnv.systemHomeMap,
  });

  setupRouterGuards(router, {
    publicRoutePaths: [...guardPublicRoutePaths],
    loginRoutePath: routePaths.login,
    forbiddenRoutePath: routePaths.forbidden,
    // 路由白名单由“已装配路由 + meta.skipMenuAuth”自动生成，避免手工常量与模块启停漂移。
    allowedSkipMenuAuthRouteNames: skipMenuAuthRouteNames,
    onNavigationStart: () => {
      http.cancelRouteRequests();
    },
  });

  return {
    app,
    router,
    pinia,
  };
}
