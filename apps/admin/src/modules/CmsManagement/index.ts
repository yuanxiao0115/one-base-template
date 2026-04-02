import type { AppModuleManifest, AppModuleManifestMeta } from '@one-base-template/core';
import layoutRoutes from './routes';

export const moduleMeta = {
  id: 'cms-management',
  version: '1',
  moduleTier: 'optional',
  enabledByDefault: false
} as const satisfies AppModuleManifestMeta;

const cmsManagementModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'cms-management',
  routes: {
    layout: layoutRoutes
  }
};

export default cmsManagementModule;
