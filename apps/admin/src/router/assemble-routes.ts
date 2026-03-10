import type { RouteRecordRaw } from "vue-router";
import { getInitialPath } from "@one-base-template/core";
import { AdminLayout, ForbiddenPage, NotFoundPage } from "@one-base-template/ui/shell";
import { DEFAULT_FALLBACK_HOME } from "../config/systems";
import { createAppLogger } from "@/shared/logger";
import type {
  AdminModuleManifest,
  AppRouteAssemblyOptions,
  AppRouteAssemblyResult,
  ModuleCompat,
} from "./types";
import { getSkipMenuAuthRouteName, isSkipMenuAuthRoute, toRouteNameKey } from "./skip-menu-auth";

import { getEnabledModules } from "./registry";
import {
  APP_FORBIDDEN_ROUTE_PATH,
  APP_LOGIN_ROUTE_PATH,
  APP_NOT_FOUND_CATCHALL_PATH,
  APP_NOT_FOUND_ROUTE_PATH,
  APP_RESERVED_ROUTE_NAMES,
  APP_RESERVED_ROUTE_PATHS,
  APP_ROOT_PATH,
  APP_SSO_ROUTE_PATH,
} from "./constants";

type RouteSource = "layout" | "standalone";

interface RouteCollectContext {
  source: RouteSource;
  moduleId: string;
  parentPath: string;
  usedPaths: Set<string>;
  usedNames: Set<string>;
  skipMenuAuthRouteNames: Set<string>;
}

const logger = createAppLogger("router/assemble");

function getNormalizedPath(path: string): string {
  if (!path) {
    return APP_ROOT_PATH;
  }
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.replace(/\/{2,}/g, "/");
}

function buildRoutePath(parentPath: string, currentPath: string): string {
  if (!currentPath) {
    return getNormalizedPath(parentPath || APP_ROOT_PATH);
  }
  if (currentPath.startsWith("/")) {
    return getNormalizedPath(currentPath);
  }
  if (!parentPath || parentPath === APP_ROOT_PATH) {
    return getNormalizedPath(currentPath);
  }
  return getNormalizedPath(`${parentPath}/${currentPath}`);
}

function shouldSkipRoute(route: RouteRecordRaw, fullPath: string, context: RouteCollectContext): boolean {
  const sourceLabel = context.source === "layout" ? "layout" : "standalone";
  const moduleLabel = context.moduleId;

  if (APP_RESERVED_ROUTE_PATHS.has(fullPath)) {
    logger.warn(`模块路由占用了保留 path：${fullPath}（module=${moduleLabel} source=${sourceLabel}），已跳过。`);
    return true;
  }

  if (context.usedPaths.has(fullPath)) {
    logger.warn(`检测到重复 path：${fullPath}（module=${moduleLabel} source=${sourceLabel}），已跳过后出现的定义。`);
    return true;
  }

  const nameKey = toRouteNameKey(route.name);
  if (!nameKey) {
    return false;
  }

  if (APP_RESERVED_ROUTE_NAMES.has(nameKey)) {
    logger.warn(`模块路由占用了保留 name：${nameKey}（module=${moduleLabel} source=${sourceLabel}），已跳过。`);
    return true;
  }

  if (context.usedNames.has(nameKey)) {
    logger.warn(`检测到重复 name：${nameKey}（module=${moduleLabel} source=${sourceLabel}），已跳过后出现的定义。`);
    return true;
  }

  return false;
}

function buildModuleRoutes(routes: RouteRecordRaw[], context: RouteCollectContext): RouteRecordRaw[] {
  const out: RouteRecordRaw[] = [];

  for (const route of routes) {
    const fullPath = buildRoutePath(context.parentPath, route.path);
    if (shouldSkipRoute(route, fullPath, context)) {
      continue;
    }

    context.usedPaths.add(fullPath);
    const nameKey = toRouteNameKey(route.name);
    if (nameKey) {
      context.usedNames.add(nameKey);
    }

    const skipMenuAuthRouteName = getSkipMenuAuthRouteName(route);
    if (isSkipMenuAuthRoute(route) && skipMenuAuthRouteName === null) {
      logger.warn(
        `skipMenuAuth 路由缺少 name：${fullPath}（module=${context.moduleId} source=${context.source}），该路由不会加入守卫白名单。`
      );
    }
    if (skipMenuAuthRouteName !== null) {
      context.skipMenuAuthRouteNames.add(skipMenuAuthRouteName);
    }

    const nextRoute: RouteRecordRaw = { ...route };
    if (Array.isArray(route.children) && route.children.length > 0) {
      nextRoute.children = buildModuleRoutes(route.children, {
        ...context,
        parentPath: fullPath,
      });
    }

    out.push(nextRoute);
  }

  return out;
}

