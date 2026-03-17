import type { Component } from 'vue';

import type { PortalMaterialCategory } from '../registry/materials-registry.types';
import type { PortalEngineContext } from '../runtime/context';
import { getDefaultPortalEngineContext } from '../runtime/context';
import { getPortalMaterialRegistryController } from '../registry/materials-registry';

import { createPortalMaterialsMap, type MaterialModule } from './material-component-loader';
import { STATIC_CONTENT_MATERIAL_FALLBACKS } from './static-fallbacks/content-fallbacks';
import { STATIC_INDEX_MATERIAL_FALLBACKS } from './static-fallbacks/index-fallbacks';
import { STATIC_STYLE_MATERIAL_FALLBACKS } from './static-fallbacks/style-fallbacks';

export type PortalMaterialCatalogScene = 'editor' | 'renderer';

export interface UsePortalMaterialCatalogOptions {
  context?: PortalEngineContext;
  scene?: PortalMaterialCatalogScene;
}

export interface PortalMaterialCatalog {
  categories: PortalMaterialCategory[];
  materialsMap: Record<string, Component>;
}

const EDITOR_MATERIAL_STATIC_FALLBACKS = [
  ...STATIC_INDEX_MATERIAL_FALLBACKS,
  ...STATIC_CONTENT_MATERIAL_FALLBACKS,
  ...STATIC_STYLE_MATERIAL_FALLBACKS
];

const indexModules = {
  ...import.meta.glob<MaterialModule>('./*/**/index.vue', { eager: true })
};

const contentModules = {
  ...import.meta.glob<MaterialModule>('./*/**/content.vue', { eager: true })
};

const styleModules = {
  ...import.meta.glob<MaterialModule>('./*/**/style.vue', { eager: true })
};

export function usePortalMaterialCatalog(
  options: UsePortalMaterialCatalogOptions = {}
): PortalMaterialCatalog {
  const context = options.context ?? getDefaultPortalEngineContext();
  const scene = options.scene ?? 'editor';
  const categories = getPortalMaterialRegistryController(context).categories;
  const materialsMap = createPortalMaterialsMap({
    context,
    sections: scene === 'renderer' ? ['index'] : ['index', 'content', 'style'],
    modulesBySection:
      scene === 'renderer'
        ? {
            index: indexModules
          }
        : {
            index: indexModules,
            content: contentModules,
            style: styleModules
          },
    staticFallbacks:
      scene === 'renderer' ? STATIC_INDEX_MATERIAL_FALLBACKS : EDITOR_MATERIAL_STATIC_FALLBACKS
  });

  return {
    categories,
    materialsMap
  };
}
