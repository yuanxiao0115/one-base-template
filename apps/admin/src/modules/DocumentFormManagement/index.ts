import type { AppModuleManifest, AppModuleManifestMeta } from '@one-base-template/core';
import layoutRoutes from './routes/layout';
import standaloneRoutes from './routes/standalone';

export const moduleMeta = {
  id: 'document-form-management',
  version: '1',
  moduleTier: 'optional',
  enabledByDefault: false
} as const satisfies AppModuleManifestMeta;

const documentFormManagementModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'document-form-management',
  routes: {
    layout: layoutRoutes,
    standalone: standaloneRoutes
  }
};

export default documentFormManagementModule;
