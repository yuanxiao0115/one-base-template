import type { PortalEngineContext } from '../runtime/context';

import { usePortalMaterialCatalog } from './usePortalMaterialCatalog';

export function useRendererMaterials(context?: PortalEngineContext) {
  return usePortalMaterialCatalog({
    context,
    scene: 'renderer'
  });
}
