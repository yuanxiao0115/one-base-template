import type { AppModuleManifest } from "@one-base-template/core";
import { moduleManifest } from "./manifest";
import layoutRoutes from "./routes";

const logManagementModule: AppModuleManifest = {
  ...moduleManifest,
  apiNamespace: "log-management",
  routes: {
    layout: layoutRoutes,
  },
};

export default logManagementModule;
