import type { RouteRecordRaw } from 'vue-router';
import { getInitialPath } from '@one-base-template/core';
import { AdminLayout, ForbiddenPage, NotFoundPage } from '@one-base-template/ui';
import { DEFAULT_FALLBACK_HOME } from '../config/systems';
import { createAppLogger } from '@/shared/logger';
import type { AppRouteAssemblyResult } from './types';
import { getSkipMenuAuthRouteName, isSkipMenuAuthRoute, toRouteNameKey } from './skip-menu-auth';

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

function getNormalizedPath (path: string): string {
  if (!path) {
    return APP_ROOT_PATH;
  }
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  return withLeadingSlash.replace(/\/{2,}/g, '/');
}

function buildRoutePath (parentPath: string, currentPath: string): string {
  if (!currentPath) {
    return getNormalizedPath(parentPath || APP_ROOT_PATH);
  }
  if (currentPath.startsWith('/')) {
    return getNormalizedPath(currentPath);
  }
  if (!parentPath || parentPath === APP_ROOT_PATH) {
    return getNormalizedPath(currentPath);
  }
  return getNormalizedPath(`${parentPath}/${currentPath}`);
}

function shouldSkipRoute (route: RouteRecordRaw, fullPath: string, context: RouteCollectContext): boolean {
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
  if (!nameKey) {
    return false;
  }

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

function buildModuleRoutes (routes: RouteRecordRaw[], context: RouteCollectContext): RouteRecordRaw[] {
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
      logger.warn(`skipMenuAuth 路由缺少 name：${fullPath}（source=${context.source}），该路由不会加入守卫白名单。`);
    }
    if (skipMenuAuthRouteName !== null) {
      context.skipMenuAuthRouteNames.add(skipMenuAuthRouteName);
    }

    const nextRoute: RouteRecordRaw = { ...route };
    if (Array.isArray(route.children) && route.children.length > 0) {
      nextRoute.children = buildModuleRoutes(route.children, {
        ...context,
        parentPath: fullPath
      });
    }

    out.push(nextRoute);
  }

  return out;
}

function getRootRedirect (): string {
  return getInitialPath({
    defaultSystemCode: appEnv.defaultSystemCode,
    systemHomeMap: appEnv.systemHomeMap,
    storageNamespace: appEnv.storageNamespace,
    fallbackHome: DEFAULT_FALLBACK_HOME
  });
}

export function getAppRoutes (): AppRouteAssemblyResult {
  const modules = getEnabledModules(appEnv.enabledModules);
  const usedPaths = new Set<string>();
  const usedNames = new Set<string>();
  const skipMenuAuthRouteNames = new Set<string>();

  const standaloneRoutes = buildModuleRoutes(modules.flatMap((item) => item.routes.standalone ?? []),
    {
      source: 'standalone',
      parentPath: APP_ROOT_PATH,
      usedPaths,
      usedNames,
      skipMenuAuthRouteNames
    });

  const layoutRoutes = buildModuleRoutes(modules.flatMap((item) => item.routes.layout),
    {
      source: 'layout',
      parentPath: APP_ROOT_PATH,
      usedPaths,
      usedNames,
      skipMenuAuthRouteNames
    });

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
      component: async () => import('../pages/login/LoginPage.vue'),
      meta: {
        public: true,
        hiddenTab: true
      }
    },
    {
      path: APP_SSO_ROUTE_PATH,
      name: 'Sso',
      component: async () => import('../pages/sso/SsoCallbackPage.vue'),
      meta: {
        public: true,
        hiddenTab: true
      }
    },
    {
      path: APP_FORBIDDEN_ROUTE_PATH,
      name: 'Forbidden',
      component: ForbiddenPage,
      meta: {
        public: true,
        hiddenTab: true
      }
    },
    {
      path: APP_NOT_FOUND_ROUTE_PATH,
      name: 'NotFound',
      component: NotFoundPage,
      meta: {
        public: true,
        hiddenTab: true
      }
    },
    {
      path: APP_NOT_FOUND_CATCHALL_PATH,
      // 通配 404 使用 replace，避免无效地址回退后再次命中通配造成历史栈污染。
      redirect: () => ({
        path: APP_NOT_FOUND_ROUTE_PATH,
        replace: true
      }),
      meta: {
        public: true,
        hiddenTab: true
      }
    }
  ];

  return {
    routes,
    skipMenuAuthRouteNames: [...skipMenuAuthRouteNames]
  };
}
