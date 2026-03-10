import type { AdminModuleManifest } from "@/router/types";
import { moduleManifest } from "./manifest";
import layoutRoutes, { standaloneRoutes } from "./routes";

const portalModule: AdminModuleManifest = {
  ...moduleManifest,
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
