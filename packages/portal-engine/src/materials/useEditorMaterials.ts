import type { PortalEngineContext } from '../runtime/context';

import { createEditorPortalMaterialCatalog } from './catalog/editor';

export function useEditorMaterials(context?: PortalEngineContext) {
  return createEditorPortalMaterialCatalog(context);
}
