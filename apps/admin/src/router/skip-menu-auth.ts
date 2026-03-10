import type { RouteRecordRaw } from "vue-router";
import { createAppLogger } from "@/shared/logger";
import type { SkipMenuAuthLevel, SkipMenuAuthRouteRule } from "./types";

const SKIP_MENU_AUTH_LEVEL_SET = new Set<SkipMenuAuthLevel>(["stable", "allowlist", "dev-only"]);
const logger = createAppLogger("router/skip-menu-auth");

export function toRouteNameKey(name: RouteRecordRaw["name"]): string | null {
  if (typeof name === "string") {
    return name;
  }
  if (typeof name === "symbol") {
    return name.toString();
  }
  return null;
}

function isSkipMenuAuthLevel(level: unknown): level is SkipMenuAuthLevel {
  return typeof level === "string" && SKIP_MENU_AUTH_LEVEL_SET.has(level as SkipMenuAuthLevel);
}

function resolveSkipMenuAuthLevel(route: RouteRecordRaw): SkipMenuAuthLevel | null {
  const meta = route.meta as Record<string, unknown> | undefined;
  if (!meta) {
    return null;
  }

  const rawSkipMenuAuth = meta.skipMenuAuth;
  if (rawSkipMenuAuth == null || rawSkipMenuAuth === false) {
    return null;
  }

  const rawSkipMenuAuthLevel = meta.skipMenuAuthLevel;
  if (isSkipMenuAuthLevel(rawSkipMenuAuthLevel)) {
    return rawSkipMenuAuthLevel;
  }

  if (isSkipMenuAuthLevel(rawSkipMenuAuth)) {
    return rawSkipMenuAuth;
  }

  if (rawSkipMenuAuth === true) {
    return "stable";
  }

  return null;
}

export function isSkipMenuAuthRoute(route: RouteRecordRaw): boolean {
  return resolveSkipMenuAuthLevel(route) !== null;
}

export function getSkipMenuAuthRouteName(route: RouteRecordRaw): string | null {
  const rule = getSkipMenuAuthRouteRule(route);
  if (!rule) {
    return null;
  }
  return rule.name;
}

export function getSkipMenuAuthRouteRule(route: RouteRecordRaw): SkipMenuAuthRouteRule | null {
  const level = resolveSkipMenuAuthLevel(route);
  if (!level) {
    return null;
  }

  const name = toRouteNameKey(route.name);
  if (!name) {
    return null;
  }

  return {
    name,
    level,
  };
}

export function resolveSkipMenuAuthRouteNamesForGuard(params: {
  isProd: boolean;
  routeRules: SkipMenuAuthRouteRule[];
  productionAllowList: string[];
}): string[] {
  const { isProd, routeRules, productionAllowList } = params;
  const rulesByName = new Map(routeRules.map((rule) => [rule.name, rule]));
  const productionAllowSet = new Set(productionAllowList);

  for (const routeName of productionAllowSet) {
    if (!rulesByName.has(routeName)) {
      logger.warn(`生产白名单包含未知 skipMenuAuth 路由：${routeName}`);
    }
  }

  const out: string[] = [];
  for (const rule of routeRules) {
    if (rule.level === "stable") {
      out.push(rule.name);
      continue;
    }

    if (rule.level === "dev-only") {
      if (!isProd) {
        out.push(rule.name);
      } else {
        logger.warn(`生产环境禁用 dev-only skipMenuAuth 路由：${rule.name}`);
      }
      continue;
    }

    if (!isProd || productionAllowSet.has(rule.name)) {
      out.push(rule.name);
      continue;
    }

    logger.warn(`生产环境 skipMenuAuth 路由未加入白名单：${rule.name}`);
  }

  return out;
}
