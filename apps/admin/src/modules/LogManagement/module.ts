import type { AdminModuleManifest } from '@/router/types';
import layoutRoutes from './routes';

const logManagementModule: AdminModuleManifest = {
  id: 'log-management',
  version: '1',
  moduleTier: 'core',
  enabledByDefault: true,
  apiNamespace: 'log-management',
  routes: {
    layout: layoutRoutes
  }
};

export default logManagementModule;
