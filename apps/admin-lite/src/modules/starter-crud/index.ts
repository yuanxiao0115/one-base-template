import type { AppModuleManifest } from '@one-base-template/core';
import { moduleMeta } from './meta';
import layoutRoutes from './routes';

const starterCrudModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'starter-crud',
  routes: {
    layout: layoutRoutes
  }
};

export default starterCrudModule;
