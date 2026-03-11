import type { App } from "vue";
import type { RouteRecordRaw } from "vue-router";
import {
  type BackendAdapter,
  createCore,
  createStaticMenusFromRoutes,
  type LayoutMode,
  type MenuMode,
  type SystemSwitchStyle,
} from "@one-base-template/core";
import { obConfirm } from "@one-base-template/ui";

import { appSsoOptions, appThemeOptions, createSystemsOptions } from "../config";

export function installCore(
  app: App,
  params: {
    adapter: BackendAdapter;
    menuMode: MenuMode;
    routes: RouteRecordRaw[];
    layoutMode: LayoutMode;
    systemSwitchStyle: SystemSwitchStyle;
    topbarHeight: number | string;
    sidebarWidth: number | string;
    sidebarCollapsedWidth: number | string;
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
    systemHomeMap,
  } = params;

  const staticMenus = menuMode === "static" ? createStaticMenusFromRoutes(routes, { rootPath: "/" }) : undefined;

  app.use(
    createCore({
      storageNamespace,
      adapter,
      menuMode,
      staticMenus,
      sso: appSsoOptions,
      theme: {
        ...appThemeOptions,
        storageNamespace,
      },
      layout: {
        defaultMode: layoutMode,
        systemSwitchStyle,
        topbarHeight,
        sidebarWidth,
        sidebarCollapsedWidth,
        persist: true,
      },
      systems: createSystemsOptions({
        defaultCode: defaultSystemCode,
        homeMap: systemHomeMap,
      }),
      hooks: {
        tableConfirmAdapter: {
          warn: async (message, title, options) => obConfirm.warn(message, title, options),
          prompt: async (message, title, options) => obConfirm.prompt(message, title, options),
        },
      },
    })
  );
}
