import type { AdminModuleManifest } from '@/module-system/types';
import layoutRoutes from './routes/layout';

const demoModule: AdminModuleManifest = {
  id: 'demo',
  version: '1',
  enabledByDefault: true,
  apiNamespace: 'demo',
  routes: {
    layout: layoutRoutes
  }
};

export default demoModule;
