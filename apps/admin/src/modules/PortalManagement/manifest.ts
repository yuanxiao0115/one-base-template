import type { AppModuleManifestMeta } from "@one-base-template/core";

export const moduleManifest = {
  id: "PortalManagement",
  version: "1",
  moduleTier: "optional",
  enabledByDefault: false,
} as const satisfies AppModuleManifestMeta;
export default moduleManifest;
