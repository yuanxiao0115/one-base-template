import { useMaterials as usePortalEngineMaterials } from '@one-base-template/portal-engine';

import { setupPortalEngineForAdmin } from '../engine/register';

export function useMaterials() {
  setupPortalEngineForAdmin();
  return usePortalEngineMaterials();
}
