import type { AppModuleManifest } from '@one-base-template/core';
import { moduleMeta } from './meta';
import layoutRoutes from './routes';

const demoManagementModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'demo-management',
  routes: {
    layout: layoutRoutes
  }
};

export default demoManagementModule;
