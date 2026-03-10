import type { AppModuleManifestMeta } from "@one-base-template/core";

export const moduleManifest = {
  id: "system-management",
  version: "1",
  moduleTier: "core",
  enabledByDefault: true,
} as const satisfies AppModuleManifestMeta;

export default moduleManifest;
