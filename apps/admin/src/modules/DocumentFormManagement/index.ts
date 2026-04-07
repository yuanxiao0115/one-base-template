import type { AppModuleManifest } from '@one-base-template/core';
import { moduleMeta } from './meta';
import layoutRoutes from './routes/layout';
import standaloneRoutes from './routes/standalone';

const documentFormManagementModule: AppModuleManifest = {
  ...moduleMeta,
  apiNamespace: 'document-form-management',
  routes: {
    layout: layoutRoutes,
    standalone: standaloneRoutes
  }
};

export default documentFormManagementModule;
