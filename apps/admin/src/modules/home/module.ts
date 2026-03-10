import type { AdminModuleManifest } from "@/router/types";
import { moduleManifest } from "./manifest";
import layoutRoutes from "./routes";

const homeModule: AdminModuleManifest = {
  ...moduleManifest,
  apiNamespace: "home",
  routes: {
    layout: layoutRoutes,
  },
};

export default homeModule;
