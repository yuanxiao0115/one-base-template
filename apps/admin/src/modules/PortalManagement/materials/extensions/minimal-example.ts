import {
  definePortalMaterial,
  definePortalMaterialCategory,
  definePortalMaterialExtension,
  type PortalMaterialExtension
} from '@one-base-template/portal-engine';

import { ADMIN_QUICK_DEMO_CONFIG } from '../examples/quick-register-demo/config';
import AdminQuickDemoContent from '../examples/quick-register-demo/content.vue';
import AdminQuickDemoIndex from '../examples/quick-register-demo/index.vue';
import AdminQuickDemoStyle from '../examples/quick-register-demo/style.vue';

const portalAdminExampleCategory = definePortalMaterialCategory({
  id: 'topic',
  title: '专题专区',
  name: '专题专区',
  cmptTypeName: '专题专区'
});

const portalAdminExampleMaterial = definePortalMaterial({
  id: 'topic-admin-quick-demo',
  type: 'topic-admin-quick-demo',
  name: '专题示例卡片',
  icon: 'ri:apps-2-line',
  config: ADMIN_QUICK_DEMO_CONFIG,
  components: {
    index: AdminQuickDemoIndex,
    content: AdminQuickDemoContent,
    style: AdminQuickDemoStyle
  }
});

// 复制这个常量到 extensions/index.ts 后即可形成“新增分类 + 新增物料”的最小闭环。
export const PORTAL_ADMIN_MINIMAL_MATERIAL_EXTENSION_EXAMPLE: PortalMaterialExtension =
  definePortalMaterialExtension({
    category: portalAdminExampleCategory,
    materials: [portalAdminExampleMaterial]
  });

// 只想先扩分类、不立刻挂物料时，保留这一种最小写法即可。
export const PORTAL_ADMIN_CATEGORY_ONLY_EXTENSION_EXAMPLE: PortalMaterialExtension =
  definePortalMaterialExtension({
    category: definePortalMaterialCategory({
      id: 'marketing',
      title: '营销专区',
      name: '营销专区',
      cmptTypeName: '营销专区'
    })
  });
