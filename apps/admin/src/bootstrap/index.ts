import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { OneUiPlugin } from '@one-base-template/ui';
import OneTag from '@one-base-template/tag';
import '@one-base-template/tag/style';

import App from '../App.vue';
import { getRoutes } from '../router';
import { setupRouterGuards } from '@one-base-template/core';

import { setObHttpClient } from '../infra/http';
import { appEnv } from '../infra/env';
import {
  appCrudContainerDefaultType,
  appLayoutMode,
  appSidebarCollapsedWidth,
  appSidebarWidth,
  appSystemSwitchStyle,
  appTableDefaults,
  appTopbarHeight
} from '../config';
import { DEFAULT_FALLBACK_HOME } from '../config/systems';
import {
  APP_FORBIDDEN_ROUTE_PATH,
  APP_GUARD_PUBLIC_ROUTE_PATHS,
  APP_LOGIN_ROUTE_PATH,
  APP_NOT_FOUND_ROUTE_PATH,
  APP_ROOT_PATH,
  APP_SKIP_MENU_AUTH_ROUTE_NAMES,
  APP_SSO_ROUTE_PATH
} from '../router/constants';

import { createAppRouter } from './router';
import { createAppHttp } from './http';
import { createAppAdapter } from './adapter';
import { installCore } from './core';
import { registerMessageUtils } from '../utils/message';

export function bootstrapAdminApp() {
  const app = createApp(App);
  registerMessageUtils(app);

  const pinia = createPinia();
  app.use(pinia);
  // 全局注册 @one-base-template/ui 组件，同时提供无前缀别名（如 PageContainer），减少页面重复 import。
  app.use(OneUiPlugin, {
    prefix: 'Ob',
    aliases: true,
    crudContainer: {
      defaultContainer: appCrudContainerDefaultType
    },
    table: appTableDefaults
  });
  // 允许在路由守卫 / http hooks 等“组件外”场景安全使用 store
  setActivePinia(pinia);

  const routes = getRoutes();
  const router = createAppRouter(routes);
  app.use(router);
  app.use(OneTag, {
    pinia,
    router,
    homePath: DEFAULT_FALLBACK_HOME,
    homeTitle: '首页',
    storageType: 'session',
    storageKey: `${appEnv.storageNamespace}:ob_tags`,
    ignoredRoutes: [
      { path: APP_LOGIN_ROUTE_PATH },
      { path: APP_SSO_ROUTE_PATH },
      { path: APP_FORBIDDEN_ROUTE_PATH },
      { path: APP_NOT_FOUND_ROUTE_PATH },
      { path: APP_ROOT_PATH },
      { pathIncludes: '/redirect' },
      { pathIncludes: '/error' },
      {
        test: route => {
          if (!route || typeof route !== 'object') return false;
          const meta = (route as { meta?: Record<string, unknown> }).meta;
          return Boolean(meta?.hiddenTab || meta?.noTag);
        }
      }
    ]
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

  setupRouterGuards(router, {
    publicRoutePaths: [...APP_GUARD_PUBLIC_ROUTE_PATHS],
    loginRoutePath: APP_LOGIN_ROUTE_PATH,
    forbiddenRoutePath: APP_FORBIDDEN_ROUTE_PATH,
    allowedSkipMenuAuthRouteNames: [...APP_SKIP_MENU_AUTH_ROUTE_NAMES],
    onNavigationStart: () => {
      http.cancelRouteRequests();
    }
  });

  return { app, router, pinia };
}
