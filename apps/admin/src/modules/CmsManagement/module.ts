import type { AdminModuleManifest } from "@/router/types";
import layoutRoutes from "./routes";

const cmsManagementModule: AdminModuleManifest = {
  id: "cms-management",
  version: "1",
  moduleTier: "optional",
  enabledByDefault: false,
  apiNamespace: "cms-management",
  routes: {
    layout: layoutRoutes,
  },
};

export default cmsManagementModule;
