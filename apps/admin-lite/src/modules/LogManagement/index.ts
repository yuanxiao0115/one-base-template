import type { AppModuleManifest } from '@one-base-template/core';
import { moduleMeta } from './meta';
import layoutRoutes from './routes';

const logManagementModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'log-management',
  routes: {
    layout: layoutRoutes
  }
};

export default logManagementModule;
