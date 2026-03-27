import type { AppModuleManifest } from '@one-base-template/core';

import { moduleManifest } from './manifest';
import layoutRoutes from './routes/layout';
import standaloneRoutes from './routes/standalone';

const documentFormManagementModule: AppModuleManifest = {
  ...moduleManifest,
  apiNamespace: 'document-form-management',
  routes: {
    layout: layoutRoutes,
    standalone: standaloneRoutes
  }
};

export default documentFormManagementModule;
