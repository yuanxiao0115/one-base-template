import type { PortalEngineContext } from '../runtime/context';
import type { PortalMaterialCatalogResult } from './catalog/shared';
import { createEditorPortalMaterialCatalog } from './catalog/editor';
import { createRendererPortalMaterialCatalog } from './catalog/renderer';

export type PortalMaterialCatalogScene = 'editor' | 'renderer';

export interface UsePortalMaterialCatalogOptions {
  context?: PortalEngineContext;
  scene?: PortalMaterialCatalogScene;
}

export type PortalMaterialCatalog = PortalMaterialCatalogResult;

export function usePortalMaterialCatalog(
  options: UsePortalMaterialCatalogOptions = {}
): PortalMaterialCatalog {
  const context = options.context;
  const scene = options.scene ?? 'editor';
  if (scene === 'renderer') {
    return createRendererPortalMaterialCatalog(context);
  }
  return createEditorPortalMaterialCatalog(context);
}
