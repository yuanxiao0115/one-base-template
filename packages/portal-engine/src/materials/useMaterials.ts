import {
  registerPortalMaterialComponent,
  unregisterPortalMaterialComponent,
  type RegisterPortalMaterialComponentOptions
} from './material-component-loader';
import { useEditorMaterials } from './useEditorMaterials';

export type { RegisterPortalMaterialComponentOptions };
export { registerPortalMaterialComponent, unregisterPortalMaterialComponent };

export function useMaterials() {
  return useEditorMaterials();
}
