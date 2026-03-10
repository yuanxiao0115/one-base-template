import type { AdminModuleManifest } from "@/router/types";
import { moduleManifest } from "./manifest";
import layoutRoutes from "./routes";

const userManagementModule: AdminModuleManifest = {
  ...moduleManifest,
  apiNamespace: "user-management",
  routes: {
    layout: layoutRoutes,
  },
};

export default userManagementModule;
