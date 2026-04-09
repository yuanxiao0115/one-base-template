import type { AppModuleManifest } from '@one-base-template/core';
import { moduleMeta } from './meta';
import layoutRoutes from './routes';

const messageManagementModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'message-management',
  routes: {
    layout: layoutRoutes
  }
};

export default messageManagementModule;
