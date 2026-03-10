import { getAppRoutes } from "./assemble-routes";
import type { AppRouteAssemblyOptions, AppRouteAssemblyResult } from "./types";

export function getRouteAssemblyResult(options: AppRouteAssemblyOptions): AppRouteAssemblyResult {
  return getAppRoutes(options);
}
