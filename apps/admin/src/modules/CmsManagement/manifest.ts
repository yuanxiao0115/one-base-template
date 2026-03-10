import type { AppModuleManifestMeta } from "@one-base-template/core";

export const moduleManifest = {
  id: "cms-management",
  version: "1",
  moduleTier: "optional",
  enabledByDefault: false,
} as const satisfies AppModuleManifestMeta;

export default moduleManifest;
