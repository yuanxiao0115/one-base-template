import { getAppRoutes } from './assemble-routes';
import type { AppRouteAssemblyResult } from './types';

export function getRoutes() {
  return getAppRoutes().routes;
}

export function getRouteAssemblyResult(): AppRouteAssemblyResult {
  return getAppRoutes();
}
