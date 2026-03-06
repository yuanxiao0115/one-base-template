import type { MenuMode } from "../infra/env";

import { resolveBootstrapMode } from "./entry";

export async function bootstrapAppByMode(params: {
  pathname: string;
  baseUrl: string;
  menuMode: MenuMode;
}) {
  const bootstrapMode = resolveBootstrapMode(params);

  return bootstrapMode === "public"
    ? (await import("./public-entry")).bootstrapPublicMode()
    : (await import("./admin-entry")).bootstrapAdminMode();
}
