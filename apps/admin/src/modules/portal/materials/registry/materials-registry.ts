import relatedLinksConfig from '../party-building/related-links/config.json';
import imageTextListConfig from '../party-building/image-text-list/config.json';
import documentCardListConfig from '../party-building/document-card-list/config.json';
import imageTextColumnConfig from '../party-building/image-text-column/config.json';
import carouselTextListConfig from '../party-building/carousel-text-list/config.json';

import baseConfig from '../party-building/common/base-config.json';
import { createComponentGroup } from './utils/component-factory';

import iconLink from './images/icon_link.png';
import iconCarousel from './images/icon_carousel.png';
import iconContent from './images/icon_content.png';

/**
 * 物料注册表（前端维护）
 *
 * 约束：
 * - 先闭环：仅注册 CMS专区（party-building）
 * - 暂不注册：pb-app-entrance / pb-image-link-list（依赖较重，后续再补）
 */
const partyBuildingComponents = createComponentGroup(
  [
    {
      id: 'pb-related-links',
      type: 'pb-related-links',
      name: '相关链接',
      width: 12,
      height: 50,
      icon: iconLink,
      config: relatedLinksConfig
    },
    {
      id: 'pb-image-text-list',
      type: 'pb-image-text-list',
      name: '专栏模块',
      width: 12,
      height: 50,
      icon: iconContent,
      config: imageTextListConfig
    },
    {
      id: 'pb-image-text-column',
      type: 'pb-image-text-column',
      name: '图文专栏',
      width: 12,
      height: 50,
      icon: iconContent,
      config: imageTextColumnConfig
    },
    {
      id: 'pb-document-card-list',
      type: 'pb-document-card-list',
      name: '文件专栏卡片',
      width: 12,
      height: 50,
      icon: iconCarousel,
      config: documentCardListConfig
    },
    {
      id: 'pb-carousel-text-list',
      type: 'pb-carousel-text-list',
      name: '图文轮播',
      width: 12,
      height: 50,
      icon: iconCarousel,
      config: carouselTextListConfig
    }
  ],
  baseConfig
);

export const portalMaterialsRegistry = {
  categories: [
    {
      id: 'party-building',
      name: 'CMS专区',
      cmptTypeName: 'CMS专区',
      title: 'CMS专区',
      cmptList: partyBuildingComponents
    }
  ]
};

