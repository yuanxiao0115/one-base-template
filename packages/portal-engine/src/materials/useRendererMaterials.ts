import type { PortalEngineContext } from '../runtime/context';

import { createRendererPortalMaterialCatalog } from './catalog/renderer';

export function useRendererMaterials(context?: PortalEngineContext) {
  return createRendererPortalMaterialCatalog(context);
}
