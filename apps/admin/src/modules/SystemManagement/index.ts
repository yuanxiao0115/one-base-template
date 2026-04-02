import type { AppModuleManifest, AppModuleManifestMeta } from '@one-base-template/core';
import layoutRoutes from './routes';

export const moduleMeta = {
  id: 'system-management',
  version: '1',
  moduleTier: 'core',
  enabledByDefault: true
} as const satisfies AppModuleManifestMeta;

const systemManagementModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'system-management',
  routes: {
    layout: layoutRoutes
  }
};

export default systemManagementModule;