function applyActivePathCompat(params: {
  routes: RouteRecordRaw[];
  source: RouteSource;
  moduleId: string;
  parentPath: string;
  activePathMap?: Record<string, string>;
}): RouteRecordRaw[] {
  const { routes, source, moduleId, parentPath, activePathMap } = params;
  if (!activePathMap || Object.keys(activePathMap).length === 0) {
    return routes;
  }

  const out: RouteRecordRaw[] = [];
  for (const route of routes) {
    const fullPath = buildRoutePath(parentPath, route.path);
    const compatActivePath = activePathMap[fullPath];
    const nextRoute: RouteRecordRaw = { ...route };

    if (compatActivePath !== undefined) {
      const meta = (route.meta as Record<string, unknown> | undefined) ?? {};
      if (meta.activePath === undefined) {
        nextRoute.meta = {
          ...meta,
          activePath: compatActivePath,
        };
      } else if (meta.activePath !== compatActivePath) {
        logger.warn(
          `compat.activePathMap 与路由 meta.activePath 冲突：${fullPath}（module=${moduleId} source=${source}），已保留路由声明值。`
        );
      }
    }

    if (Array.isArray(route.children) && route.children.length > 0) {
      nextRoute.children = applyActivePathCompat({
        routes: route.children,
        source,
        moduleId,
        parentPath: fullPath,
        activePathMap,
      });
    }

    out.push(nextRoute);
  }

  return out;
}

function collectModuleRoutes(params: {
  modules: AdminModuleManifest[];
  source: RouteSource;
  usedPaths: Set<string>;
  usedNames: Set<string>;
  skipMenuAuthRouteNames: Set<string>;
}): RouteRecordRaw[] {
  const { modules, source, usedPaths, usedNames, skipMenuAuthRouteNames } = params;
  const out: RouteRecordRaw[] = [];

  for (const module of modules) {
    const moduleRoutes = source === "layout" ? module.routes.layout : (module.routes.standalone ?? []);
    const compatRoutes = applyActivePathCompat({
      routes: moduleRoutes,
      source,
      moduleId: module.id,
      parentPath: APP_ROOT_PATH,
      activePathMap: module.compat?.activePathMap,
    });

    out.push(
      ...buildModuleRoutes(compatRoutes, {
        source,
        moduleId: module.id,
        parentPath: APP_ROOT_PATH,
        usedPaths,
        usedNames,
        skipMenuAuthRouteNames,
      })
    );
  }

  return out;
}

function collectCompatAliasRoutes(params: {
  modules: AdminModuleManifest[];
  usedPaths: Set<string>;
}): RouteRecordRaw[] {
  const { modules, usedPaths } = params;
  const out: RouteRecordRaw[] = [];

  for (const module of modules) {
    const routeAliases = module.compat?.routeAliases;
    if (!routeAliases || routeAliases.length === 0) {
      continue;
    }

    out.push(
      ...buildModuleCompatAliasRoutes({
        moduleId: module.id,
        compat: module.compat,
        usedPaths,
      })
    );
  }

  return out;
}

function buildModuleCompatAliasRoutes(params: {
  moduleId: string;
  compat?: ModuleCompat;
  usedPaths: Set<string>;
}): RouteRecordRaw[] {
  const { moduleId, compat, usedPaths } = params;
  const routeAliases = compat?.routeAliases;
  if (!routeAliases || routeAliases.length === 0) {
    return [];
  }

  const out: RouteRecordRaw[] = [];
  for (const alias of routeAliases) {
    const fromPath = getNormalizedPath(alias.from);
    const toPath = getNormalizedPath(alias.to);

    if (!(alias.from && alias.to)) {
      logger.warn(`compat.routeAliases 含空路径配置（module=${moduleId}），已跳过。`);
      continue;
    }

    if (fromPath === toPath) {
      logger.warn(`compat.routeAliases from/to 相同：${fromPath}（module=${moduleId}），已跳过。`);
      continue;
    }

    if (APP_RESERVED_ROUTE_PATHS.has(fromPath)) {
      logger.warn(`compat.routeAliases 使用保留路径：${fromPath}（module=${moduleId}），已跳过。`);
      continue;
    }

    if (usedPaths.has(fromPath)) {
      logger.warn(`compat.routeAliases 路径与已装配路由冲突：${fromPath}（module=${moduleId}），已跳过。`);
      continue;
    }

    usedPaths.add(fromPath);
    const aliasActivePath = compat?.activePathMap?.[fromPath] ?? compat?.activePathMap?.[toPath];
    out.push({
      path: fromPath,
      redirect: toPath,
      meta: {
        hideInMenu: true,
        hiddenTab: true,
        ...(aliasActivePath ? { activePath: aliasActivePath } : {}),
      },
    });
  }

  return out;
}

function getRootRedirect(options: Pick<AppRouteAssemblyOptions, "defaultSystemCode" | "systemHomeMap" | "storageNamespace">): string {
  const { defaultSystemCode, systemHomeMap, storageNamespace } = options;
  return getInitialPath({
    defaultSystemCode,
    systemHomeMap,
    storageNamespace,
    fallbackHome: DEFAULT_FALLBACK_HOME,
  });
}

export function getAppRoutes(options: AppRouteAssemblyOptions): AppRouteAssemblyResult {
  const modules = getEnabledModules(options.enabledModules);
  const usedPaths = new Set<string>();
  const usedNames = new Set<string>();
  const skipMenuAuthRouteNames = new Set<string>();

  const standaloneRoutes = collectModuleRoutes({
    modules,
    source: "standalone",
    usedPaths,
    usedNames,
    skipMenuAuthRouteNames,
  });

  const compatAliasRoutes = collectCompatAliasRoutes({
    modules,
    usedPaths,
  });

  const layoutRoutes = collectModuleRoutes({
    modules,
    source: "layout",
    usedPaths,
    usedNames,
    skipMenuAuthRouteNames,
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

  return {
    routes,
    skipMenuAuthRouteNames: [...skipMenuAuthRouteNames],
  };
}
