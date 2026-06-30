import type { App } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import {
  type BackendAdapter,
  createCore,
  createStaticMenusFromRoutes,
  type ObAuthMode,
  type MenuMode
} from '@one-base-template/core';
import { obConfirm } from '@one-base-template/ui';

import { homeFallback, sso, theme, ui } from '../config';

export function installCore(
  app: App,
  params: {
    adapter: BackendAdapter;
    authMode: ObAuthMode;
    tokenKey: string;
    menuMode: MenuMode;
    routes: RouteRecordRaw[];
    storageNamespace: string;
    defaultSystemCode?: string;
    systemHomeMap: Record<string, string>;
  }
) {
  const {
    adapter,
    authMode,
    tokenKey,
    menuMode,
    routes,
    storageNamespace,
    defaultSystemCode,
    systemHomeMap
  } = params;

  const staticMenus =
    menuMode === 'static' ? createStaticMenusFromRoutes(routes, { rootPath: '/' }) : undefined;

  app.use(
    createCore({
      storageNamespace,
      adapter,
      auth: {
        mode: authMode,
        tokenKey
      },
      menuMode,
      staticMenus,
      sso,
      theme: {
        ...theme,
        storageNamespace
      },
      layout: {
        defaultMode: ui.layout.mode,
        systemSwitchStyle: ui.layout.systemSwitchStyle,
        topbarHeight: ui.layout.topbarHeight,
        sidebarWidth: ui.layout.sidebarWidth,
        sidebarCollapsedWidth: ui.layout.sidebarCollapsedWidth,
        persist: true
      },
      systems: {
        defaultCode: defaultSystemCode,
        homeMap: systemHomeMap,
        fallbackHome: homeFallback
      },
      hooks: {
        tableConfirmAdapter: {
          warn: async (message, title, options) => obConfirm.warn(message, title, options),
          prompt: async (message, title, options) => obConfirm.prompt(message, title, options)
        }
      }
    })
  );
}
