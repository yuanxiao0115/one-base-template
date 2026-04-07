import type { AppModuleManifest } from '@one-base-template/core';
import { moduleMeta } from './meta';
import layoutRoutes from './routes';

const adminManagementModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'admin-management',
  routes: {
    layout: layoutRoutes
  }
};

export default adminManagementModule;
