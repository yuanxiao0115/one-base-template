import type { App } from "vue";
import type { Pinia } from "pinia";
import type { Router } from "vue-router";
import { OneUiPlugin } from "@one-base-template/ui";
import OneTag from "@one-base-template/tag";

import { getAppEnv } from "../infra/env";
import { appCrudContainerDefaultType, appTableDefaults } from "../config";
import { DEFAULT_FALLBACK_HOME } from "../config/systems";
import {
  APP_FORBIDDEN_ROUTE_PATH,
  APP_LOGIN_ROUTE_PATH,
  APP_NOT_FOUND_ROUTE_PATH,
  APP_ROOT_PATH,
  APP_SSO_ROUTE_PATH,
} from "../router/constants";

function isHiddenTagRoute(route: unknown): boolean {
  if (!route || typeof route !== "object") {
    return false;
  }
  const { meta } = route as { meta?: Record<string, unknown> };
  return Boolean(meta?.hiddenTab || meta?.noTag);
}

export function installAppShellPlugins(params: { app: App; pinia: Pinia; router: Router }) {
  const { app, pinia, router } = params;
  const appEnv = getAppEnv();

  // 全局注册 @one-base-template/ui 组件，仅使用 Ob 前缀组件名（如 ObPageContainer / ObTableBox）。
  app.use(OneUiPlugin, {
    prefix: "Ob",
    aliases: false,
    crudContainer: {
      defaultContainer: appCrudContainerDefaultType,
    },
    table: appTableDefaults,
  });

  app.use(OneTag, {
    pinia,
    router,
    homePath: DEFAULT_FALLBACK_HOME,
    homeTitle: "首页",
    storageType: "session",
    storageKey: `${appEnv.storageNamespace}:ob_tags`,
    ignoredRoutes: [
      { path: APP_LOGIN_ROUTE_PATH },
      { path: APP_SSO_ROUTE_PATH },
      { path: APP_FORBIDDEN_ROUTE_PATH },
      { path: APP_NOT_FOUND_ROUTE_PATH },
      { path: APP_ROOT_PATH },
      { pathIncludes: "/redirect" },
      { pathIncludes: "/error" },
      {
        test: (route) => isHiddenTagRoute(route),
      },
    ],
  });
}
