import type { AppModuleManifest, AppModuleManifestMeta } from '@one-base-template/core';
import layoutRoutes from './routes';

export const moduleMeta = {
  id: 'home',
  version: '1',
  moduleTier: 'core',
  enabledByDefault: true
} as const satisfies AppModuleManifestMeta;

const homeModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'home',
  routes: {
    layout: layoutRoutes
  }
};

export default homeModule;
