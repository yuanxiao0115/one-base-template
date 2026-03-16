import { createPortalMaterialsMap, type MaterialModule } from './material-component-loader';
import { STATIC_INDEX_MATERIAL_FALLBACKS } from './static-fallbacks/index-fallbacks';

const indexModules = {
  ...import.meta.glob<MaterialModule>('./*/**/index.vue', { eager: true })
};

export function useRendererMaterials() {
  const materialsMap = createPortalMaterialsMap({
    sections: ['index'],
    modulesBySection: {
      index: indexModules
    },
    staticFallbacks: STATIC_INDEX_MATERIAL_FALLBACKS
  });

  return { materialsMap };
}
