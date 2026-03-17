import {
  getPortalMaterialRegistryController,
  registerPortalMaterialComponent,
  unregisterPortalMaterialComponent,
  type PortalEngineContext,
  type PortalMaterialCategoryInput
} from '@one-base-template/portal-engine';
import type { Component } from 'vue';

interface PortalMaterialConfigSection {
  name?: string;
  [key: string]: unknown;
}

interface PortalMaterialConfig {
  index?: PortalMaterialConfigSection;
  content?: PortalMaterialConfigSection;
  style?: PortalMaterialConfigSection;
  [key: string]: unknown;
}

interface PortalMaterialComponents {
  index: Component;
  content: Component;
  style: Component;
}

export interface AdminPortalMaterialRegistration {
  id: string;
  type: string;
  name: string;
  icon: string;
  width?: number;
  height?: number;
  config: PortalMaterialConfig;
  components: PortalMaterialComponents;
  category?: PortalMaterialCategoryInput;
}

const DEFAULT_CATEGORY: PortalMaterialCategoryInput = {
  id: 'basic',
  name: '基础组件',
  title: '基础组件',
  cmptTypeName: '基础组件'
};

function resolveSectionName(config: PortalMaterialConfig, section: 'index' | 'content' | 'style') {
  const sectionConfig = config[section];
  const sectionName = typeof sectionConfig?.name === 'string' ? sectionConfig.name.trim() : '';
  if (!sectionName) {
    throw new Error(`[PortalManagement] 物料缺少 ${section}.name，无法注册`);
  }
  return sectionName;
}

export function registerAdminPortalMaterials(
  context: PortalEngineContext,
  materials: AdminPortalMaterialRegistration[]
) {
  if (!materials.length) {
    return;
  }

  const registryController = getPortalMaterialRegistryController(context);

  for (const material of materials) {
    const indexName = resolveSectionName(material.config, 'index');
    const contentName = resolveSectionName(material.config, 'content');
    const styleName = resolveSectionName(material.config, 'style');

    registryController.registerPortalMaterial(
      {
        id: material.id,
        type: material.type,
        cmptName: material.name,
        cmptIcon: material.icon,
        cmptWidth: material.width ?? 12,
        cmptHeight: material.height ?? 10,
        cmptConfig: material.config
      },
      {
        category: material.category ?? DEFAULT_CATEGORY,
        strategy: 'replace'
      }
    );

    registerPortalMaterialComponent(
      {
        name: indexName,
        component: material.components.index,
        strategy: 'replace'
      },
      context
    );
    registerPortalMaterialComponent(
      {
        name: contentName,
        component: material.components.content,
        strategy: 'replace'
      },
      context
    );
    registerPortalMaterialComponent(
      {
        name: styleName,
        component: material.components.style,
        strategy: 'replace'
      },
      context
    );
  }
}

export function unregisterAdminPortalMaterials(
  context: PortalEngineContext,
  materials: AdminPortalMaterialRegistration[]
) {
  if (!materials.length) {
    return;
  }

  const registryController = getPortalMaterialRegistryController(context);

  for (const material of materials) {
    registryController.unregisterPortalMaterial({
      id: material.id,
      type: material.type
    });

    const sectionNames = (['index', 'content', 'style'] as const)
      .map((section) => {
        const sectionConfig = material.config[section] as PortalMaterialConfigSection | undefined;
        return typeof sectionConfig?.name === 'string' ? sectionConfig.name.trim() : '';
      })
      .filter(Boolean);

    for (const sectionName of sectionNames) {
      unregisterPortalMaterialComponent(sectionName, [], context);
    }
  }
}
