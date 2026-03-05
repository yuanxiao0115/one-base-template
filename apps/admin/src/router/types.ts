import type { RouteRecordRaw } from "vue-router";

export type EnabledModulesSetting = string[] | "*";
export type ModuleTier = "core" | "optional";

export interface RouteAlias {
  from: string;
  to: string;
}

interface AdminModuleManifestBase {
  id: string;
  version: "1";
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

export type CoreModuleManifest = AdminModuleManifestBase & {
  moduleTier: "core";
  enabledByDefault: boolean;
};

export type OptionalModuleManifest = AdminModuleManifestBase & {
  moduleTier: "optional";
  enabledByDefault: false;
};

export type AdminModuleManifest = CoreModuleManifest | OptionalModuleManifest;

export interface AppRouteAssemblyResult {
  routes: RouteRecordRaw[];
  skipMenuAuthRouteNames: string[];
}
