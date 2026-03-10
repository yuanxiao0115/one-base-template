import type { AdminModuleManifestMeta } from "@/router/types";

export const moduleManifest = {
  id: "home",
  version: "1",
  moduleTier: "core",
  enabledByDefault: true,
} as const satisfies AdminModuleManifestMeta;

export default moduleManifest;
