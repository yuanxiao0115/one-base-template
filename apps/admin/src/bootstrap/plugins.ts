import type { App } from 'vue';
import type { Pinia } from 'pinia';
import type { Router } from 'vue-router';
import { OneUiObTablePlugin } from '@one-base-template/ui/obtable';
import OneTag from '@one-base-template/tag';

import { homeFallback, ui } from '../config';
import AdminTopBar from '../components/top/AdminTopBar.vue';

function isHiddenTagRoute(route: unknown): boolean {
  if (!route || typeof route !== 'object') {
    return false;
  }
  const { meta } = route as { meta?: Record<string, unknown> };
  return ui.tag.hiddenMetaKeys.some((metaKey) => Boolean(meta?.[metaKey]));
}

export function installAppShellPlugins(params: {
  app: App;
  pinia: Pinia;
  router: Router;
  storageNamespace: string;
}) {
  const { app, pinia, router, storageNamespace } = params;

  app.use(OneUiObTablePlugin, {
    prefix: ui.shell.prefix,
    aliases: ui.shell.aliases,
    crudContainer: {
      defaultContainer: ui.crud.container
    },
    table: ui.table,
    topBarComponent: AdminTopBar
  });

  app.use(OneTag, {
    pinia,
    router,
    homePath: homeFallback,
    homeTitle: ui.tag.homeTitle,
    storageType: ui.tag.storageType,
    storageKey: `${storageNamespace}:ob_tags`,
    ignoredRoutes: [
      ...ui.tag.ignoredRoutePaths.map((path) => ({ path })),
      ...ui.tag.ignoredRoutePathIncludes.map((pathIncludes) => ({ pathIncludes })),
      {
        test: (route) => isHiddenTagRoute(route)
      }
    ]
  });
}
