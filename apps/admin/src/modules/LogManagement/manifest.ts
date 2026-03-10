import type { AdminModuleManifestMeta } from "@/router/types";

export const moduleManifest = {
  id: "log-management",
  version: "1",
  moduleTier: "core",
  enabledByDefault: true,
} as const satisfies AdminModuleManifestMeta;

export default moduleManifest;
