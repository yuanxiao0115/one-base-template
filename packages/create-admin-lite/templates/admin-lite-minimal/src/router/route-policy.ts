import type { RouteMeta, RouteRecordRaw } from 'vue-router';
import {
  buildRouteFullPath,
  getRouteAccess,
  toRouteNameKey,
  type RouteAccess
} from '@one-base-template/core';

export interface RoutePolicyEntry {
  name: string | null;
  path: string;
  access: RouteAccess;
  activePath?: string;
}

export interface RoutePolicyReport {
  routes: RoutePolicyEntry[];
  openRoutes: RoutePolicyEntry[];
  authRoutes: RoutePolicyEntry[];
  menuRoutes: RoutePolicyEntry[];
  activePathRoutes: RoutePolicyEntry[];
}

function getActivePath(meta: RouteMeta | undefined): string | undefined {
  const activePath = meta?.activePath;
  if (typeof activePath !== 'string') {
    return undefined;
  }
  if (!activePath.startsWith('/')) {
    return undefined;
  }
  return activePath;
}

function buildRoutePolicyEntries(
  routes: RouteRecordRaw[],
  parentPath: string,
  output: RoutePolicyEntry[]
) {
  for (const route of routes) {
    const fullPath = buildRouteFullPath(parentPath, route.path, '/');
    const meta = route.meta as RouteMeta | undefined;
    const entry: RoutePolicyEntry = {
      name: toRouteNameKey(route.name),
      path: fullPath,
      access: getRouteAccess(meta)
    };
    const activePath = getActivePath(meta);
    if (activePath) {
      entry.activePath = activePath;
    }
    output.push(entry);

    if (Array.isArray(route.children) && route.children.length > 0) {
      buildRoutePolicyEntries(route.children, fullPath, output);
    }
  }
}

function buildPathSortedEntries(entries: RoutePolicyEntry[]): RoutePolicyEntry[] {
  return [...entries].sort((left, right) => {
    if (left.path !== right.path) {
      return left.path.localeCompare(right.path);
    }
    return (left.name ?? '').localeCompare(right.name ?? '');
  });
}

export function buildRoutePolicyReport(routes: RouteRecordRaw[]): RoutePolicyReport {
  const allRoutes: RoutePolicyEntry[] = [];
  buildRoutePolicyEntries(routes, '/', allRoutes);

  const openRoutes = allRoutes.filter((item) => item.access === 'open');
  const authRoutes = allRoutes.filter((item) => item.access === 'auth');
  const menuRoutes = allRoutes.filter((item) => item.access === 'menu');
  const activePathRoutes = allRoutes.filter((item) => Boolean(item.activePath));

  return {
    routes: buildPathSortedEntries(allRoutes),
    openRoutes: buildPathSortedEntries(openRoutes),
    authRoutes: buildPathSortedEntries(authRoutes),
    menuRoutes: buildPathSortedEntries(menuRoutes),
    activePathRoutes: buildPathSortedEntries(activePathRoutes)
  };
}
