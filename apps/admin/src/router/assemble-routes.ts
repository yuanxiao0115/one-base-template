import type { RouteRecordRaw } from "vue-router";
import { getInitialPath } from "@one-base-template/core";
import { AdminLayout, ForbiddenPage, NotFoundPage } from "@one-base-template/ui/shell";
import { DEFAULT_FALLBACK_HOME } from "../config/systems";
import type { AppRouteAssemblyOptions, AppRouteAssemblyResult } from "./types";
import { createRouteAssemblyValidator } from "./route-assembly-validator";
import { collectCompatAliasRoutes, collectModuleRoutes } from "./route-assembly-builder";

import { getEnabledModules } from "./registry";
import {
  APP_FORBIDDEN_ROUTE_PATH,
  APP_LOGIN_ROUTE_PATH,
  APP_NOT_FOUND_CATCHALL_PATH,
  APP_NOT_FOUND_ROUTE_PATH,
  APP_ROOT_PATH,
  APP_SSO_ROUTE_PATH,
} from "./constants";

function getRootRedirect(options: Pick<AppRouteAssemblyOptions, "defaultSystemCode" | "systemHomeMap" | "storageNamespace">): string {
  const { defaultSystemCode, systemHomeMap, storageNamespace } = options;
  return getInitialPath({
    defaultSystemCode,
    systemHomeMap,
    storageNamespace,
    fallbackHome: DEFAULT_FALLBACK_HOME,
  });
}

export async function getAppRoutes(options: AppRouteAssemblyOptions): Promise<AppRouteAssemblyResult> {
  const modules = await getEnabledModules(options.enabledModules);
  const validator = createRouteAssemblyValidator({
    routeConflictPolicy: options.routeConflictPolicy,
  });

  const standaloneRoutes = collectModuleRoutes({
    modules,
    source: "standalone",
    validator,
  });

  const compatAliasRoutes = collectCompatAliasRoutes({
    modules,
    validator,
  });

  const layoutRoutes = collectModuleRoutes({
    modules,
    source: "layout",
    validator,
  });

  const routes: RouteRecordRaw[] = [
    ...standaloneRoutes,
    ...compatAliasRoutes,
    {
      path: APP_ROOT_PATH,
      component: AdminLayout,
      redirect: () => getRootRedirect(options),
      children: layoutRoutes,
    },
    {
      path: APP_LOGIN_ROUTE_PATH,
      name: "Login",
      component: async () => import("../pages/login/LoginPage.vue"),
      meta: {
        public: true,
        hiddenTab: true,
      },
    },
    {
      path: APP_SSO_ROUTE_PATH,
      name: "Sso",
      component: async () => import("../pages/sso/SsoCallbackPage.vue"),
      meta: {
        public: true,
        hiddenTab: true,
      },
    },
    {
      path: APP_FORBIDDEN_ROUTE_PATH,
      name: "Forbidden",
      component: ForbiddenPage,
      meta: {
        public: true,
        hiddenTab: true,
      },
    },
    {
      path: APP_NOT_FOUND_ROUTE_PATH,
      name: "NotFound",
      component: NotFoundPage,
      meta: {
        public: true,
        hiddenTab: true,
      },
    },
    {
      path: APP_NOT_FOUND_CATCHALL_PATH,
      // 通配 404 使用 replace，避免无效地址回退后再次命中通配造成历史栈污染。
      redirect: () => ({
        path: APP_NOT_FOUND_ROUTE_PATH,
        replace: true,
      }),
      meta: {
        public: true,
        hiddenTab: true,
      },
    },
  ];

  const skipMenuAuthRouteRules = validator.getSkipMenuAuthRouteRules();

  return {
    routes,
    skipMenuAuthRouteNames: skipMenuAuthRouteRules.map((item) => item.name),
    skipMenuAuthRouteRules,
  };
}
