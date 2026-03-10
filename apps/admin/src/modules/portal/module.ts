import type { AdminModuleManifest } from "@/router/types";
import layoutRoutes, { standaloneRoutes } from "./routes";

const portalModule: AdminModuleManifest = {
  id: "portal",
  version: "1",
  moduleTier: "optional",
  enabledByDefault: false,
  apiNamespace: "portal",
  routes: {
    layout: layoutRoutes,
    standalone: standaloneRoutes,
  },
  compat: {
    routeAliases: [
      {
        from: "/portal/setting",
        to: "/portal/templates",
      },
    ],
    activePathMap: {
      "/portal/designer": "/portal/setting",
      "/portal/layout": "/portal/setting",
      "/portal/templates": "/portal/setting",
    },
  },
};

export default portalModule;
