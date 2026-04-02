import type { AppModuleManifest, AppModuleManifestMeta } from '@one-base-template/core';
import layoutRoutes from './routes';

export const moduleMeta = {
  id: 'admin-management',
  version: '1',
  moduleTier: 'core',
  enabledByDefault: true
} as const satisfies AppModuleManifestMeta;

const adminManagementModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'admin-management',
  routes: {
    layout: layoutRoutes
  }
};

export default adminManagementModule;
