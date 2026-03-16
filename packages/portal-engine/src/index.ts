export interface PortalEngineOptions {
  appId?: string;
}

export function createPortalEngine(options: PortalEngineOptions = {}) {
  void options;
  return {
    name: '@one-base-template/portal-engine',
  };
}

export type { PortalEngineContext, PortalEngineContextOptions } from './runtime/context';
export {
  createPortalEngineContext,
  getDefaultPortalEngineContext,
  providePortalEngineContext,
  resetDefaultPortalEngineContext,
  usePortalEngineContext,
} from './runtime/context';

export type { BizResponse, PageResult, PortalTab, PortalTemplate } from './schema/types';
export type { PortalPreviewMode, PortalPreviewViewport } from './utils/preview';
export {
  calcPreviewScale,
  PREVIEW_MODE_LIVE,
  PREVIEW_MODE_SAFE,
  PREVIEW_VIEWPORT_DEFAULT,
  resolvePreviewMode,
  resolvePreviewViewport,
} from './utils/preview';
export type {
  PortalContainerWidth,
  PortalFooterConfig,
  PortalFooterFixedMode,
  PortalHeaderConfig,
  PortalHeaderMode,
  PortalHeaderTitleLayout,
  PortalHeaderTitlePosition,
  PortalNavAlign,
  PortalNavSource,
  PortalPageShellOverride,
  PortalResolvedShell,
  PortalShellConfig,
  PortalShellNavItem,
  PortalTemplateDetails,
} from './shell/template-details';
export {
  buildPortalHeaderNavItems,
  buildPortalTemplateDetailsSchemaPreview,
  createDefaultPortalTemplateDetails,
  getCustomHeaderOption,
  normalizeTabId,
  parsePortalTemplateDetails,
  PORTAL_CUSTOM_HEADER_OPTIONS,
  resolvePortalShellForTab,
  stringifyPortalTemplateDetails,
} from './shell/template-details';
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
export type { PortalTabTreeNode } from './domain/tab-tree';
export {
  calcPortalTabNextSort,
  containsPortalTabId,
  findFirstPortalPageTabId,
  findPortalTabById,
  isPortalTabEditable,
  normalizePortalParentId,
  normalizePortalTabId,
  normalizePortalTabName,
  walkPortalTabs,
} from './domain/tab-tree';
export type {
  PortalPageSettingsApi,
  PortalPageSettingsApiResponse,
  PortalPageSettingsTabLike,
  PortalTabPageSettingsDetail,
} from './services/page-settings';
export {
  createPortalPageSettingsService,
  getPortalPageSettingsApi,
  resetPortalPageSettingsApi,
  setPortalPageSettingsApi,
} from './services/page-settings';
export type { RegisterPortalMaterialComponentOptions } from './materials/useMaterials';
export { registerPortalMaterialComponent, unregisterPortalMaterialComponent, useMaterials } from './materials/useMaterials';
export { useEditorMaterials } from './materials/useEditorMaterials';
export { useRendererMaterials } from './materials/useRendererMaterials';
export { cmsApi, getPortalCmsApi, resetPortalCmsApi, setPortalCmsApi } from './materials/api';
export type {
  PortalCmsDetailNavigationContext,
  PortalCmsListNavigationContext,
  PortalCmsNavigation,
  PortalCmsNavigationResult,
} from './materials/navigation';
export {
  getPortalCmsNavigation,
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
  getPortalMaterialRegistryController,
  getPortalMaterialTypeAliases,
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
export type { UsePortalCurrentTabActionsOptions } from './editor/current-tab-actions';
export { usePortalCurrentTabActions } from './editor/current-tab-actions';
export type {
  PortalPageSettingsDrawerTab,
  PortalPageSettingsSession,
  PortalPageSettingsSessionCloseResult,
  PortalPageSettingsSessionState,
} from './editor/page-settings-session';
export { createPortalPageSettingsSession } from './editor/page-settings-session';
export {
  PORTAL_PREVIEW_MESSAGE_PAGE_READY,
  PORTAL_PREVIEW_MESSAGE_PAGE_RUNTIME,
  PORTAL_PREVIEW_MESSAGE_SHELL_DETAILS,
  PORTAL_PREVIEW_MESSAGE_VIEWPORT,
  buildPreviewRuntimeMessage,
  buildPreviewShellDetailsMessage,
  buildPreviewViewportMessage,
  isPreviewPageReadyMessage,
  sendPreviewPageRuntimeToWindow,
  sendPreviewRuntime,
  sendPreviewShellDetails,
  sendPreviewViewport,
  type PortalPreviewFrameTarget,
  type PortalPreviewReadyData,
  type PortalPreviewReadyMessage,
  type PortalPreviewRuntimeData,
  type PortalPreviewRuntimeMessage,
  type PortalPreviewShellDetailsData,
  type PortalPreviewShellDetailsMessage,
  type PortalPreviewViewportData,
  type PortalPreviewViewportMessage,
} from './editor/preview-bridge';
export { default as PropertyPanel } from './editor/PropertyPanel.vue';
export { default as MaterialLibrary } from './editor/MaterialLibrary.vue';
export { default as PortalPageEditorWorkbench } from './editor/PortalPageEditorWorkbench.vue';
export { default as PortalDesignerPreviewFrame } from './editor/PortalDesignerPreviewFrame.vue';
export type {
  CreateTemplateWorkbenchControllerOptions,
  SubmitTabAttributePayload,
  TemplateWorkbenchApi,
  TemplateWorkbenchConfirmParams,
  TemplateWorkbenchController,
  TemplateWorkbenchNotifier,
  TreeSortDropPayload,
} from './workbench/template-workbench-controller';
export { createTemplateWorkbenchController } from './workbench/template-workbench-controller';
export { useTemplateWorkbench } from './workbench/useTemplateWorkbench';
export { default as PortalTemplateWorkbenchShell } from './workbench/PortalTemplateWorkbenchShell.vue';
export type {
  CreateTemplateWorkbenchPageControllerOptions,
  TemplateWorkbenchPageController,
  TemplateWorkbenchPagePreviewTarget,
} from './workbench/template-workbench-page-controller';
export { createTemplateWorkbenchPageController } from './workbench/template-workbench-page-controller';
export { useTemplateWorkbenchPage } from './workbench/useTemplateWorkbenchPage';
export type {
  PortalRouteQueryLike,
  PortalRouteQueryPrimitive,
  PortalRouteQueryValue,
} from './workbench/template-workbench-route';
export {
  buildNextRouteQueryWithTabId,
  buildPortalPageEditorRouteLocation,
  buildPortalPreviewRouteLocation,
  resolvePortalTabIdFromQuery,
  resolvePortalTemplateIdFromQuery,
} from './workbench/template-workbench-route';
export type { UseTemplateWorkbenchPageByRouteOptions } from './workbench/useTemplateWorkbenchPageByRoute';
export { useTemplateWorkbenchPageByRoute } from './workbench/useTemplateWorkbenchPageByRoute';
export type {
  CreatePageEditorControllerOptions,
  PortalPageEditorLayoutStore,
  PageEditorController,
  PortalPageEditorApi,
  PortalPageEditorNotifier,
  PortalPageEditorTabDetail,
} from './workbench/page-editor-controller';
export { createPageEditorController } from './workbench/page-editor-controller';
export { usePageEditorWorkbench } from './workbench/usePageEditorWorkbench';
export {
  calcPortalManualPanRange,
  calcPortalPreviewPanBounds,
  calcPortalPreviewStagePosition,
  clampPortalPreviewOffset,
  clampPortalPreviewPercent,
  type PortalPreviewPanBounds,
  type PortalPreviewPanBoundsInput,
  type PortalPreviewStageOffset,
} from './editor/preview-stage-utils';
export type {
  PortalPreviewDataSource,
  PortalPreviewNavigatePayload,
  PortalPreviewTabDetailResponse,
  PortalPreviewTemplateDetailResponse,
} from './renderer/portal-preview-panel.types';
export {
  ConfigurablePortalFooter,
  ConfigurablePortalHeader,
  customHeaderRegistry,
  PortalGridRenderer,
  PortalPreviewPanel,
  PortalPreviewGlobalScrollLayout,
  PortalPreviewHeaderFixedContentScrollLayout,
  PortalPreviewHeaderFooterFixedContentScrollLayout,
} from './renderer';
export { PortalBorderField, PortalColorField, PortalSpacingField } from './materials/common/fields';
export {
  DEFAULT_UNIFIED_CONTAINER_CONTENT_CONFIG,
  DEFAULT_UNIFIED_CONTAINER_STYLE_CONFIG,
  MenuIconSelectorInput,
  UnifiedContainerContentConfig,
  UnifiedContainerDisplay,
  UnifiedContainerStyleConfig,
  createDefaultUnifiedContainerContentConfig,
  createDefaultUnifiedContainerStyleConfig,
  mergeUnifiedContainerContentConfig,
  mergeUnifiedContainerStyleConfig,
} from './materials/common/unified-container';
export type {
  UnifiedContainerBorderStyle,
  UnifiedContainerContentConfigModel,
  UnifiedContainerSubtitleLayout,
  UnifiedContainerStyleConfigModel,
} from './materials/common/unified-container';
