import relatedLinksConfig from '../materials/cms/related-links/config.json';
import imageTextListConfig from '../materials/cms/image-text-list/config.json';
import documentCardListConfig from '../materials/cms/document-card-list/config.json';
import imageTextColumnConfig from '../materials/cms/image-text-column/config.json';
import carouselTextListConfig from '../materials/cms/carousel-text-list/config.json';
import placeholderBlockConfig from '../materials/base/placeholder-block/config.json';

import baseConfig from '../materials/cms/common/base-config.json';
import { createComponentGroup } from './utils/component-factory';
import type {
  PortalMaterialCategory,
  PortalMaterialCategoryInput,
  PortalMaterialItem,
  PortalMaterialRegistry,
  PortalMaterialRegistryController,
  RegisterPortalMaterialOptions,
  UnregisterPortalMaterialOptions,
} from './materials-registry.types';

import iconLink from './images/icon_link.png';
import iconCarousel from './images/icon_carousel.png';
import iconContent from './images/icon_content.png';

const transparentPlaceholderConfig = {
  index: {
    name: 'pb-transparent-placeholder-index',
  },
  content: {
    name: 'pb-transparent-placeholder-content',
  },
  style: {
    name: 'pb-transparent-placeholder-style',
  },
};

/**
 * 物料注册表（前端维护）
 *
 * 约束：
 * - 当前内置分类：基础组件（basic） + CMS专区（cms）
 * - 暂不注册：pb-app-entrance / pb-image-link-list（依赖较重，后续再补）
 */
const basicComponents = createComponentGroup(
  [
    {
      id: 'basic-placeholder-block',
      type: 'basic-placeholder-block',
      name: 'HTML模块',
      width: 12,
      height: 18,
      icon: iconContent,
      config: placeholderBlockConfig,
    },
    {
      id: 'basic-transparent-placeholder',
      type: 'basic-transparent-placeholder',
      name: '透明占位模块',
      width: 12,
      height: 6,
      icon: iconContent,
      config: transparentPlaceholderConfig,
    },
  ],
  baseConfig
);

const cmsComponents = createComponentGroup(
  [
    {
      id: 'cms-related-links',
      type: 'cms-related-links',
      name: '相关链接',
      width: 12,
      height: 50,
      icon: iconLink,
      config: relatedLinksConfig,
    },
    {
      id: 'cms-image-text-list',
      type: 'cms-image-text-list',
      name: '专栏模块',
      width: 12,
      height: 50,
      icon: iconContent,
      config: imageTextListConfig,
    },
    {
      id: 'cms-image-text-column',
      type: 'cms-image-text-column',
      name: '图文专栏',
      width: 12,
      height: 50,
      icon: iconContent,
      config: imageTextColumnConfig,
    },
    {
      id: 'cms-document-card-list',
      type: 'cms-document-card-list',
      name: '文件专栏卡片',
      width: 12,
      height: 50,
      icon: iconCarousel,
      config: documentCardListConfig,
    },
    {
      id: 'cms-carousel-text-list',
      type: 'cms-carousel-text-list',
      name: '图文轮播',
      width: 12,
      height: 50,
      icon: iconCarousel,
      config: carouselTextListConfig,
    },
  ],
  baseConfig
);

function cloneMaterialItem(item: PortalMaterialItem): PortalMaterialItem {
  return { ...item };
}

function cloneMaterialCategory(category: PortalMaterialCategory): PortalMaterialCategory {
  return {
    ...category,
    cmptList: category.cmptList.map((item) => cloneMaterialItem(item)),
  };
}

function findMaterialCategory(
  categories: PortalMaterialCategory[],
  categoryId: string
): PortalMaterialCategory | undefined {
  return categories.find((category) => category.id === categoryId);
}

function ensureMaterialCategory(
  categories: PortalMaterialCategory[],
  categoryInput: PortalMaterialCategoryInput
): PortalMaterialCategory {
  const existingCategory = findMaterialCategory(categories, categoryInput.id);
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
    return existingCategory;
  }

  const newCategory: PortalMaterialCategory = {
    id: categoryInput.id,
    name: categoryInput.name,
    title: categoryInput.title,
    cmptTypeName: categoryInput.cmptTypeName,
    cmptList: [],
  };
  categories.push(newCategory);
  return newCategory;
}

