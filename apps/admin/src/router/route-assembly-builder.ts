import type { RouteRecordRaw } from "vue-router";
import { APP_ROOT_PATH } from "./constants";
import type { AdminModuleManifest, ModuleCompat } from "./types";
import type { RouteAssemblyValidator, RouteCollectContext, RouteSource } from "./route-assembly-validator";

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

export function collectModuleRoutes(params: {
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

export function collectCompatAliasRoutes(params: {
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
