import type { AdminModuleManifest } from "@/router/types";
import { moduleManifest } from "./manifest";
import layoutRoutes from "./routes";

const logManagementModule: AdminModuleManifest = {
  ...moduleManifest,
  apiNamespace: "log-management",
  routes: {
    layout: layoutRoutes,
  },
};

export default logManagementModule;
