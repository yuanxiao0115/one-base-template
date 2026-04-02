import type { AppModuleManifest, AppModuleManifestMeta } from '@one-base-template/core';
import layoutRoutes from './routes';

export const moduleMeta = {
  id: 'system-sfss',
  version: '1',
  moduleTier: 'core',
  enabledByDefault: true
} as const satisfies AppModuleManifestMeta;

const systemSfssModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'system-sfss',
  routes: {
    layout: layoutRoutes
  }
};

export default systemSfssModule;
