import type { RouteRecordRaw } from 'vue-router';
import { getInitialPath } from '@one-base-template/core';
import { AdminLayout, ForbiddenPage, NotFoundPage } from '@one-base-template/ui';
import { DEFAULT_FALLBACK_HOME } from '../config/systems';
import { createAppLogger } from '@/shared/logger';
import type { AppRouteAssemblyResult } from './types';

import { appEnv } from '../infra/env';
import { getEnabledModules } from './registry';
import {
  APP_FORBIDDEN_ROUTE_PATH,
  APP_LOGIN_ROUTE_PATH,
  APP_NOT_FOUND_CATCHALL_PATH,
  APP_NOT_FOUND_ROUTE_PATH,
  APP_RESERVED_ROUTE_NAMES,
  APP_RESERVED_ROUTE_PATHS,
  APP_ROOT_PATH,
  APP_SSO_ROUTE_PATH
} from './constants';

type RouteSource = 'layout' | 'standalone';

type RouteCollectContext = {
  source: RouteSource;
  parentPath: string;
  usedPaths: Set<string>;
  usedNames: Set<string>;
  skipMenuAuthRouteNames: Set<string>;
};

const logger = createAppLogger('router/assemble');

function normalizePath(path: string): string {
  if (!path) return APP_ROOT_PATH;
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  return withLeadingSlash.replace(/\/{2,}/g, '/');
}

function joinRoutePath(parentPath: string, currentPath: string): string {
  if (!currentPath) return normalizePath(parentPath || APP_ROOT_PATH);
  if (currentPath.startsWith('/')) return normalizePath(currentPath);
  if (!parentPath || parentPath === APP_ROOT_PATH) return normalizePath(currentPath);
  return normalizePath(`${parentPath}/${currentPath}`);
}

function toRouteNameKey(name: RouteRecordRaw['name']): string | null {
  if (typeof name === 'string') return name;
  if (typeof name === 'symbol') return name.toString();
  return null;
}

function isSkipMenuAuthRoute(route: RouteRecordRaw): boolean {
  const meta = route.meta as Record<string, unknown> | undefined;
  return meta?.skipMenuAuth === true;
}

function shouldSkipRoute(route: RouteRecordRaw, fullPath: string, context: RouteCollectContext): boolean {
  const sourceLabel = context.source === 'layout' ? 'layout' : 'standalone';

  if (APP_RESERVED_ROUTE_PATHS.has(fullPath)) {
    logger.warn(`模块路由占用了保留 path：${fullPath}（source=${sourceLabel}），已跳过。`);
    return true;
  }

  if (context.usedPaths.has(fullPath)) {
    logger.warn(`检测到重复 path：${fullPath}（source=${sourceLabel}），已跳过后出现的定义。`);
    return true;
  }

  const nameKey = toRouteNameKey(route.name);
  if (!nameKey) return false;

  if (APP_RESERVED_ROUTE_NAMES.has(nameKey)) {
    logger.warn(`模块路由占用了保留 name：${nameKey}（source=${sourceLabel}），已跳过。`);
    return true;
  }

  if (context.usedNames.has(nameKey)) {
    logger.warn(`检测到重复 name：${nameKey}（source=${sourceLabel}），已跳过后出现的定义。`);
    return true;
  }

  return false;
}

function collectModuleRoutes(routes: RouteRecordRaw[], context: RouteCollectContext): RouteRecordRaw[] {
  const out: RouteRecordRaw[] = [];

  for (const route of routes) {
    const fullPath = joinRoutePath(context.parentPath, route.path);
    if (shouldSkipRoute(route, fullPath, context)) {
      continue;
    }

    context.usedPaths.add(fullPath);
    const nameKey = toRouteNameKey(route.name);
    if (nameKey) {
      context.usedNames.add(nameKey);
    }

    if (isSkipMenuAuthRoute(route)) {
      if (!nameKey) {
        logger.warn(`skipMenuAuth 路由缺少 name：${fullPath}（source=${context.source}），该路由不会加入守卫白名单。`);
      } else {
        context.skipMenuAuthRouteNames.add(nameKey);
      }
    }

    const nextRoute: RouteRecordRaw = { ...route };
    if (Array.isArray(route.children) && route.children.length > 0) {
      nextRoute.children = collectModuleRoutes(route.children, {
        ...context,
        parentPath: fullPath
      });
    }

    out.push(nextRoute);
  }

  return out;
}

function getRootRedirect(): string {
  return getInitialPath({
    defaultSystemCode: appEnv.defaultSystemCode,
    systemHomeMap: appEnv.systemHomeMap,
    storageNamespace: appEnv.storageNamespace,
    fallbackHome: DEFAULT_FALLBACK_HOME
  });
}

export function getAppRoutes(): AppRouteAssemblyResult {
  const modules = getEnabledModules(appEnv.enabledModules);
  const usedPaths = new Set<string>();
  const usedNames = new Set<string>();
  const skipMenuAuthRouteNames = new Set<string>();

  const standaloneRoutes = collectModuleRoutes(
    modules.flatMap((item) => item.routes.standalone ?? []),
    {
      source: 'standalone',
      parentPath: APP_ROOT_PATH,
      usedPaths,
      usedNames,
      skipMenuAuthRouteNames
    }
  );

  const layoutRoutes = collectModuleRoutes(
    modules.flatMap((item) => item.routes.layout),
    {
      source: 'layout',
      parentPath: APP_ROOT_PATH,
      usedPaths,
      usedNames,
      skipMenuAuthRouteNames
    }
  );

  const routes: RouteRecordRaw[] = [
    ...standaloneRoutes,
    {
      path: APP_ROOT_PATH,
      component: AdminLayout,
      redirect: () => getRootRedirect(),
      children: layoutRoutes
    },
    {
      path: APP_LOGIN_ROUTE_PATH,
      name: 'Login',
      component: () => import('../pages/login/LoginPage.vue'),
      meta: { public: true, hiddenTab: true }
    },
    {
      path: APP_SSO_ROUTE_PATH,
      name: 'Sso',
      component: () => import('../pages/sso/SsoCallbackPage.vue'),
      meta: { public: true, hiddenTab: true }
    },
    {
      path: APP_FORBIDDEN_ROUTE_PATH,
      name: 'Forbidden',
      component: ForbiddenPage,
      meta: { public: true, hiddenTab: true }
    },
    {
      path: APP_NOT_FOUND_ROUTE_PATH,
      name: 'NotFound',
      component: NotFoundPage,
      meta: { public: true, hiddenTab: true }
    },
    {
      path: APP_NOT_FOUND_CATCHALL_PATH,
      // 通配 404 使用 replace，避免无效地址回退后再次命中通配造成历史栈污染。
      redirect: () => ({
        path: APP_NOT_FOUND_ROUTE_PATH,
        replace: true
      }),
      meta: { public: true, hiddenTab: true }
    }
  ];

  return {
    routes,
    skipMenuAuthRouteNames: [...skipMenuAuthRouteNames]
  };
}
