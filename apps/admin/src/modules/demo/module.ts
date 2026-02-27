import type { AdminModuleManifest } from '@/router/types';
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
