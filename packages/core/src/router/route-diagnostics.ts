import type { RouteRecordRaw } from 'vue-router';
import { getRouteSignature } from './route-signature';

export interface RouteAssemblyDiagnostics {
  routeCount: number;
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
}): RouteAssemblyDiagnostics {
  const { routes } = params;
  return {
    routeCount: getRouteCount(routes),
    signature: getRouteSignature(routes)
  };
}
