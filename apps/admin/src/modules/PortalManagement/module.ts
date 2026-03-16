import type { AppModuleManifest } from '@one-base-template/core';
import { moduleManifest } from './manifest';
import layoutRoutes from './routes/layout';
import standaloneRoutes from './routes/standalone';

const portalModule: AppModuleManifest = {
  ...moduleManifest,
  apiNamespace: 'portal',
  routes: {
    layout: layoutRoutes,
    standalone: standaloneRoutes
  },
  compat: {
    activePathMap: {
      '/portal/design': '/portal/setting',
      '/portal/page/edit': '/portal/setting'
    }
  }
};

export default portalModule;
