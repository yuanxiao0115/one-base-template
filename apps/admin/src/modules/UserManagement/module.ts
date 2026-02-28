import type { AdminModuleManifest } from '@/router/types';
import layoutRoutes from './routes';

const userManagementModule: AdminModuleManifest = {
  id: 'user-management',
  version: '1',
  enabledByDefault: true,
  apiNamespace: 'user-management',
  routes: {
    layout: layoutRoutes
  }
};

export default userManagementModule;
