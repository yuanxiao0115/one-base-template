import type { Component } from 'vue';

import type { PortalMaterialCategory } from '../../registry/materials-registry.types';
import { getPortalMaterialRegistryController } from '../../registry/materials-registry';
import type { PortalEngineContext } from '../../runtime/context';
import { getDefaultPortalEngineContext } from '../../runtime/context';
import {
  createPortalMaterialsMap,
  type MaterialModule,
  type PortalMaterialComponentSection,
  type StaticMaterialFallback
} from '../material-component-loader';

export interface PortalMaterialCatalogResult {
  categories: PortalMaterialCategory[];
  materialsMap: Record<string, Component>;
}

interface CreatePortalMaterialCatalogOptions {
  context?: PortalEngineContext;
  sections: PortalMaterialComponentSection[];
  modulesBySection: Partial<Record<PortalMaterialComponentSection, Record<string, MaterialModule>>>;
  staticFallbacks: StaticMaterialFallback[];
}

export function createPortalMaterialCatalog(
  options: CreatePortalMaterialCatalogOptions
): PortalMaterialCatalogResult {
  const context = options.context ?? getDefaultPortalEngineContext();
  const categories = getPortalMaterialRegistryController(context).categories;
  const materialsMap = createPortalMaterialsMap({
    context,
    sections: options.sections,
    modulesBySection: options.modulesBySection,
    staticFallbacks: options.staticFallbacks
  });

  return {
    categories,
    materialsMap
  };
}
