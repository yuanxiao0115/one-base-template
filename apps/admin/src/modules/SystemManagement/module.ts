import type { AppModuleManifest } from "@one-base-template/core";
import { moduleManifest } from "./manifest";
import layoutRoutes from "./routes";

const systemManagementModule: AppModuleManifest = {
  ...moduleManifest,
  apiNamespace: "system-management",
  routes: {
    layout: layoutRoutes,
  },
};

export default systemManagementModule;
