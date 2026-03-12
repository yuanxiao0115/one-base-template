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
export type {
  PortalPageAccessMode,
  PortalPageAccessSettings,
  PortalPageBackgroundAttachment,
  PortalPageBackgroundRepeat,
  PortalPageBackgroundScope,
  PortalPageBackgroundSettings,
  PortalPageBackgroundSizeMode,
  PortalPageBasicSettings,
  PortalPageBannerSettings,
  PortalPageContentAlign,
  PortalPageContentWidthMode,
  PortalPageFooterMode,
  PortalPageGridSettings,
  PortalPageHeaderFooterBehaviorSettings,
  PortalPageLayoutContainerSettings,
  PortalPageLayoutPayload,
  PortalPageLayoutMode,
  PortalPageOverflowMode,
  PortalPagePublishGuardSettings,
  PortalPageResponsiveItemSettings,
  PortalPageResponsiveSettings,
  PortalPageRuntimeSettings,
  PortalPageSettingIssue,
  PortalPageSettingsV2,
  PortalPageSpacingSettings,
  PortalPageViewportType,
} from './schema/page-settings';
export {
  buildPortalPageLayoutForSave,
  createDefaultPortalPageSettingsV2,
  getPortalGridSettings,
  isPortalPageSettingsV2,
  normalizePortalPageSettingsV2,
  PORTAL_PAGE_SETTINGS_V2_VERSION,
  resolvePortalPageRuntimeSettings,
  validatePortalPageSettingsV2,
} from './schema/page-settings';
export type { SchemaConfigOptions, SchemaConfigResult, SectionConfig } from './composables/useSchemaConfig';
export { useSchemaConfig } from './composables/useSchemaConfig';
export { deepClone, deepEqual } from './utils/deep';
export type { RegisterPortalMaterialComponentOptions } from './materials/useMaterials';
export { registerPortalMaterialComponent, unregisterPortalMaterialComponent, useMaterials } from './materials/useMaterials';
export { cmsApi, getPortalCmsApi, setPortalCmsApi } from './materials/api';
export type {
  PortalCmsDetailNavigationContext,
  PortalCmsListNavigationContext,
  PortalCmsNavigation,
  PortalCmsNavigationResult,
} from './materials/navigation';
export {
  navigatePortalCmsDetail,
  navigatePortalCmsList,
  resetPortalCmsNavigation,
  setPortalCmsNavigation,
} from './materials/navigation';
export type {
  PortalMaterialCategory,
  PortalMaterialCategoryInput,
  PortalMaterialConflictStrategy,
  PortalMaterialItem,
  PortalMaterialRegistry,
  PortalMaterialRegistryController,
  RegisterPortalMaterialOptions,
  UnregisterPortalMaterialOptions,
} from './registry/materials-registry.types';
export {
  createPortalMaterialRegistry,
  portalMaterialsRegistry,
  portalMaterialTypeAliases,
  registerPortalMaterial,
  resolvePortalMaterialTypeAlias,
  unregisterPortalMaterial,
} from './registry/materials-registry';
export type { PortalLayoutItem } from './stores/pageLayout';
export { usePortalPageLayoutStore } from './stores/pageLayout';
export { default as GridLayoutEditor } from './editor/GridLayoutEditor.vue';
export type { LayoutUpdateItem } from './editor/layout-sync';
export { hasLayoutGeometryChanged, mergeLayoutItems } from './editor/layout-sync';
export { default as PropertyPanel } from './editor/PropertyPanel.vue';
export { default as MaterialLibrary } from './editor/MaterialLibrary.vue';
export { default as PortalGridRenderer } from './renderer/PortalGridRenderer.vue';
