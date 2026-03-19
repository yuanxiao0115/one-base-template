import {
  registerPortalMaterialComponent,
  unregisterPortalMaterialComponent,
  type RegisterPortalMaterialComponentOptions
} from './material-component-loader';
import type { PortalEngineContext } from '../runtime/context';
import { useEditorMaterials } from './useEditorMaterials';

export type { RegisterPortalMaterialComponentOptions };
export { registerPortalMaterialComponent, unregisterPortalMaterialComponent };

export function useMaterials(context?: PortalEngineContext) {
  return useEditorMaterials(context);
}
