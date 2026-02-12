import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';

import App from '../App.vue';
import { routes } from '../router';
import { setupRouterGuards } from '@one-base-template/core';

import { setObHttpClient } from '../infra/http';
import { appEnv } from '../infra/env';

import { createAppRouter } from './router';
import { createAppHttp } from './http';
import { createAppAdapter } from './adapter';
import { installCore } from './core';

export function bootstrapAdminApp() {
  const app = createApp(App);

  const pinia = createPinia();
  app.use(pinia);
  // 允许在路由守卫 / http hooks 等“组件外”场景安全使用 store
  setActivePinia(pinia);

  const router = createAppRouter();
  app.use(router);

  const http = createAppHttp({
    backend: appEnv.backend,
    isProd: appEnv.isProd,
    apiBaseUrl: appEnv.apiBaseUrl,
    authMode: appEnv.authMode,
    tokenKey: appEnv.tokenKey,
    idTokenKey: appEnv.idTokenKey,
    sczfwHeaders: appEnv.sczfwHeaders,
    clientSignatureSecret: appEnv.clientSignatureSecret,
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
    layoutMode: appEnv.layoutMode,
    defaultSystemCode: appEnv.defaultSystemCode,
    systemHomeMap: appEnv.systemHomeMap
  });

  setupRouterGuards(router);

  return { app, router, pinia };
}
