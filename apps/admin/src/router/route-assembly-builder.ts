import type { RouteRecordRaw } from "vue-router";
import { buildRouteFullPath, normalizeRoutePath } from "@one-base-template/core";
import { APP_ROOT_PATH } from "./constants";
import type { AdminModuleManifest, ModuleCompat } from "./types";
import type { RouteAssemblyValidator, RouteCollectContext, RouteSource } from "./route-assembly-validator";
import { createCompatAliasMeta } from "./route-meta";

function buildRouteTree(params: {
  routes: RouteRecordRaw[];
  context: RouteCollectContext;
  validator: RouteAssemblyValidator;
}): RouteRecordRaw[] {
  const { routes, context, validator } = params;
  const out: RouteRecordRaw[] = [];

  for (const route of routes) {
    const fullPath = buildRouteFullPath(context.parentPath, route.path, APP_ROOT_PATH);
    if (validator.hasConflict(route, fullPath, context)) {
      continue;
    }

    validator.saveRoute(route, fullPath, context);

    const nextRoute: RouteRecordRaw = { ...route };
    if (Array.isArray(route.children) && route.children.length > 0) {
      nextRoute.children = buildRouteTree({
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

function applyActivePathMap(params: {
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
    const fullPath = buildRouteFullPath(parentPath, route.path, APP_ROOT_PATH);
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
      nextRoute.children = applyActivePathMap({
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

function buildModuleAliasRoutes(params: {
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
    const fromPath = normalizeRoutePath(alias.from, APP_ROOT_PATH);
    const toPath = normalizeRoutePath(alias.to, APP_ROOT_PATH);

    if (!(alias.from && alias.to)) {
      validator.warn(`compat.routeAliases 含空路径配置（module=${moduleId}），已跳过。`);
      continue;
    }

    if (fromPath === toPath) {
      validator.warn(`compat.routeAliases from/to 相同：${fromPath}（module=${moduleId}），已跳过。`);
      continue;
    }

    if (validator.hasAliasConflict(fromPath, moduleId)) {
      continue;
    }

    validator.saveAliasPath(fromPath);
    const aliasActivePath = compat?.activePathMap?.[fromPath] ?? compat?.activePathMap?.[toPath];
    out.push({
      path: fromPath,
      redirect: toPath,
      meta: createCompatAliasMeta(aliasActivePath),
    });
  }

  return out;
}

export function buildRoutes(params: {
  modules: AdminModuleManifest[];
  source: RouteSource;
  validator: RouteAssemblyValidator;
}): RouteRecordRaw[] {
  const { modules, source, validator } = params;
  const out: RouteRecordRaw[] = [];

  for (const module of modules) {
    // 约定：全屏/不走 Layout 的页面应由业务模块声明在 routes.standalone，
    // 装配层仅做收集与校验，不在 router 层集中维护业务全屏路由明细。
    const moduleRoutes = source === "layout" ? module.routes.layout : (module.routes.standalone ?? []);
    // 先应用兼容 activePath，再进行冲突校验，确保校验基于最终路由语义。
    const compatRoutes = applyActivePathMap({
      routes: moduleRoutes,
      source,
      moduleId: module.id,
      parentPath: APP_ROOT_PATH,
      validator,
      activePathMap: module.compat?.activePathMap,
    });

    out.push(
      ...buildRouteTree({
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

export function buildAliasRoutes(params: {
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
      ...buildModuleAliasRoutes({
        moduleId: module.id,
        compat: module.compat,
        validator,
      })
    );
  }

  return out;
}
