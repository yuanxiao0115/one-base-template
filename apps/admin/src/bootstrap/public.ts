import { createApp } from "vue";
import { createPinia, setActivePinia } from "pinia";

import App from "../App.vue";
import { setObHttpClient } from "../infra/http";
import { appEnv } from "../infra/env";
import {
  appLayoutMode,
  appSidebarCollapsedWidth,
  appSidebarWidth,
  appSystemSwitchStyle,
  appTopbarHeight,
} from "../config";
import { getPublicRoutes } from "../router/public-routes";

import { createAppRouter } from "./router";
import { createAppHttp } from "./http";
import { createAppAdapter } from "./adapter";
import { installCore } from "./core";
import { setBootstrapMode } from "./runtime";

export function bootstrapPublicApp() {
  setBootstrapMode("public");

  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);
  setActivePinia(pinia);

  const routes = getPublicRoutes();
  const router = createAppRouter(routes);
  app.use(router);

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
    routes,
    layoutMode: appLayoutMode,
    systemSwitchStyle: appSystemSwitchStyle,
    topbarHeight: appTopbarHeight,
    sidebarWidth: appSidebarWidth,
    sidebarCollapsedWidth: appSidebarCollapsedWidth,
    storageNamespace: appEnv.storageNamespace,
    defaultSystemCode: appEnv.defaultSystemCode,
    systemHomeMap: appEnv.systemHomeMap,
  });

  return {
    app,
    router,
    pinia,
  };
}
