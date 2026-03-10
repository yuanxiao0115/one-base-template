import type { RouteRecordRaw } from "vue-router";
import { getInitialPath } from "@one-base-template/core";
import { AdminLayout, ForbiddenPage, NotFoundPage } from "@one-base-template/ui/shell";
import { DEFAULT_FALLBACK_HOME } from "../config/systems";
import type { AppRouteAssemblyOptions, AppRouteAssemblyResult } from "./types";
import { createRouteAssemblyValidator } from "./route-assembly-validator";
import { buildAliasRoutes, buildRoutes } from "./route-assembly-builder";

import { getEnabledModules } from "./registry";
import {
  APP_FORBIDDEN_ROUTE_PATH,
  APP_LOGIN_ROUTE_PATH,
  APP_NOT_FOUND_CATCHALL_PATH,
  APP_NOT_FOUND_ROUTE_PATH,
  APP_ROOT_PATH,
  APP_SSO_ROUTE_PATH,
} from "./constants";

const PUBLIC_ROUTE_META = Object.freeze({
  public: true,
  hiddenTab: true,
});
type RouteComponent = Exclude<RouteRecordRaw["component"], null | undefined>;

function getDefaultHomePath(options: Pick<AppRouteAssemblyOptions, "defaultSystemCode" | "systemHomeMap" | "storageNamespace">): string {
  const { defaultSystemCode, systemHomeMap, storageNamespace } = options;
  return getInitialPath({
    defaultSystemCode,
    systemHomeMap,
    storageNamespace,
    fallbackHome: DEFAULT_FALLBACK_HOME,
  });
}

function createPublicRoute(path: string, name: string, component: RouteComponent): RouteRecordRaw {
  return {
    path,
    name,
    component,
    meta: PUBLIC_ROUTE_META,
  };
}

function createFixedRoutes(params: { layoutRoutes: RouteRecordRaw[]; defaultHomePath: string }): RouteRecordRaw[] {
  const { layoutRoutes, defaultHomePath } = params;
  return [
    {
      path: APP_ROOT_PATH,
      component: AdminLayout,
      redirect: () => defaultHomePath,
      children: layoutRoutes,
    },
    createPublicRoute(APP_LOGIN_ROUTE_PATH, "Login", async () => import("../pages/login/LoginPage.vue")),
    createPublicRoute(APP_SSO_ROUTE_PATH, "Sso", async () => import("../pages/sso/SsoCallbackPage.vue")),
    createPublicRoute(APP_FORBIDDEN_ROUTE_PATH, "Forbidden", ForbiddenPage),
    createPublicRoute(APP_NOT_FOUND_ROUTE_PATH, "NotFound", NotFoundPage),
    {
      path: APP_NOT_FOUND_CATCHALL_PATH,
      // 通配 404 使用 replace，避免无效地址回退后再次命中通配造成历史栈污染。
      redirect: () => ({
        path: APP_NOT_FOUND_ROUTE_PATH,
        replace: true,
      }),
      meta: PUBLIC_ROUTE_META,
    },
  ];
}

export async function assembleRoutes(options: AppRouteAssemblyOptions): Promise<AppRouteAssemblyResult> {
  const modules = await getEnabledModules(options.enabledModules);
  const validator = createRouteAssemblyValidator({
    routeConflictPolicy: options.routeConflictPolicy,
  });

  const standaloneRoutes = buildRoutes({
    modules,
    source: "standalone",
    validator,
  });

  const compatAliasRoutes = buildAliasRoutes({
    modules,
    validator,
  });

  const layoutRoutes = buildRoutes({
    modules,
    source: "layout",
    validator,
  });

  // 路由顺序保持“模块 standalone -> 历史 alias -> 固定公共路由”，与守卫白名单生成保持一致。
  const routes: RouteRecordRaw[] = [
    ...standaloneRoutes,
    ...compatAliasRoutes,
    ...createFixedRoutes({
      layoutRoutes,
      defaultHomePath: getDefaultHomePath(options),
    }),
  ];

  const skipMenuAuthRouteRules = validator.listSkipAuthRules();

  return {
    routes,
    skipMenuAuthRouteRules,
  };
}
