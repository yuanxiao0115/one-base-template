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
    topbarHeight: string | number;
    sidebarWidth: string | number;
    sidebarCollapsedWidth: string | number;
    storageNamespace: string;
    defaultSystemCode?: string;
    systemHomeMap: Record<string, string>;
  }
) {
  const {
    adapter,
    menuMode,
    routes,
    layoutMode,
    systemSwitchStyle,
    topbarHeight,
    sidebarWidth,
    sidebarCollapsedWidth,
    storageNamespace,
    defaultSystemCode,
    systemHomeMap
  } = params;

  const staticMenus =
    menuMode === 'static'
      ? createStaticMenusFromRoutes(routes, { rootPath: '/' })
      : undefined;

  app.use(
    createCore({
      storageNamespace,
      adapter,
      menuMode,
      staticMenus,
      sso: appSsoOptions,
      theme: {
        ...appThemeOptions,
        storageNamespace
      },
      layout: {
        defaultMode: layoutMode,
        systemSwitchStyle,
        topbarHeight,
        sidebarWidth,
        sidebarCollapsedWidth,
        persist: true
      },
      systems: createSystemsOptions({
        defaultCode: defaultSystemCode,
        homeMap: systemHomeMap
      })
    })
  );
}
