import type { RouteRecordRaw } from "vue-router";

export type EnabledModulesSetting = string[] | "*";
export type ModuleTier = "core" | "optional";
export type RouteConflictPolicy = "warn" | "fail-fast";
export type SkipMenuAuthLevel = "stable" | "allowlist" | "dev-only";

export interface SkipMenuAuthRouteRule {
  name: string;
  level: SkipMenuAuthLevel;
}

export interface AdminModuleManifestMeta {
  id: string;
  version: "1";
  moduleTier: ModuleTier;
  enabledByDefault: boolean;
}

export interface RouteAlias {
  from: string;
  to: string;
}

export interface ModuleCompat {
  routeAliases?: RouteAlias[];
  activePathMap?: Record<string, string>;
}

interface AdminModuleManifestBase extends AdminModuleManifestMeta {
  routes: {
    layout: RouteRecordRaw[];
    standalone?: RouteRecordRaw[];
  };
  apiNamespace: string;
  compat?: ModuleCompat;
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
export type AdminModuleDeclarationModule = {
  default?: AdminModuleManifest;
  module?: AdminModuleManifest;
};

export interface AppRouteAssemblyResult {
  routes: RouteRecordRaw[];
  skipMenuAuthRouteNames: string[];
  skipMenuAuthRouteRules: SkipMenuAuthRouteRule[];
}

export interface AppRouteAssemblyOptions {
  enabledModules: EnabledModulesSetting;
  defaultSystemCode?: string;
  systemHomeMap: Record<string, string>;
  storageNamespace: string;
  routeConflictPolicy?: RouteConflictPolicy;
}
