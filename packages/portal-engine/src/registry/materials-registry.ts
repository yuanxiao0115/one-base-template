import relatedLinksConfig from '../materials/cms/related-links/config.json';
import imageTextListConfig from '../materials/cms/image-text-list/config.json';
import documentCardListConfig from '../materials/cms/document-card-list/config.json';
import imageTextColumnConfig from '../materials/cms/image-text-column/config.json';
import carouselTextListConfig from '../materials/cms/carousel-text-list/config.json';

import baseConfig from '../materials/cms/common/base-config.json';
import { createComponentGroup } from './utils/component-factory';

import iconLink from './images/icon_link.png';
import iconCarousel from './images/icon_carousel.png';
import iconContent from './images/icon_content.png';

/**
 * 物料注册表（前端维护）
 *
 * 约束：
 * - 先闭环：仅注册 CMS专区（cms）
 * - 暂不注册：pb-app-entrance / pb-image-link-list（依赖较重，后续再补）
 */
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

export const portalMaterialTypeAliases: Record<string, string> = {
  'pb-related-links': 'cms-related-links',
  'pb-image-text-list': 'cms-image-text-list',
  'pb-image-text-column': 'cms-image-text-column',
  'pb-document-card-list': 'cms-document-card-list',
  'pb-carousel-text-list': 'cms-carousel-text-list',
};

export function resolvePortalMaterialTypeAlias(type: string) {
  return portalMaterialTypeAliases[type] ?? type;
}

export const portalMaterialsRegistry = {
  categories: [
    {
      id: 'cms',
      name: 'CMS专区',
      cmptTypeName: 'CMS专区',
      title: 'CMS专区',
      cmptList: cmsComponents,
    },
  ],
};
