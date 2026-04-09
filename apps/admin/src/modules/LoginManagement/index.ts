import type { AppModuleManifest } from '@one-base-template/core';
import { moduleMeta } from './meta';
import layoutRoutes from './routes';

const loginManagementModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'portal-login-management',
  routes: {
    layout: layoutRoutes
  }
};

export default loginManagementModule;
