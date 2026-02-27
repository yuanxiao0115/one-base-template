import type { AdminModuleManifest } from '@/module-system/types';
import layoutRoutes from './routes/layout';

const bModule: AdminModuleManifest = {
  id: 'b',
  version: '1',
  enabledByDefault: true,
  apiNamespace: 'b',
  routes: {
    layout: layoutRoutes
  }
};

export default bModule;
