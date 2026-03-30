import type { AppModuleManifest } from '@one-base-template/core';
import { moduleManifest } from './manifest';
import layoutRoutes from './routes';

const adminManagementModule: AppModuleManifest = {
  ...moduleManifest,
  apiNamespace: 'admin-management',
  routes: {
    layout: layoutRoutes
  }
};

export default adminManagementModule;
