import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import {
  ONE_BUILTIN_THEMES,
  createCore,
  createStaticMenusFromRoutes,
  setupRouterGuards
} from '@one-base-template/core';
import { registerOneLiteUiComponents } from '@one-base-template/ui/lite';
import OneTag from '@one-base-template/tag';
import '@one-base-template/tag/style';

import App from '@/App.vue';
import { appEnv } from '@/infra/env';
import { createTemplateLocalAdapter } from '@/infra/local-adapter';
import {
  APP_FORBIDDEN_ROUTE_PATH,
  APP_LOGIN_ROUTE_PATH,
  APP_NOT_FOUND_ROUTE_PATH,
  APP_PUBLIC_ROUTE_PATHS,
  APP_ROOT_PATH
} from '@/router/constants';
import { createAppRouter } from '@/router';
import { templateRoutes } from '@/router/routes';

function isHiddenTagRoute(route: unknown): boolean {
  if (!route || typeof route !== 'object') {
    return false;
  }

  const { meta } = route as { meta?: Record<string, unknown> };
  return meta?.hiddenTab === true || meta?.noTag === true;
}

export function bootstrapTemplateApp() {
  const app = createApp(App);

  const pinia = createPinia();
  app.use(pinia);
  setActivePinia(pinia);

  const router = createAppRouter();
  app.use(router);

  registerOneLiteUiComponents(app, {
    prefix: 'Ob',
    aliases: false,
    include: {
      LoginBox: false,
      LoginBoxV2: false
    }
  });

  app.use(OneTag, {
    pinia,
    router,
    homePath: '/home/index',
    homeTitle: '首页',
    storageType: 'session',
    storageKey: `${appEnv.storageNamespace}:ob_tags`,
    ignoredRoutes: [
      { path: APP_LOGIN_ROUTE_PATH },
      { path: APP_FORBIDDEN_ROUTE_PATH },
      { path: APP_NOT_FOUND_ROUTE_PATH },
      { path: APP_ROOT_PATH },
      {
        test: (route) => isHiddenTagRoute(route)
      }
    ]
  });

  const adapter = createTemplateLocalAdapter({
    storageNamespace: appEnv.storageNamespace,
    tokenKey: appEnv.tokenKey
  });

  const staticMenus =
    appEnv.menuMode === 'static'
      ? createStaticMenusFromRoutes(templateRoutes, { rootPath: '/' })
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
        defaultMode: 'side',
        persist: true
      },
      systems: {
        defaultCode: appEnv.defaultSystemCode,
        homeMap: appEnv.systemHomeMap,
        fallbackHome: '/home/index'
      }
    })
  );

  setupRouterGuards(router, {
    publicRoutePaths: [...APP_PUBLIC_ROUTE_PATHS],
    loginRoutePath: APP_LOGIN_ROUTE_PATH,
    forbiddenRoutePath: APP_FORBIDDEN_ROUTE_PATH
  });

  return {
    app,
    router,
    pinia
  };
}
