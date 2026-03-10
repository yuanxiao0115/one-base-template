import type { AdminModuleManifest } from "@/router/types";
import layoutRoutes from "./routes";

const homeModule: AdminModuleManifest = {
  id: "home",
  version: "1",
  moduleTier: "core",
  enabledByDefault: true,
  apiNamespace: "home",
  routes: {
    layout: layoutRoutes,
  },
};

export default homeModule;
