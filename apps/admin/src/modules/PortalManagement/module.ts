import type { AppModuleManifest, AppModuleManifestMeta } from '@one-base-template/core';
import layoutRoutes from './routes/layout';
import standaloneRoutes from './routes/standalone';

export const moduleMeta = {
  id: 'PortalManagement',
  version: '1',
  moduleTier: 'optional',
  enabledByDefault: false
} as const satisfies AppModuleManifestMeta;

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
