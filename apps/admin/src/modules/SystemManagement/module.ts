import type { AdminModuleManifest } from '@/router/types'
import layoutRoutes from './routes'

const systemManagementModule: AdminModuleManifest = {
  id: 'system-management',
  version: '1',
  moduleTier: 'core',
  enabledByDefault: true,
  apiNamespace: 'system-management',
  routes: {
    layout: layoutRoutes
  }
}

export default systemManagementModule
