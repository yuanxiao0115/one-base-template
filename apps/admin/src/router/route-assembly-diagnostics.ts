import type { RouteRecordRaw } from 'vue-router';
import { getRouteSignature } from './route-signature';

export interface AppRouteAssemblyDiagnostics {
  routeCount: number;
  skipMenuAuthCount: number;
  signature: string;
}

export function countRoutes(routes: RouteRecordRaw[]): number {
  return routes.reduce((total, route) => {
    const childRoutes = Array.isArray(route.children) ? route.children : [];
    return total + 1 + countRoutes(childRoutes);
  }, 0);
}

export function createRouteAssemblyDiagnostics(params: {
  routes: RouteRecordRaw[];
  skipMenuAuthRouteNames: string[];
}): AppRouteAssemblyDiagnostics {
  const { routes, skipMenuAuthRouteNames } = params;
  return {
    routeCount: countRoutes(routes),
    skipMenuAuthCount: skipMenuAuthRouteNames.length,
    signature: getRouteSignature(routes)
  };
}
