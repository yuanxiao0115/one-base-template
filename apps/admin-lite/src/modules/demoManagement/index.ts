import type { AppModuleManifest, AppModuleManifestMeta } from '@one-base-template/core';
import layoutRoutes from './routes';

export const moduleMeta = {
  id: 'demo-management',
  version: '1',
  moduleTier: 'optional',
  enabledByDefault: false
} as const satisfies AppModuleManifestMeta;

const demoManagementModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'demo-management',
  routes: {
    layout: layoutRoutes
  }
};

export default demoManagementModule;
