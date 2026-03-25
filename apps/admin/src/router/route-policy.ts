import type { RouteMeta, RouteRecordRaw } from 'vue-router';
import { buildRouteFullPath, toRouteNameKey } from '@one-base-template/core';

export interface RoutePolicyEntry {
  name: string | null;
  path: string;
  public: boolean;
  skipMenuAuth: boolean;
  activePath?: string;
}

export interface RoutePolicyReport {
  routes: RoutePolicyEntry[];
  publicRoutes: RoutePolicyEntry[];
  skipMenuAuthRoutes: RoutePolicyEntry[];
  activePathRoutes: RoutePolicyEntry[];
}

function isMetaFlagEnabled(meta: RouteMeta | undefined, key: string): boolean {
  return meta?.[key] === true;
}

function readActivePath(meta: RouteMeta | undefined): string | undefined {
  const activePath = meta?.activePath;
  if (typeof activePath !== 'string') {
    return undefined;
  }
  if (!activePath.startsWith('/')) {
    return undefined;
  }
  return activePath;
}

function collectRoutePolicyEntries(
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
      public: isMetaFlagEnabled(meta, 'public'),
      skipMenuAuth: isMetaFlagEnabled(meta, 'skipMenuAuth')
    };
    const activePath = readActivePath(meta);
    if (activePath) {
      entry.activePath = activePath;
    }
    output.push(entry);

    if (Array.isArray(route.children) && route.children.length > 0) {
      collectRoutePolicyEntries(route.children, fullPath, output);
    }
  }
}

function sortByPathAndName(entries: RoutePolicyEntry[]): RoutePolicyEntry[] {
  return [...entries].sort((left, right) => {
    if (left.path !== right.path) {
      return left.path.localeCompare(right.path);
    }
    return (left.name ?? '').localeCompare(right.name ?? '');
  });
}

export function buildRoutePolicyReport(routes: RouteRecordRaw[]): RoutePolicyReport {
  const allRoutes: RoutePolicyEntry[] = [];
  collectRoutePolicyEntries(routes, '/', allRoutes);

  const publicRoutes = allRoutes.filter((item) => item.public);
  const skipMenuAuthRoutes = allRoutes.filter((item) => item.skipMenuAuth);
  const activePathRoutes = allRoutes.filter((item) => Boolean(item.activePath));

  return {
    routes: sortByPathAndName(allRoutes),
    publicRoutes: sortByPathAndName(publicRoutes),
    skipMenuAuthRoutes: sortByPathAndName(skipMenuAuthRoutes),
    activePathRoutes: sortByPathAndName(activePathRoutes)
  };
}
