export { default as PortalMaterialPalette } from './editor/MaterialLibrary.vue';
export { default as PortalTemplateDesignerPreview } from './editor/PortalDesignerPreviewFrame.vue';
export { default as PortalPageDesignerLayout } from './editor/PortalPageEditorWorkbench.vue';
export { default as PortalPropertyInspector } from './editor/PropertyPanel.vue';
export { default as PortalTemplateDesignerToolbar } from './workbench/PortalDesignerActionStrip.vue';
export { default as PortalTemplateDesignerHeader } from './workbench/PortalDesignerHeaderBar.vue';
export { default as PortalTemplateDesignerSidebar } from './workbench/PortalDesignerTreePanel.vue';
export { default as PortalPageDesignerSettingsDrawer } from './workbench/PortalPageSettingsDrawer.vue';
export { default as PortalTemplateDesignerShellSettingsDrawer } from './workbench/PortalShellSettingsDialog.vue';
export { default as PortalTemplateDesignerPageAttributesDialog } from './workbench/PortalTabAttributeDialog.vue';
export { default as PortalTemplateDesignerLayout } from './workbench/PortalTemplateWorkbenchShell.vue';
export type { TemplateWorkbenchPagePreviewTarget as PortalTemplateDesignerPreviewTarget } from './workbench/template-workbench-page-controller';
export type {
  PortalRouteQueryLike as PortalDesignerRouteQueryLike,
  PortalRouteQueryPrimitive as PortalDesignerRouteQueryPrimitive,
  PortalRouteQueryValue as PortalDesignerRouteQueryValue
} from './workbench/template-workbench-route';
export type { UseTemplateWorkbenchPageByRouteOptions as UsePortalTemplateDesignerRouteOptions } from './workbench/useTemplateWorkbenchPageByRoute';
export { useTemplateWorkbenchPageByRoute as usePortalTemplateDesignerRoute } from './workbench/useTemplateWorkbenchPageByRoute';
export type { UsePageEditorWorkbenchByRouteOptions as UsePortalPageDesignerRouteOptions } from './workbench/usePageEditorWorkbenchByRoute';
export { usePageEditorWorkbenchByRoute as usePortalPageDesignerRoute } from './workbench/usePageEditorWorkbenchByRoute';
