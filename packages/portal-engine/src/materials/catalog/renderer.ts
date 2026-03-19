import type { PortalEngineContext } from '../../runtime/context';
import { type MaterialModule } from '../material-component-loader';
import { STATIC_INDEX_MATERIAL_FALLBACKS } from '../static-fallbacks/index-fallbacks';

import { createPortalMaterialCatalog } from './shared';

const indexModules = {
  ...import.meta.glob<MaterialModule>('../*/**/index.vue', { eager: true })
};

export function createRendererPortalMaterialCatalog(context?: PortalEngineContext) {
  return createPortalMaterialCatalog({
    context,
    sections: ['index'],
    modulesBySection: {
      index: indexModules
    },
    staticFallbacks: STATIC_INDEX_MATERIAL_FALLBACKS
  });
}
