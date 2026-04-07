import type { AppModuleManifest } from '@one-base-template/core';
import { moduleMeta } from './meta';
import layoutRoutes from './routes';

const cmsManagementModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'cms-management',
  routes: {
    layout: layoutRoutes
  }
};

export default cmsManagementModule;
