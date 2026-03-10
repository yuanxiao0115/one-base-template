import type { AdminModuleManifest } from "@/router/types";
import { moduleManifest } from "./manifest";
import layoutRoutes from "./routes";

const systemManagementModule: AdminModuleManifest = {
  ...moduleManifest,
  apiNamespace: "system-management",
  routes: {
    layout: layoutRoutes,
  },
};

export default systemManagementModule;
