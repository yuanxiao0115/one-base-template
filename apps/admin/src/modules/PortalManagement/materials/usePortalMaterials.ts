import {
  useEditorMaterials as usePortalEngineEditorMaterials,
  useRendererMaterials as usePortalEngineRendererMaterials
} from '@one-base-template/portal-engine';

import { setupPortalEngineForAdmin } from '../engine/register';

type PortalMaterialScene = 'editor' | 'renderer';

export function usePortalMaterials(scene: PortalMaterialScene) {
  const context = setupPortalEngineForAdmin();
  if (scene === 'renderer') {
    return usePortalEngineRendererMaterials(context);
  }
  return usePortalEngineEditorMaterials(context);
}
