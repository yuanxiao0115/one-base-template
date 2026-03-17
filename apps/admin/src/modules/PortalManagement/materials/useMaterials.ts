import { useMaterials as usePortalEngineMaterials } from '@one-base-template/portal-engine';

import { setupPortalEngineForAdmin } from '../engine/register';

export function useMaterials() {
  const context = setupPortalEngineForAdmin();
  return usePortalEngineMaterials(context);
}
