import type { AdminModuleManifestMeta } from "@/router/types";

export const moduleManifest = {
  id: "system-management",
  version: "1",
  moduleTier: "core",
  enabledByDefault: true,
} as const satisfies AdminModuleManifestMeta;

export default moduleManifest;
