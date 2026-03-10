import { getAppRoutes } from "./assemble-routes";
import type { AppRouteAssemblyOptions, AppRouteAssemblyResult } from "./types";

export async function getRouteAssemblyResult(options: AppRouteAssemblyOptions): Promise<AppRouteAssemblyResult> {
  return getAppRoutes(options);
}
