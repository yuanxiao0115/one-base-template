import type { AppModuleManifest } from '@one-base-template/core';
import { moduleManifest } from './manifest';
import layoutRoutes from './routes';

const userManagementModule: AppModuleManifest = {
  ...moduleManifest,
  apiNamespace: 'user-management',
  routes: {
    layout: layoutRoutes
  }
};

export default userManagementModule;
