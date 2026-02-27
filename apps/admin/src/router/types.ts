import type { RouteRecordRaw } from 'vue-router';

export type EnabledModulesSetting = '*' | string[];

export type RouteAlias = {
  from: string;
  to: string;
};

export interface AdminModuleManifest {
  id: string;
  version: '1';
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
