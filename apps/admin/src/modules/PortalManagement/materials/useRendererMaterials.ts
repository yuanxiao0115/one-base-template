import { useRendererMaterials as usePortalEngineRendererMaterials } from '@one-base-template/portal-engine';

import { setupPortalEngineForAdmin } from '../engine/register';

export function useRendererMaterials() {
  const context = setupPortalEngineForAdmin();
  return usePortalEngineRendererMaterials(context);
}
