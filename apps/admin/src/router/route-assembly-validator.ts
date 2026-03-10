import type { RouteRecordRaw } from "vue-router";
import { createAppLogger } from "@/shared/logger";
import { APP_RESERVED_ROUTE_NAMES, APP_RESERVED_ROUTE_PATHS } from "./constants";
import { getSkipMenuAuthRouteRule, isSkipMenuAuthRoute, toRouteNameKey } from "./skip-menu-auth";
import type { RouteConflictPolicy, SkipMenuAuthLevel, SkipMenuAuthRouteRule } from "./types";

export type RouteSource = "layout" | "standalone";

export interface RouteCollectContext {
  source: RouteSource;
  moduleId: string;
  parentPath: string;
}

export interface RouteAssemblyValidator {
  shouldSkipRoute(route: RouteRecordRaw, fullPath: string, context: RouteCollectContext): boolean;
  registerRoute(route: RouteRecordRaw, fullPath: string, context: RouteCollectContext): void;
  shouldSkipAliasPath(path: string, moduleId: string): boolean;
  registerAliasPath(path: string): void;
  getSkipMenuAuthRouteNames(): string[];
  getSkipMenuAuthRouteRules(): SkipMenuAuthRouteRule[];
  warn(message: string): void;
}

function getSourceLabel(source: RouteSource): string {
  return source === "layout" ? "layout" : "standalone";
}

function getSkipMessageByPathConflict(params: { fullPath: string; context: RouteCollectContext }): string | null {
  const { fullPath, context } = params;
  const sourceLabel = getSourceLabel(context.source);

  if (APP_RESERVED_ROUTE_PATHS.has(fullPath)) {
    return `模块路由占用了保留 path：${fullPath}（module=${context.moduleId} source=${sourceLabel}），已跳过。`;
  }
  return null;
}

function getSkipMessageByNameConflict(params: { route: RouteRecordRaw; context: RouteCollectContext }): string | null {
  const { route, context } = params;
  const nameKey = toRouteNameKey(route.name);
  if (!nameKey) {
    return null;
  }

  const sourceLabel = getSourceLabel(context.source);
  if (APP_RESERVED_ROUTE_NAMES.has(nameKey)) {
    return `模块路由占用了保留 name：${nameKey}（module=${context.moduleId} source=${sourceLabel}），已跳过。`;
  }

  return null;
}

export function createRouteAssemblyValidator(params: { routeConflictPolicy?: RouteConflictPolicy }): RouteAssemblyValidator {
  const logger = createAppLogger("router/assemble");
  const routeConflictPolicy = params.routeConflictPolicy ?? "warn";
  const usedPaths = new Set<string>();
  const usedNames = new Set<string>();
  const skipMenuAuthRoutes = new Map<string, SkipMenuAuthLevel>();

  function reportConflict(message: string) {
    if (routeConflictPolicy === "fail-fast") {
      throw new Error(`[router/assemble] ${message}`);
    }
    logger.warn(message);
  }

  function shouldSkipRoute(route: RouteRecordRaw, fullPath: string, context: RouteCollectContext): boolean {
    const reservedPathMessage = getSkipMessageByPathConflict({
      fullPath,
      context,
    });
    if (reservedPathMessage) {
      reportConflict(reservedPathMessage);
      return true;
    }

    if (usedPaths.has(fullPath)) {
      reportConflict(
        `检测到重复 path：${fullPath}（module=${context.moduleId} source=${getSourceLabel(context.source)}），已跳过后出现的定义。`
      );
      return true;
    }

    const reservedNameMessage = getSkipMessageByNameConflict({
      route,
      context,
    });
    if (reservedNameMessage) {
      reportConflict(reservedNameMessage);
      return true;
    }

    const nameKey = toRouteNameKey(route.name);
    if (nameKey && usedNames.has(nameKey)) {
      reportConflict(
        `检测到重复 name：${nameKey}（module=${context.moduleId} source=${getSourceLabel(context.source)}），已跳过后出现的定义。`
      );
      return true;
    }

    return false;
  }

  function registerRoute(route: RouteRecordRaw, fullPath: string, context: RouteCollectContext) {
    usedPaths.add(fullPath);
    const nameKey = toRouteNameKey(route.name);
    if (nameKey) {
      usedNames.add(nameKey);
    }

    const skipMenuAuthRouteRule = getSkipMenuAuthRouteRule(route);
    if (isSkipMenuAuthRoute(route) && skipMenuAuthRouteRule === null) {
      logger.warn(
        `skipMenuAuth 路由缺少 name：${fullPath}（module=${context.moduleId} source=${context.source}），该路由不会加入守卫白名单。`
      );
    }
    if (skipMenuAuthRouteRule !== null) {
      skipMenuAuthRoutes.set(skipMenuAuthRouteRule.name, skipMenuAuthRouteRule.level);
    }
  }

  function shouldSkipAliasPath(path: string, moduleId: string): boolean {
    if (APP_RESERVED_ROUTE_PATHS.has(path)) {
      reportConflict(`compat.routeAliases 使用保留路径：${path}（module=${moduleId}），已跳过。`);
      return true;
    }

    if (usedPaths.has(path)) {
      reportConflict(`compat.routeAliases 路径与已装配路由冲突：${path}（module=${moduleId}），已跳过。`);
      return true;
    }

    return false;
  }

  return {
    shouldSkipRoute,
    registerRoute,
    shouldSkipAliasPath,
    registerAliasPath(path: string) {
      usedPaths.add(path);
    },
    getSkipMenuAuthRouteNames() {
      return [...skipMenuAuthRoutes.keys()];
    },
    getSkipMenuAuthRouteRules() {
      return [...skipMenuAuthRoutes.entries()].map(([name, level]) => ({
        name,
        level,
      }));
    },
    warn(message: string) {
      logger.warn(message);
    },
  };
}
