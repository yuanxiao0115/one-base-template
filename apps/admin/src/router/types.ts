import type { RouteRecordRaw } from 'vue-router';

export type EnabledModulesSetting = '*' | string[];
export type ModuleTier = 'core' | 'optional';

export type RouteAlias = {
  from: string;
  to: string;
};

export interface AdminModuleManifest {
  id: string;
  version: '1';
  moduleTier?: ModuleTier;
  enabledByDefault: boolean;
  routes: {
    layout: RouteRecordRaw[];
    standalone?: RouteRecordRaw[];
  };
  apiNamespace: string;
  compat?: {
    routeAliases?: RouteAlias[];
    activePathMap?: Record<string, string>;
  };
}

export interface AppRouteAssemblyResult {
  routes: RouteRecordRaw[];
  skipMenuAuthRouteNames: string[];
}
