import { createPortalMaterialsMap, type MaterialModule } from './material-component-loader';
import { STATIC_CONTENT_MATERIAL_FALLBACKS } from './static-fallbacks/content-fallbacks';
import { STATIC_INDEX_MATERIAL_FALLBACKS } from './static-fallbacks/index-fallbacks';
import { STATIC_STYLE_MATERIAL_FALLBACKS } from './static-fallbacks/style-fallbacks';

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

export function useEditorMaterials() {
  const materialsMap = createPortalMaterialsMap({
    sections: ['index', 'content', 'style'],
    modulesBySection: {
      index: indexModules,
      content: contentModules,
      style: styleModules
    },
    staticFallbacks: EDITOR_MATERIAL_STATIC_FALLBACKS
  });

  return { materialsMap };
}