function hasMaterialConflict(
  categories: PortalMaterialCategory[],
  material: PortalMaterialItem
): { categoryId: string; itemId: string; itemType: string } | null {
  for (const category of categories) {
    for (const item of category.cmptList) {
      if (item.id === material.id || item.type === material.type) {
        return {
          categoryId: category.id,
          itemId: item.id,
          itemType: item.type,
        };
      }
    }
  }
  return null;
}

function removeMaterialByIdOrType(categories: PortalMaterialCategory[], id?: string, type?: string): boolean {
  if (!id && !type) {
    return false;
  }

  let removed = false;
  for (const category of categories) {
    const nextList = category.cmptList.filter((item) => {
      const byId = id ? item.id === id : false;
      const byType = type ? item.type === type : false;
      return !(byId || byType);
    });
    if (nextList.length !== category.cmptList.length) {
      removed = true;
      category.cmptList = nextList;
    }
  }
  return removed;
}

function registerPortalMaterialToRegistry(
  registry: PortalMaterialRegistry,
  material: PortalMaterialItem,
  options: RegisterPortalMaterialOptions
) {
  const strategy = options.strategy === 'replace' ? 'replace' : 'reject';
  const clonedMaterial = cloneMaterialItem(material);
  const conflict = hasMaterialConflict(registry.categories, clonedMaterial);

  /**
   * 冲突策略说明：
   * - 默认 reject：发现任意 id/type 冲突即抛错，防止业务侧无感覆盖内置物料。
   * - 可选 replace：先全局移除冲突项（按 id/type），再写入新物料，实现显式覆盖。
   */
  if (conflict && strategy === 'reject') {
    throw new Error(
      `[portal-engine] 注册物料冲突：category=${conflict.categoryId}, id=${conflict.itemId}, type=${conflict.itemType}`
    );
  }

  if (conflict && strategy === 'replace') {
    removeMaterialByIdOrType(registry.categories, clonedMaterial.id, clonedMaterial.type);
  }

  const targetCategory = ensureMaterialCategory(registry.categories, options.category);
  if (typeof options.index === 'number' && Number.isInteger(options.index)) {
    const safeIndex = Math.max(0, Math.min(options.index, targetCategory.cmptList.length));
    targetCategory.cmptList.splice(safeIndex, 0, clonedMaterial);
    return;
  }
  targetCategory.cmptList.push(clonedMaterial);
}

function unregisterPortalMaterialFromRegistry(
  registry: PortalMaterialRegistry,
  options: UnregisterPortalMaterialOptions
): boolean {
  if (!options.id && !options.type) {
    return false;
  }

  const targetCategories = options.categoryId
    ? registry.categories.filter((category) => category.id === options.categoryId)
    : registry.categories;

  return removeMaterialByIdOrType(targetCategories, options.id, options.type);
}

const defaultCategories: PortalMaterialCategory[] = [
  {
    id: 'basic',
    name: '基础组件',
    cmptTypeName: '基础组件',
    title: '基础组件',
    cmptList: basicComponents,
  },
  {
    id: 'cms',
    name: 'CMS专区',
    cmptTypeName: 'CMS专区',
    title: 'CMS专区',
    cmptList: cmsComponents,
  },
];

export function createPortalMaterialRegistry(
  initialCategories: PortalMaterialCategory[] = []
): PortalMaterialRegistryController {
  const categories = initialCategories.map((category) => cloneMaterialCategory(category));
  const registry: PortalMaterialRegistry = { categories };

  return {
    categories: registry.categories,
    registerPortalMaterial: (material, options) => registerPortalMaterialToRegistry(registry, material, options),
    unregisterPortalMaterial: (options) => unregisterPortalMaterialFromRegistry(registry, options),
  };
}

const defaultRegistryController = createPortalMaterialRegistry(defaultCategories);

export const portalMaterialTypeAliases: Record<string, string> = {
  'pb-related-links': 'cms-related-links',
  'pb-image-text-list': 'cms-image-text-list',
  'pb-image-text-column': 'cms-image-text-column',
  'pb-document-card-list': 'cms-document-card-list',
  'pb-carousel-text-list': 'cms-carousel-text-list',
  'pb-placeholder-block': 'basic-placeholder-block',
  'pb-transparent-placeholder': 'basic-transparent-placeholder',
};

export function resolvePortalMaterialTypeAlias(type: string) {
  return portalMaterialTypeAliases[type] ?? type;
}

export const portalMaterialsRegistry: PortalMaterialRegistry = {
  categories: defaultRegistryController.categories,
};

export const registerPortalMaterial = defaultRegistryController.registerPortalMaterial;

export const unregisterPortalMaterial = defaultRegistryController.unregisterPortalMaterial;
