import type { RouteRecordRaw } from 'vue-router';
import { getRouteSignature } from './route-signature';

export interface RouteAssemblyDiagnostics {
  routeCount: number;
  skipMenuAuthCount: number;
  signature: string;
}

export function getRouteCount(routes: RouteRecordRaw[]): number {
  return routes.reduce((total, route) => {
    const childRoutes = Array.isArray(route.children) ? route.children : [];
    return total + 1 + getRouteCount(childRoutes);
  }, 0);
}

export function createRouteAssemblyDiagnostics(params: {
  routes: RouteRecordRaw[];
  skipMenuAuthRouteNames: string[];
}): RouteAssemblyDiagnostics {
  const { routes, skipMenuAuthRouteNames } = params;
  return {
    routeCount: getRouteCount(routes),
    skipMenuAuthCount: skipMenuAuthRouteNames.length,
    signature: getRouteSignature(routes)
  };
}
