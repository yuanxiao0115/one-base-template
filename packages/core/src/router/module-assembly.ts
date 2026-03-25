import type { RouteRecordRaw } from 'vue-router';
import { buildRouteFullPath, normalizeRoutePath, toRouteNameKey } from './route-utils';

export type ModuleTier = 'core' | 'optional';

export interface AppModuleManifestMeta {
  id: string;
  version: '1';
  moduleTier: ModuleTier;
  enabledByDefault: boolean;
}

export interface RouteAlias {
  from: string;
  to: string;
}

export interface ModuleCompat {
  routeAliases?: RouteAlias[];
  activePathMap?: Record<string, string>;
}

export interface RouteAssemblyModule {
  id: string;
  routes: {
    layout: RouteRecordRaw[];
    standalone?: RouteRecordRaw[];
  };
  compat?: ModuleCompat;
}

interface AppModuleManifestBase extends AppModuleManifestMeta, RouteAssemblyModule {
  apiNamespace: string;
}

export type CoreAppModuleManifest = AppModuleManifestBase & {
  moduleTier: 'core';
  enabledByDefault: boolean;
};

export type OptionalAppModuleManifest = AppModuleManifestBase & {
  moduleTier: 'optional';
  enabledByDefault: false;
};

export type AppModuleManifest = CoreAppModuleManifest | OptionalAppModuleManifest;

export type AppModuleDeclarationModule = {
  default?: AppModuleManifest;
  module?: AppModuleManifest;
};

export type RouteSource = 'layout' | 'standalone';

export interface RouteCollectContext {
  source: RouteSource;
  moduleId: string;
  parentPath: string;
}

export interface RouteAssemblyValidator {
  hasConflict(route: RouteRecordRaw, fullPath: string, context: RouteCollectContext): boolean;
  saveRoute(route: RouteRecordRaw, fullPath: string, context: RouteCollectContext): void;
  hasAliasConflict(path: string, moduleId: string): boolean;
  saveAliasPath(path: string): void;
  warn(message: string): void;
}

export interface CreateModuleRouteAssemblyValidatorOptions {
  reservedRoutePaths: ReadonlySet<string>;
  reservedRouteNames: ReadonlySet<string>;
  onWarn: (message: string) => void;
  getRouteNameKey?: (name: RouteRecordRaw['name']) => string | null;
}

export interface BuildModuleRoutesOptions<TModule extends RouteAssemblyModule> {
  modules: TModule[];
  source: RouteSource;
  validator: RouteAssemblyValidator;
  rootPath?: string;
}

export interface BuildModuleAliasRoutesOptions<TModule extends RouteAssemblyModule> {
  modules: TModule[];
  validator: RouteAssemblyValidator;
  rootPath?: string;
}

function getSourceLabel(source: RouteSource): string {
  return source === 'layout' ? 'layout' : 'standalone';
}

export function createModuleRouteAssemblyValidator(
  options: CreateModuleRouteAssemblyValidatorOptions
): RouteAssemblyValidator {
  const {
    reservedRoutePaths,
    reservedRouteNames,
    onWarn,
    getRouteNameKey = toRouteNameKey
  } = options;
  const usedPaths = new Set<string>();
  const usedNames = new Set<string>();

  function getRouteName(name: RouteRecordRaw['name']): string | null {
    return getRouteNameKey(name);
  }

  function reportConflict(message: string) {
    onWarn(message);
  }

  function hasConflict(
    route: RouteRecordRaw,
    fullPath: string,
    context: RouteCollectContext
  ): boolean {
    const sourceLabel = getSourceLabel(context.source);

    if (reservedRoutePaths.has(fullPath)) {
      reportConflict(
        `模块路由占用了保留 path：${fullPath}（module=${context.moduleId} source=${sourceLabel}），已跳过。`
      );
      return true;
    }

    if (usedPaths.has(fullPath)) {
      reportConflict(
        `检测到重复 path：${fullPath}（module=${context.moduleId} source=${sourceLabel}），已跳过后出现的定义。`
      );
      return true;
    }

    const nameKey = getRouteName(route.name);
    if (nameKey && reservedRouteNames.has(nameKey)) {
      reportConflict(
        `模块路由占用了保留 name：${nameKey}（module=${context.moduleId} source=${sourceLabel}），已跳过。`
      );
      return true;
    }

    if (nameKey && usedNames.has(nameKey)) {
      reportConflict(
        `检测到重复 name：${nameKey}（module=${context.moduleId} source=${sourceLabel}），已跳过后出现的定义。`
      );
      return true;
    }

    return false;
  }

  function saveRoute(route: RouteRecordRaw, fullPath: string) {
    usedPaths.add(fullPath);
    const routeName = getRouteName(route.name);
    if (routeName) {
      usedNames.add(routeName);
    }
  }

  function hasAliasConflict(path: string, moduleId: string): boolean {
    if (reservedRoutePaths.has(path)) {
      reportConflict(`compat.routeAliases 使用保留路径：${path}（module=${moduleId}），已跳过。`);
      return true;
    }

    if (usedPaths.has(path)) {
      reportConflict(
        `compat.routeAliases 路径与已装配路由冲突：${path}（module=${moduleId}），已跳过。`
      );
      return true;
    }

    return false;
  }

  return {
    hasConflict,
    saveRoute,
    hasAliasConflict,
    saveAliasPath(path: string) {
      usedPaths.add(path);
    },
    warn(message: string) {
      onWarn(message);
    }
  };
}

