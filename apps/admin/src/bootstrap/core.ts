import type { App } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { createCore, createStaticMenusFromRoutes, type BackendAdapter, type LayoutMode, type MenuMode, type SystemSwitchStyle } from '@one-base-template/core';

import { appSsoOptions, appThemeOptions, createSystemsOptions } from '../config';

export function installCore(
  app: App,
  params: {
    adapter: BackendAdapter;
    menuMode: MenuMode;
    routes: RouteRecordRaw[];
    layoutMode: LayoutMode;
    systemSwitchStyle: SystemSwitchStyle;
    defaultSystemCode?: string;
    systemHomeMap: Record<string, string>;
  }
) {
  const { adapter, menuMode, routes, layoutMode, systemSwitchStyle, defaultSystemCode, systemHomeMap } = params;

  const staticMenus =
    menuMode === 'static'
      ? createStaticMenusFromRoutes(routes, { rootPath: '/' })
      : undefined;

  app.use(
    createCore({
      adapter,
      menuMode,
      staticMenus,
      sso: appSsoOptions,
      theme: appThemeOptions,
      layout: {
        defaultMode: layoutMode,
        systemSwitchStyle,
        persist: true
      },
      systems: createSystemsOptions({
        defaultCode: defaultSystemCode,
        homeMap: systemHomeMap
      })
    })
  );
}
