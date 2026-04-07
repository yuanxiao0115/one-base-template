import type { AppModuleManifest } from '@one-base-template/core';
import { moduleMeta } from './meta';
import layoutRoutes from './routes/layout';
import standaloneRoutes from './routes/standalone';

const portalModule: AppModuleManifest = {
  ...moduleMeta,
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
