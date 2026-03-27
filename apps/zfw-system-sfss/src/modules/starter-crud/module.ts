import type { AppModuleManifest } from '@one-base-template/core';
import { moduleManifest } from './manifest';
import layoutRoutes from './routes';

const starterCrudModule: AppModuleManifest = {
  ...moduleManifest,
  apiNamespace: 'starter-crud',
  routes: {
    layout: layoutRoutes
  }
};

export default starterCrudModule;
