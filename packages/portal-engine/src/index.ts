export interface PortalEngineOptions {
  appId?: string;
}

export function createPortalEngine(options: PortalEngineOptions = {}) {
  void options;
  return {
    name: '@one-base-template/portal-engine',
  };
}

export type { BizResponse, PageResult, PortalTab, PortalTemplate } from './schema/types';
export type { SchemaConfigOptions, SchemaConfigResult, SectionConfig } from './composables/useSchemaConfig';
export { useSchemaConfig } from './composables/useSchemaConfig';
export { deepClone, deepEqual } from './utils/deep';
export { useMaterials } from './materials/useMaterials';
export { cmsApi, getPortalCmsApi, setPortalCmsApi } from './materials/api';
export { portalMaterialsRegistry, portalMaterialTypeAliases, resolvePortalMaterialTypeAlias } from './registry/materials-registry';
export type { PortalLayoutItem } from './stores/pageLayout';
export { usePortalPageLayoutStore } from './stores/pageLayout';
export { default as GridLayoutEditor } from './editor/GridLayoutEditor.vue';
export { default as PropertyPanel } from './editor/PropertyPanel.vue';
export { default as MaterialLibrary } from './editor/MaterialLibrary.vue';
export { default as PortalGridRenderer } from './renderer/PortalGridRenderer.vue';
