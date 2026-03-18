import type {
  PortalMaterialCategory,
  PortalMaterialCategoryInput
} from '../registry/materials-registry.types';
import type { PortalEngineContext } from '../runtime/context';
import { getDefaultPortalEngineContext } from '../runtime/context';
import { getPortalMaterialRegistryController } from '../registry/materials-registry';

import {
  registerPortalMaterialComponent,
  unregisterPortalMaterialComponent
} from './material-component-loader';
import type {
  PortalMaterialConfig,
  PortalMaterialDescriptor,
  PortalMaterialExtension
} from './extensions';

const DEFAULT_CATEGORY: PortalMaterialCategoryInput = {
  id: 'basic',
  name: '基础组件',
  title: '基础组件',
  cmptTypeName: '基础组件'
};

function ensureExtensionCategory(
  categories: PortalMaterialCategory[],
  categoryInput: PortalMaterialCategoryInput
) {
  const existingCategory = categories.find((category) => category.id === categoryInput.id);
  if (existingCategory) {
    if (categoryInput.name !== undefined) {
      existingCategory.name = categoryInput.name;
    }
    if (categoryInput.title !== undefined) {
      existingCategory.title = categoryInput.title;
    }
    if (categoryInput.cmptTypeName !== undefined) {
      existingCategory.cmptTypeName = categoryInput.cmptTypeName;
    }
    return;
  }

  categories.push({
    id: categoryInput.id,
    name: categoryInput.name,
    title: categoryInput.title,
    cmptTypeName: categoryInput.cmptTypeName,
    cmptList: []
  });
}

function resolveSectionName(config: PortalMaterialConfig, section: 'index' | 'content' | 'style') {
  const sectionConfig = config[section];
  const sectionName = typeof sectionConfig?.name === 'string' ? sectionConfig.name.trim() : '';
  return sectionName || null;
}

function resolveMaterialCategory(
  extension: PortalMaterialExtension,
  material: PortalMaterialDescriptor
): PortalMaterialCategoryInput {
  return material.category ?? extension.category ?? DEFAULT_CATEGORY;
}

function registerMaterialSections(
  context: PortalEngineContext,
  material: PortalMaterialDescriptor
) {
  const sectionTuples = [
    ['index', material.components.index],
    ['content', material.components.content],
    ['style', material.components.style]
  ] as const;

  let registeredSectionCount = 0;

  for (const [section, component] of sectionTuples) {
    const sectionName = resolveSectionName(material.config, section);
    if (!sectionName) {
      continue;
    }
    if (!component) {
      throw new Error(`[portal-engine] 物料 ${material.type} 缺少 ${section} 组件实现`);
    }

    registerPortalMaterialComponent(
      {
        name: sectionName,
        component,
        aliases: material.aliases?.[section],
        strategy: 'replace'
      },
      context
    );
    registeredSectionCount += 1;
  }

  if (registeredSectionCount === 0) {
    throw new Error(`[portal-engine] 物料 ${material.type} 未声明任何可注册的组件 section.name`);
  }
}

export function registerMaterialExtensions(
  context: PortalEngineContext = getDefaultPortalEngineContext(),
  extensions: PortalMaterialExtension[] = []
) {
  if (!extensions.length) {
    return;
  }

  const registryController = getPortalMaterialRegistryController(context);

  for (const extension of extensions) {
    if (extension.category) {
      ensureExtensionCategory(registryController.categories, extension.category);
    }

    for (const material of extension.materials ?? []) {
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
          category: resolveMaterialCategory(extension, material),
          strategy: 'replace'
        }
      );

      registerMaterialSections(context, material);
    }
  }
}

export function unregisterMaterialExtensions(
  context: PortalEngineContext = getDefaultPortalEngineContext(),
  extensions: PortalMaterialExtension[] = []
) {
  if (!extensions.length) {
    return;
  }

  const registryController = getPortalMaterialRegistryController(context);

  for (const extension of extensions) {
    for (const material of extension.materials ?? []) {
      registryController.unregisterPortalMaterial({
        id: material.id,
        type: material.type
      });

      for (const section of ['index', 'content', 'style'] as const) {
        const sectionName = resolveSectionName(material.config, section);
        if (!sectionName) {
          continue;
        }
        unregisterPortalMaterialComponent(sectionName, material.aliases?.[section] ?? [], context);
      }
    }
  }
}
