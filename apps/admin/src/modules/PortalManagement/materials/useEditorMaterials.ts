import { useEditorMaterials as usePortalEngineEditorMaterials } from '@one-base-template/portal-engine';

import { setupPortalEngineForAdmin } from '../engine/register';

export function useEditorMaterials() {
  setupPortalEngineForAdmin();
  return usePortalEngineEditorMaterials();
}
