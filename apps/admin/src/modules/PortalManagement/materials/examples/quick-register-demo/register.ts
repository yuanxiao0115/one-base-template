import type { PortalEngineContext } from '@one-base-template/portal-engine';

import type { AdminPortalMaterialRegistration } from '../../admin-material-registration';
import { registerAdminPortalMaterials } from '../../admin-material-registration';
import { ADMIN_QUICK_DEMO_CONFIG } from './config';
import AdminQuickDemoContent from './content.vue';
import AdminQuickDemoIndex from './index.vue';
import AdminQuickDemoStyle from './style.vue';

export const ADMIN_QUICK_DEMO_MATERIAL: AdminPortalMaterialRegistration = {
  id: 'basic-admin-quick-demo',
  type: 'basic-admin-quick-demo',
  name: '注册示例卡片',
  icon: 'ri:flask-line',
  width: 12,
  height: 10,
  config: ADMIN_QUICK_DEMO_CONFIG,
  components: {
    index: AdminQuickDemoIndex,
    content: AdminQuickDemoContent,
    style: AdminQuickDemoStyle
  }
};

export function registerPortalAdminQuickDemoMaterial(context: PortalEngineContext) {
  registerAdminPortalMaterials(context, [ADMIN_QUICK_DEMO_MATERIAL]);
}
