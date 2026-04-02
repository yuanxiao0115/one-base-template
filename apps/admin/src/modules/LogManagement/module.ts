import type { AppModuleManifest, AppModuleManifestMeta } from '@one-base-template/core';
import layoutRoutes from './routes';

export const moduleMeta = {
  id: 'log-management',
  version: '1',
  moduleTier: 'core',
  enabledByDefault: true
} as const satisfies AppModuleManifestMeta;

const logManagementModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'log-management',
  routes: {
    layout: layoutRoutes
  }
};

export default logManagementModule;
