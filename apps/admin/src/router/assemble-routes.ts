import type { RouteRecordRaw } from "vue-router";
import { getInitialPath } from "@one-base-template/core";
import { AdminLayout, ForbiddenPage, NotFoundPage } from "@one-base-template/ui/shell";
import { DEFAULT_FALLBACK_HOME } from "../config/systems";
import type {
  AdminModuleManifest,
  AppRouteAssemblyOptions,
  AppRouteAssemblyResult,
  ModuleCompat,
} from "./types";
import {
  createRouteAssemblyValidator,
  type RouteAssemblyValidator,
  type RouteCollectContext,
  type RouteSource,
} from "./route-assembly-validator";

import { getEnabledModules } from "./registry";
import {
  APP_FORBIDDEN_ROUTE_PATH,
  APP_LOGIN_ROUTE_PATH,
  APP_NOT_FOUND_CATCHALL_PATH,
  APP_NOT_FOUND_ROUTE_PATH,
  APP_ROOT_PATH,
  APP_SSO_ROUTE_PATH,
} from "./constants";

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

function buildModuleRoutes(params: {
  routes: RouteRecordRaw[];
  context: RouteCollectContext;
  validator: RouteAssemblyValidator;
}): RouteRecordRaw[] {
  const { routes, context, validator } = params;
  const out: RouteRecordRaw[] = [];

  for (const route of routes) {
    const fullPath = buildRoutePath(context.parentPath, route.path);
    if (validator.shouldSkipRoute(route, fullPath, context)) {
      continue;
    }

    validator.registerRoute(route, fullPath, context);

    const nextRoute: RouteRecordRaw = { ...route };
    if (Array.isArray(route.children) && route.children.length > 0) {
      nextRoute.children = buildModuleRoutes({
        routes: route.children,
        context: {
          ...context,
          parentPath: fullPath,
        },
        validator,
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
  validator: RouteAssemblyValidator;
  activePathMap?: Record<string, string>;
}): RouteRecordRaw[] {
  const { routes, source, moduleId, parentPath, validator, activePathMap } = params;
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
        validator.warn(
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
        validator,
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
  validator: RouteAssemblyValidator;
}): RouteRecordRaw[] {
  const { modules, source, validator } = params;
  const out: RouteRecordRaw[] = [];

  for (const module of modules) {
    const moduleRoutes = source === "layout" ? module.routes.layout : (module.routes.standalone ?? []);
    const compatRoutes = applyActivePathCompat({
      routes: moduleRoutes,
      source,
      moduleId: module.id,
      parentPath: APP_ROOT_PATH,
      validator,
      activePathMap: module.compat?.activePathMap,
    });

    out.push(
      ...buildModuleRoutes({
        routes: compatRoutes,
        context: {
          source,
          moduleId: module.id,
          parentPath: APP_ROOT_PATH,
        },
        validator,
      })
    );
  }

  return out;
}

function collectCompatAliasRoutes(params: {
  modules: AdminModuleManifest[];
  validator: RouteAssemblyValidator;
}): RouteRecordRaw[] {
  const { modules, validator } = params;
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
        validator,
      })
    );
  }

  return out;
}

function buildModuleCompatAliasRoutes(params: {
  moduleId: string;
  compat?: ModuleCompat;
  validator: RouteAssemblyValidator;
}): RouteRecordRaw[] {
  const { moduleId, compat, validator } = params;
  const routeAliases = compat?.routeAliases;
  if (!routeAliases || routeAliases.length === 0) {
    return [];
  }

  const out: RouteRecordRaw[] = [];
  for (const alias of routeAliases) {
    const fromPath = getNormalizedPath(alias.from);
    const toPath = getNormalizedPath(alias.to);

    if (!(alias.from && alias.to)) {
      validator.warn(`compat.routeAliases 含空路径配置（module=${moduleId}），已跳过。`);
      continue;
    }

    if (fromPath === toPath) {
      validator.warn(`compat.routeAliases from/to 相同：${fromPath}（module=${moduleId}），已跳过。`);
      continue;
    }

    if (validator.shouldSkipAliasPath(fromPath, moduleId)) {
      continue;
    }

    validator.registerAliasPath(fromPath);
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
