import type { PortalEngineContext } from '../../runtime/context';
import { type MaterialModule } from '../material-component-loader';
import { STATIC_CONTENT_MATERIAL_FALLBACKS } from '../static-fallbacks/content-fallbacks';
import { STATIC_INDEX_MATERIAL_FALLBACKS } from '../static-fallbacks/index-fallbacks';
import { STATIC_STYLE_MATERIAL_FALLBACKS } from '../static-fallbacks/style-fallbacks';

import { createPortalMaterialCatalog } from './shared';

const indexModules = {
  ...import.meta.glob<MaterialModule>('../*/**/index.vue', { eager: true })
};

const contentModules = {
  ...import.meta.glob<MaterialModule>('../*/**/content.vue', { eager: true })
};

const styleModules = {
  ...import.meta.glob<MaterialModule>('../*/**/style.vue', { eager: true })
};

const editorStaticFallbacks = [
  ...STATIC_INDEX_MATERIAL_FALLBACKS,
  ...STATIC_CONTENT_MATERIAL_FALLBACKS,
  ...STATIC_STYLE_MATERIAL_FALLBACKS
];

export function createEditorPortalMaterialCatalog(context?: PortalEngineContext) {
  return createPortalMaterialCatalog({
    context,
    sections: ['index', 'content', 'style'],
    modulesBySection: {
      index: indexModules,
      content: contentModules,
      style: styleModules
    },
    staticFallbacks: editorStaticFallbacks
  });
}
