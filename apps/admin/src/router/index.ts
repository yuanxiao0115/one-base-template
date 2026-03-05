import { getAppRoutes } from "./assemble-routes";
import type { AppRouteAssemblyResult } from "./types";

export function getRouteAssemblyResult(): AppRouteAssemblyResult {
  return getAppRoutes();
}
