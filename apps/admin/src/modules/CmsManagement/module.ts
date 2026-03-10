import type { AdminModuleManifest } from "@/router/types";
import { moduleManifest } from "./manifest";
import layoutRoutes from "./routes";

const cmsManagementModule: AdminModuleManifest = {
  ...moduleManifest,
  apiNamespace: "cms-management",
  routes: {
    layout: layoutRoutes,
  },
};

export default cmsManagementModule;
