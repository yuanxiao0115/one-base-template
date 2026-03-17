import type { PortalEngineContext } from '../runtime/context';

import { usePortalMaterialCatalog } from './usePortalMaterialCatalog';

export function useEditorMaterials(context?: PortalEngineContext) {
  return usePortalMaterialCatalog({
    context,
    scene: 'editor'
  });
}
