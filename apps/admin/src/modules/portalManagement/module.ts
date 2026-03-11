import type { AppModuleManifest } from "@one-base-template/core";
import { moduleManifest } from "./manifest";
import layoutRoutes, { standaloneRoutes } from "./routes";

const portalModule: AppModuleManifest = {
  ...moduleManifest,
  apiNamespace: "portal",
  routes: {
    layout: layoutRoutes,
    standalone: standaloneRoutes,
  },
  compat: {
    activePathMap: {
      "/resource/portal/setting": "/portal/setting",
      "/portal/page/edit": "/portal/setting",
    },
  },
};

export default portalModule;
