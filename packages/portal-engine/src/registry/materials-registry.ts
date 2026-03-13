import relatedLinksConfig from '../materials/cms/related-links/config.json';
import imageTextListConfig from '../materials/cms/image-text-list/config.json';
import documentCardListConfig from '../materials/cms/document-card-list/config.json';
import imageTextColumnConfig from '../materials/cms/image-text-column/config.json';
import carouselTextListConfig from '../materials/cms/carousel-text-list/config.json';
import placeholderBlockConfig from '../materials/base/placeholder-block/config.json';
import baseImageConfig from '../materials/base/base-image/config.json';
import baseCarouselConfig from '../materials/base/base-carousel/config.json';
import baseTextConfig from '../materials/base/base-text/config.json';
import baseTableConfig from '../materials/base/base-table/config.json';
import baseIframeContainerConfig from '../materials/base/base-iframe-container/config.json';
import baseTabContainerConfig from '../materials/base/base-tab-container/config.json';
import appEntranceConfig from '../materials/base/app-entrance/config.json';
import imageLinkListConfig from '../materials/base/image-link-list/config.json';
import baseButtonGroupConfig from '../materials/base/base-button-group/config.json';
import baseSearchBoxConfig from '../materials/base/base-search-box/config.json';
import baseNoticeConfig from '../materials/base/base-notice/config.json';
import baseCardListConfig from '../materials/base/base-card-list/config.json';
import baseFormConfig from '../materials/base/base-form/config.json';
import baseStatConfig from '../materials/base/base-stat/config.json';
import baseFileListConfig from '../materials/base/base-file-list/config.json';
import baseTimelineConfig from '../materials/base/base-timeline/config.json';

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

const MATERIAL_ICON_MAP = {
  htmlBlock: 'ri:code-line',
  transparentPlaceholder: 'ri:shape-line',
  baseImage: 'ri:image-2-line',
  baseCarousel: 'ri:slideshow-3-line',
  baseText: 'ri:text',
  baseTable: 'ri:table-line',
  baseIframeContainer: 'ri:window-2-line',
  baseTabContainer: 'ri:apps-2-line',
  appEntrance: 'ri:apps-2-line',
  imageLinkList: 'ri:gallery-line',
  baseButtonGroup: 'ri:cursor-line',
  baseSearchBox: 'ri:search-line',
  baseNotice: 'ri:notification-3-line',
  baseCardList: 'ri:layout-grid-line',
  baseForm: 'ri:file-edit-line',
  baseStat: 'ri:bar-chart-box-line',
  baseFileList: 'ri:file-list-3-line',
  baseTimeline: 'ri:timeline-view',
  relatedLinks: 'ri:links-line',
  imageTextList: 'ri:article-line',
  imageTextColumn: 'ri:image-line',
  documentCardList: 'ri:file-line',
  carouselTextList: 'ri:slideshow-line',
} as const;

const transparentPlaceholderConfig = {
  index: {
    name: 'base-transparent-placeholder-index',
  },
  content: {
    name: 'base-transparent-placeholder-content',
  },
  style: {
    name: 'base-transparent-placeholder-style',
  },
};

/**
 * 物料注册表（前端维护）
 *
 * 约束：
 * - 当前内置分类：基础组件（basic） + CMS专区（cms）
 */
