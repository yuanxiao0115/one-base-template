import type { App } from 'vue';
import type { Pinia } from 'pinia';
import type { Router } from 'vue-router';
import { OneUiPlugin } from '@one-base-template/ui';
import OneTag from '@one-base-template/tag';

import { appCrudContainerDefaultType, appTableDefaults } from '../config';
import { DEFAULT_FALLBACK_HOME } from '../config/systems';
import { routePaths } from '../router/constants';
import AdminTopBar from '../components/top/AdminTopBar.vue';

function isHiddenTagRoute(route: unknown): boolean {
  if (!route || typeof route !== 'object') {
    return false;
  }
  const { meta } = route as { meta?: Record<string, unknown> };
  return Boolean(meta?.hiddenTab || meta?.noTag);
}

export function installAppShellPlugins(params: {
  app: App;
  pinia: Pinia;
  router: Router;
  storageNamespace: string;
}) {
  const { app, pinia, router, storageNamespace } = params;

  // 全局注册 @one-base-template/ui 组件，仅使用 Ob 前缀组件名（如 ObPageContainer / ObTableBox）。
  app.use(OneUiPlugin, {
    prefix: 'Ob',
    aliases: false,
    crudContainer: {
      defaultContainer: appCrudContainerDefaultType
    },
    table: appTableDefaults,
    topBarComponent: AdminTopBar
  });

  app.use(OneTag, {
    pinia,
    router,
    homePath: DEFAULT_FALLBACK_HOME,
    homeTitle: '首页',
    storageType: 'session',
    storageKey: `${storageNamespace}:ob_tags`,
    ignoredRoutes: [
      { path: routePaths.login },
      { path: routePaths.sso },
      { path: routePaths.forbidden },
      { path: routePaths.notFound },
      { path: routePaths.root },
      { pathIncludes: '/redirect' },
      { pathIncludes: '/error' },
      {
        test: (route) => isHiddenTagRoute(route)
      }
    ]
  });
}
