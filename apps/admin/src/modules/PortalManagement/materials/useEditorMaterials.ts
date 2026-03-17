import { useEditorMaterials as usePortalEngineEditorMaterials } from '@one-base-template/portal-engine';

import { setupPortalEngineForAdmin } from '../engine/register';

export function useEditorMaterials() {
  const context = setupPortalEngineForAdmin();
  return usePortalEngineEditorMaterials(context);
}
