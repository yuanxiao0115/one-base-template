import type { AppModuleManifest } from "@one-base-template/core";
import { moduleManifest } from "./manifest";
import layoutRoutes from "./routes";

const cmsManagementModule: AppModuleManifest = {
  ...moduleManifest,
  apiNamespace: "cms-management",
  routes: {
    layout: layoutRoutes,
  },
};

export default cmsManagementModule;