const basicComponents = createComponentGroup(
  [
    {
      id: 'basic-placeholder-block',
      type: 'basic-placeholder-block',
      name: 'HTML模块',
      width: 12,
      height: 18,
      icon: MATERIAL_ICON_MAP.htmlBlock,
      config: placeholderBlockConfig,
    },
    {
      id: 'basic-transparent-placeholder',
      type: 'basic-transparent-placeholder',
      name: '透明占位模块',
      width: 12,
      height: 6,
      icon: MATERIAL_ICON_MAP.transparentPlaceholder,
      config: transparentPlaceholderConfig,
    },
    {
      id: 'basic-base-image',
      type: 'basic-base-image',
      name: '图片物料',
      width: 12,
      height: 20,
      icon: MATERIAL_ICON_MAP.baseImage,
      config: baseImageConfig,
    },
    {
      id: 'basic-base-carousel',
      type: 'basic-base-carousel',
      name: '轮播图',
      width: 12,
      height: 24,
      icon: MATERIAL_ICON_MAP.baseCarousel,
      config: baseCarouselConfig,
    },
    {
      id: 'basic-base-text',
      type: 'basic-base-text',
      name: '文字组件',
      width: 12,
      height: 16,
      icon: MATERIAL_ICON_MAP.baseText,
      config: baseTextConfig,
    },
    {
      id: 'basic-base-table',
      type: 'basic-base-table',
      name: '数据表格',
      width: 12,
      height: 26,
      icon: MATERIAL_ICON_MAP.baseTable,
      config: baseTableConfig,
    },
    {
      id: 'basic-base-iframe-container',
      type: 'basic-base-iframe-container',
      name: 'Iframe容器',
      width: 12,
      height: 26,
      icon: MATERIAL_ICON_MAP.baseIframeContainer,
      config: baseIframeContainerConfig,
    },
    {
      id: 'basic-base-tab-container',
      type: 'basic-base-tab-container',
      name: 'Tab容器',
      width: 12,
      height: 28,
      icon: MATERIAL_ICON_MAP.baseTabContainer,
      config: baseTabContainerConfig,
    },
    {
      id: 'basic-app-entrance',
      type: 'basic-app-entrance',
      name: '应用入口',
      width: 12,
      height: 20,
      icon: MATERIAL_ICON_MAP.appEntrance,
      config: appEntranceConfig,
    },
    {
      id: 'basic-image-link-list',
      type: 'basic-image-link-list',
      name: '图文链接列表',
      width: 12,
      height: 20,
      icon: MATERIAL_ICON_MAP.imageLinkList,
      config: imageLinkListConfig,
    },
    {
      id: 'basic-base-button-group',
      type: 'basic-base-button-group',
      name: '按钮组',
      width: 12,
      height: 14,
      icon: MATERIAL_ICON_MAP.baseButtonGroup,
      config: baseButtonGroupConfig,
    },
    {
      id: 'basic-base-search-box',
      type: 'basic-base-search-box',
      name: '搜索框',
      width: 12,
      height: 14,
      icon: MATERIAL_ICON_MAP.baseSearchBox,
      config: baseSearchBoxConfig,
    },
    {
      id: 'basic-base-notice',
      type: 'basic-base-notice',
      name: '通知公告',
      width: 12,
      height: 14,
      icon: MATERIAL_ICON_MAP.baseNotice,
      config: baseNoticeConfig,
    },
    {
      id: 'basic-base-card-list',
      type: 'basic-base-card-list',
      name: '卡片列表',
      width: 12,
      height: 22,
      icon: MATERIAL_ICON_MAP.baseCardList,
      config: baseCardListConfig,
    },
    {
      id: 'basic-base-form',
      type: 'basic-base-form',
      name: '表单组件',
      width: 12,
      height: 24,
      icon: MATERIAL_ICON_MAP.baseForm,
      config: baseFormConfig,
    },
    {
      id: 'basic-base-stat',
      type: 'basic-base-stat',
      name: '统计卡片',
      width: 12,
      height: 16,
      icon: MATERIAL_ICON_MAP.baseStat,
      config: baseStatConfig,
    },
    {
      id: 'basic-base-file-list',
      type: 'basic-base-file-list',
      name: '文件列表',
      width: 12,
      height: 20,
      icon: MATERIAL_ICON_MAP.baseFileList,
      config: baseFileListConfig,
    },
    {
      id: 'basic-base-timeline',
      type: 'basic-base-timeline',
      name: '时间轴',
      width: 12,
      height: 20,
      icon: MATERIAL_ICON_MAP.baseTimeline,
      config: baseTimelineConfig,
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
      icon: MATERIAL_ICON_MAP.relatedLinks,
      config: relatedLinksConfig,
    },
    {
      id: 'cms-image-text-list',
      type: 'cms-image-text-list',
      name: '专栏模块',
      width: 12,
      height: 50,
      icon: MATERIAL_ICON_MAP.imageTextList,
      config: imageTextListConfig,
    },
    {
      id: 'cms-image-text-column',
      type: 'cms-image-text-column',
      name: '图文专栏',
      width: 12,
      height: 50,
      icon: MATERIAL_ICON_MAP.imageTextColumn,
      config: imageTextColumnConfig,
    },
    {
      id: 'cms-document-card-list',
      type: 'cms-document-card-list',
      name: '文件专栏卡片',
      width: 12,
      height: 50,
      icon: MATERIAL_ICON_MAP.documentCardList,
      config: documentCardListConfig,
    },
    {
      id: 'cms-carousel-text-list',
      type: 'cms-carousel-text-list',
      name: '图文轮播',
      width: 12,
      height: 50,
      icon: MATERIAL_ICON_MAP.carouselTextList,
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

export const portalMaterialTypeAliases: Record<string, string> = {};

export function resolvePortalMaterialTypeAlias(type: string) {
  return portalMaterialTypeAliases[type] ?? type;
}

export const portalMaterialsRegistry: PortalMaterialRegistry = {
  categories: defaultRegistryController.categories,
};

export const registerPortalMaterial = defaultRegistryController.registerPortalMaterial;

export const unregisterPortalMaterial = defaultRegistryController.unregisterPortalMaterial;
