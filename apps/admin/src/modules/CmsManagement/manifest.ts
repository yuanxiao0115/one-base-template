import type { AdminModuleManifestMeta } from "@/router/types";

export const moduleManifest = {
  id: "cms-management",
  version: "1",
  moduleTier: "optional",
  enabledByDefault: false,
} as const satisfies AdminModuleManifestMeta;

export default moduleManifest;
