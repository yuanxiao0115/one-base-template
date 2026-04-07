import type { AppModuleManifest } from '@one-base-template/core';
import { moduleMeta } from './meta';
import layoutRoutes from './routes';

const systemManagementModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'system-management',
  routes: {
    layout: layoutRoutes
  }
};

export default systemManagementModule;
