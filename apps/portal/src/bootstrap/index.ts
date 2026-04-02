import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import ElementPlus from 'element-plus';
import {
  ONE_BUILTIN_THEMES,
  createCore,
  createStaticMenusFromRoutes,
  installRouteDynamicImportRecovery,
  setObHttpClient,
  setupRouterGuards
} from '@one-base-template/core';
import { registerMessageUtils } from '@one-base-template/ui';
import { registerOneLiteUiComponents } from '@one-base-template/ui/lite';
import '@one-base-template/tag/style';

import App from '@/App.vue';
import { appEnv } from '@/config/env';
import { appPortalSsoApiConfig, appSsoOptions } from '@/config/sso';
import { APP_FORBIDDEN_ROUTE_PATH, APP_LOGIN_ROUTE_PATH } from '@/router/constants';
import { createAppRouter } from '@/router';
import { portalRoutes } from '@/router/routes';
import { createAppAdapter } from './adapter';
import { createAppHttp } from './http';

export function bootstrapPortalApp() {
  const app = createApp(App);
  registerMessageUtils(app);

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
    basicSystemPermissionCode: appEnv.basicSystemPermissionCode,
    basicTicketSsoEndpoint: appPortalSsoApiConfig.ticketSsoEndpoint
  });

  const staticMenus =
    appEnv.menuMode === 'static'
      ? createStaticMenusFromRoutes(portalRoutes, { rootPath: '/' })
      : undefined;

  app.use(
    createCore({
      storageNamespace: appEnv.storageNamespace,
      adapter,
      auth: {
        mode: appEnv.authMode,
        tokenKey: appEnv.tokenKey
      },
      menuMode: appEnv.menuMode,
      staticMenus,
      sso: appSsoOptions,
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
    loginRoutePath: APP_LOGIN_ROUTE_PATH,
    forbiddenRoutePath: APP_FORBIDDEN_ROUTE_PATH,
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
