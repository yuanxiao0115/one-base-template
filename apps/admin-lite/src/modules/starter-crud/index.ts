import type { AppModuleManifest, AppModuleManifestMeta } from '@one-base-template/core';
import layoutRoutes from './routes';

export const moduleMeta = {
  id: 'starter-crud',
  version: '1',
  moduleTier: 'optional',
  enabledByDefault: false
} as const satisfies AppModuleManifestMeta;

const starterCrudModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'starter-crud',
  routes: {
    layout: layoutRoutes
  }
};

export default starterCrudModule;