function buildRouteTree(params: {
  routes: RouteRecordRaw[];
  context: RouteCollectContext;
  validator: RouteAssemblyValidator;
  rootPath: string;
}): RouteRecordRaw[] {
  const { routes, context, validator, rootPath } = params;
  const out: RouteRecordRaw[] = [];

  for (const route of routes) {
    const fullPath = buildRouteFullPath(context.parentPath, route.path, rootPath);
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
          parentPath: fullPath
        },
        validator,
        rootPath
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
  rootPath: string;
  activePathMap?: Record<string, string>;
}): RouteRecordRaw[] {
  const { routes, source, moduleId, parentPath, validator, rootPath, activePathMap } = params;
  if (!activePathMap || Object.keys(activePathMap).length === 0) {
    return routes;
  }

  const out: RouteRecordRaw[] = [];
  for (const route of routes) {
    const fullPath = buildRouteFullPath(parentPath, route.path, rootPath);
    const compatActivePath = activePathMap[fullPath];
    const nextRoute: RouteRecordRaw = { ...route };

    if (compatActivePath !== undefined) {
      const meta = (route.meta as Record<string, unknown> | undefined) ?? {};
      if (meta.activePath === undefined) {
        nextRoute.meta = {
          ...meta,
          activePath: compatActivePath
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
        rootPath,
        activePathMap
      });
    }

    out.push(nextRoute);
  }

  return out;
}

function buildAliasRoutesByCompat(params: {
  moduleId: string;
  compat?: ModuleCompat;
  validator: RouteAssemblyValidator;
  rootPath: string;
}): RouteRecordRaw[] {
  const { moduleId, compat, validator, rootPath } = params;
  const routeAliases = compat?.routeAliases;
  if (!routeAliases || routeAliases.length === 0) {
    return [];
  }

  const out: RouteRecordRaw[] = [];
  for (const alias of routeAliases) {
    const fromPath = normalizeRoutePath(alias.from, rootPath);
    const toPath = normalizeRoutePath(alias.to, rootPath);

    if (!(alias.from && alias.to)) {
      validator.warn(`compat.routeAliases 含空路径配置（module=${moduleId}），已跳过。`);
      continue;
    }

    if (fromPath === toPath) {
      validator.warn(
        `compat.routeAliases from/to 相同：${fromPath}（module=${moduleId}），已跳过。`
      );
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
      meta: {
        hideInMenu: true,
        hiddenTab: true,
        ...(aliasActivePath ? { activePath: aliasActivePath } : {})
      }
    });
  }

  return out;
}

export function buildModuleRoutes<TModule extends RouteAssemblyModule>(
  options: BuildModuleRoutesOptions<TModule>
): RouteRecordRaw[] {
  const { modules, source, validator, rootPath = '/' } = options;
  const out: RouteRecordRaw[] = [];

  for (const module of modules) {
    const moduleRoutes =
      source === 'layout' ? module.routes.layout : (module.routes.standalone ?? []);
    const compatRoutes = applyActivePathMap({
      routes: moduleRoutes,
      source,
      moduleId: module.id,
      parentPath: rootPath,
      validator,
      rootPath,
      activePathMap: module.compat?.activePathMap
    });

    out.push(
      ...buildRouteTree({
        routes: compatRoutes,
        context: {
          source,
          moduleId: module.id,
          parentPath: rootPath
        },
        validator,
        rootPath
      })
    );
  }

  return out;
}

export function buildModuleAliasRoutes<TModule extends RouteAssemblyModule>(
  options: BuildModuleAliasRoutesOptions<TModule>
): RouteRecordRaw[] {
  const { modules, validator, rootPath = '/' } = options;
  const out: RouteRecordRaw[] = [];

  for (const module of modules) {
    const routeAliases = module.compat?.routeAliases;
    if (!routeAliases || routeAliases.length === 0) {
      continue;
    }

    out.push(
      ...buildAliasRoutesByCompat({
        moduleId: module.id,
        compat: module.compat,
        validator,
        rootPath
      })
    );
  }

  return out;
}
