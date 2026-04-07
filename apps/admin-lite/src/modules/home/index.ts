import type { AppModuleManifest } from '@one-base-template/core';
import { moduleMeta } from './meta';
import layoutRoutes from './routes';

const homeModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'home',
  routes: {
    layout: layoutRoutes
  }
};

export default homeModule;
