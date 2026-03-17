import {
  registerPortalMaterial,
  registerPortalMaterialComponent,
  unregisterPortalMaterial,
  unregisterPortalMaterialComponent,
  type PortalMaterialItem
} from '@one-base-template/portal-engine';

import AdminSimpleContainerContent from './content.vue';
import AdminSimpleContainerIndex from './index.vue';
import AdminSimpleContainerStyle from './style.vue';
import {
  adminSimpleContainerConfig,
  ADMIN_SIMPLE_CONTAINER_CONTENT_NAME,
  ADMIN_SIMPLE_CONTAINER_INDEX_NAME,
  ADMIN_SIMPLE_CONTAINER_LEGACY_INDEX_NAME,
  ADMIN_SIMPLE_CONTAINER_MATERIAL_ID,
  ADMIN_SIMPLE_CONTAINER_MATERIAL_TYPE,
  ADMIN_SIMPLE_CONTAINER_STYLE_NAME
} from './model';

const ADMIN_SIMPLE_CONTAINER_MATERIAL: PortalMaterialItem = {
  id: ADMIN_SIMPLE_CONTAINER_MATERIAL_ID,
  type: ADMIN_SIMPLE_CONTAINER_MATERIAL_TYPE,
  cmptName: '单容器',
  cmptWidth: 12,
  cmptHeight: 30,
  cmptIcon: 'ri:layout-4-line',
  cmptConfig: adminSimpleContainerConfig
};

let registered = false;

export function registerAdminSimpleContainerMaterial() {
  if (registered) {
    return;
  }

  registerPortalMaterial(ADMIN_SIMPLE_CONTAINER_MATERIAL, {
    category: {
      id: 'basic',
      name: '基础组件',
      title: '基础组件',
      cmptTypeName: '基础组件'
    },
    strategy: 'replace'
  });

  registerPortalMaterialComponent({
    name: ADMIN_SIMPLE_CONTAINER_INDEX_NAME,
    component: AdminSimpleContainerIndex,
    aliases: [ADMIN_SIMPLE_CONTAINER_LEGACY_INDEX_NAME],
    strategy: 'replace'
  });
  registerPortalMaterialComponent({
    name: ADMIN_SIMPLE_CONTAINER_CONTENT_NAME,
    component: AdminSimpleContainerContent,
    strategy: 'replace'
  });
  registerPortalMaterialComponent({
    name: ADMIN_SIMPLE_CONTAINER_STYLE_NAME,
    component: AdminSimpleContainerStyle,
    strategy: 'replace'
  });

  registered = true;
}

export function resetAdminSimpleContainerMaterialForTesting() {
  if (!registered) {
    return;
  }

  unregisterPortalMaterialComponent(ADMIN_SIMPLE_CONTAINER_INDEX_NAME, [
    ADMIN_SIMPLE_CONTAINER_LEGACY_INDEX_NAME
  ]);
  unregisterPortalMaterialComponent(ADMIN_SIMPLE_CONTAINER_CONTENT_NAME);
  unregisterPortalMaterialComponent(ADMIN_SIMPLE_CONTAINER_STYLE_NAME);
  unregisterPortalMaterial({
    categoryId: 'basic',
    id: ADMIN_SIMPLE_CONTAINER_MATERIAL_ID,
    type: ADMIN_SIMPLE_CONTAINER_MATERIAL_TYPE
  });

  registered = false;
}
