import type { AdminModuleManifest } from '@/router/module-system/types';
import layoutRoutes from './routes/layout';

const homeModule: AdminModuleManifest = {
  id: 'home',
  version: '1',
  enabledByDefault: true,
  apiNamespace: 'home',
  routes: {
    layout: layoutRoutes
  }
};

export default homeModule;
