import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import ElementPlus from 'element-plus';
import {
  ONE_BUILTIN_THEMES,
  createCore,
  createStaticMenusFromRoutes,
  setObHttpClient,
  setupRouterGuards
} from '@one-base-template/core';
import { registerOneLiteUiComponents } from '@one-base-template/ui/lite';
import '@one-base-template/tag/style';

import App from '@/App.vue';
import { appEnv } from '@/infra/env';
import {
  APP_FORBIDDEN_ROUTE_PATH,
  APP_LOGIN_ROUTE_PATH,
  APP_PUBLIC_ROUTE_PATHS
} from '@/router/constants';
import { createAppRouter } from '@/router';
import { portalRoutes } from '@/router/routes';
import { createAppAdapter } from './adapter';
import { createAppHttp } from './http';

export function bootstrapPortalApp() {
  const app = createApp(App);

  const pinia = createPinia();
  app.use(pinia);
  setActivePinia(pinia);

  const router = createAppRouter();
  app.use(router);
  app.use(ElementPlus);

  registerOneLiteUiComponents(app, {
    prefix: 'Ob',
    aliases: false,
    include: {
      PageContainer: false
    }
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

  const staticMenus =
    appEnv.menuMode === 'static'
      ? createStaticMenusFromRoutes(portalRoutes, { rootPath: '/' })
      : undefined;

  app.use(
    createCore({
      storageNamespace: appEnv.storageNamespace,
      adapter,
      menuMode: appEnv.menuMode,
      staticMenus,
      sso: {
        enabled: false,
        routePath: '/sso',
        strategies: []
      },
      theme: {
        defaultTheme: 'blue',
        allowCustomPrimary: true,
        storageNamespace: appEnv.storageNamespace,
        themes: {
          ...ONE_BUILTIN_THEMES
        }
      },
      layout: {
        defaultMode: 'top',
        persist: true
      },
      systems: {
        defaultCode: appEnv.defaultSystemCode,
        homeMap: appEnv.systemHomeMap,
        fallbackHome: '/portal/index'
      }
    })
  );

  setupRouterGuards(router, {
    publicRoutePaths: [...APP_PUBLIC_ROUTE_PATHS],
    loginRoutePath: APP_LOGIN_ROUTE_PATH,
    forbiddenRoutePath: APP_FORBIDDEN_ROUTE_PATH,
    onNavigationStart: () => {
      http.cancelRouteRequests();
    }
  });

  return {
    app,
    router,
    pinia
  };
}
