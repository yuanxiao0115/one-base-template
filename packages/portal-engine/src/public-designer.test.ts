import { describe, expect, it } from 'vite-plus/test';

import MaterialLibrary from './editor/MaterialLibrary.vue';
import PortalDesignerPreviewFrame from './editor/PortalDesignerPreviewFrame.vue';
import PortalPageEditorWorkbench from './editor/PortalPageEditorWorkbench.vue';
import PropertyPanel from './editor/PropertyPanel.vue';
import PortalDesignerActionStrip from './workbench/PortalDesignerActionStrip.vue';
import PortalDesignerHeaderBar from './workbench/PortalDesignerHeaderBar.vue';
import PortalDesignerTreePanel from './workbench/PortalDesignerTreePanel.vue';
import PortalTemplateWorkbenchShell from './workbench/PortalTemplateWorkbenchShell.vue';
import { usePageEditorWorkbenchByRoute } from './workbench/usePageEditorWorkbenchByRoute';
import { useTemplateWorkbenchPageByRoute } from './workbench/useTemplateWorkbenchPageByRoute';
import {
  MaterialLibrary as InternalMaterialLibrary,
  PortalDesignerActionStrip as InternalPortalDesignerActionStrip,
  PortalDesignerHeaderBar as InternalPortalDesignerHeaderBar,
  PortalDesignerPreviewFrame as InternalPortalDesignerPreviewFrame,
  PortalDesignerTreePanel as InternalPortalDesignerTreePanel,
  PortalPageEditorWorkbench as InternalPortalPageEditorWorkbench,
  PortalTemplateWorkbenchShell as InternalPortalTemplateWorkbenchShell,
  PropertyPanel as InternalPropertyPanel,
  usePageEditorWorkbenchByRoute as useInternalPageEditorWorkbenchByRoute,
  useTemplateWorkbenchPageByRoute as useInternalTemplateWorkbenchPageByRoute
} from './internal';
import {
  PortalMaterialPalette as RootPortalMaterialPalette,
  PortalPageDesignerLayout as RootPortalPageDesignerLayout,
  PortalPropertyInspector as RootPortalPropertyInspector,
  PortalTemplateDesignerHeader as RootPortalTemplateDesignerHeader,
  PortalTemplateDesignerLayout as RootPortalTemplateDesignerLayout,
  PortalTemplateDesignerPreview as RootPortalTemplateDesignerPreview,
  PortalTemplateDesignerSidebar as RootPortalTemplateDesignerSidebar,
  PortalTemplateDesignerToolbar as RootPortalTemplateDesignerToolbar,
  usePortalPageDesignerRoute as useRootPortalPageDesignerRoute,
  usePortalTemplateDesignerRoute as useRootPortalTemplateDesignerRoute
} from './index';
import {
  PortalMaterialPalette,
  PortalPageDesignerLayout,
  PortalPropertyInspector,
  PortalTemplateDesignerHeader,
  PortalTemplateDesignerLayout,
  PortalTemplateDesignerPreview,
  PortalTemplateDesignerSidebar,
  PortalTemplateDesignerToolbar,
  usePortalPageDesignerRoute,
  usePortalTemplateDesignerRoute
} from './public-designer';

describe('public designer exports', () => {
  it('语义化组件别名应映射到现有实现', () => {
    expect(PortalTemplateDesignerLayout).toBe(PortalTemplateWorkbenchShell);
    expect(PortalTemplateDesignerHeader).toBe(PortalDesignerHeaderBar);
    expect(PortalTemplateDesignerSidebar).toBe(PortalDesignerTreePanel);
    expect(PortalTemplateDesignerToolbar).toBe(PortalDesignerActionStrip);
    expect(PortalTemplateDesignerPreview).toBe(PortalDesignerPreviewFrame);
    expect(PortalPageDesignerLayout).toBe(PortalPageEditorWorkbench);
    expect(PortalMaterialPalette).toBe(MaterialLibrary);
    expect(PortalPropertyInspector).toBe(PropertyPanel);
  });

  it('语义化 route composable 别名应映射到现有实现', () => {
    expect(usePortalTemplateDesignerRoute).toBe(useTemplateWorkbenchPageByRoute);
    expect(usePortalPageDesignerRoute).toBe(usePageEditorWorkbenchByRoute);
  });

  it('root export 应继续暴露语义化别名', () => {
    expect(RootPortalTemplateDesignerLayout).toBe(PortalTemplateDesignerLayout);
    expect(RootPortalTemplateDesignerHeader).toBe(PortalTemplateDesignerHeader);
    expect(RootPortalTemplateDesignerSidebar).toBe(PortalTemplateDesignerSidebar);
    expect(RootPortalTemplateDesignerToolbar).toBe(PortalTemplateDesignerToolbar);
    expect(RootPortalTemplateDesignerPreview).toBe(PortalTemplateDesignerPreview);
    expect(RootPortalPageDesignerLayout).toBe(PortalPageDesignerLayout);
    expect(RootPortalMaterialPalette).toBe(PortalMaterialPalette);
    expect(RootPortalPropertyInspector).toBe(PortalPropertyInspector);
    expect(useRootPortalTemplateDesignerRoute).toBe(usePortalTemplateDesignerRoute);
    expect(useRootPortalPageDesignerRoute).toBe(usePortalPageDesignerRoute);
  });

  it('internal 子路径应保留实现语义导出', () => {
    expect(InternalPortalTemplateWorkbenchShell).toBe(PortalTemplateWorkbenchShell);
    expect(InternalPortalDesignerHeaderBar).toBe(PortalDesignerHeaderBar);
    expect(InternalPortalDesignerTreePanel).toBe(PortalDesignerTreePanel);
    expect(InternalPortalDesignerActionStrip).toBe(PortalDesignerActionStrip);
    expect(InternalPortalDesignerPreviewFrame).toBe(PortalDesignerPreviewFrame);
    expect(InternalPortalPageEditorWorkbench).toBe(PortalPageEditorWorkbench);
    expect(InternalMaterialLibrary).toBe(MaterialLibrary);
    expect(InternalPropertyPanel).toBe(PropertyPanel);
    expect(useInternalTemplateWorkbenchPageByRoute).toBe(useTemplateWorkbenchPageByRoute);
    expect(useInternalPageEditorWorkbenchByRoute).toBe(usePageEditorWorkbenchByRoute);
  });

  it('package exports 应允许通过 designer 子路径导入', async () => {
    const designerExports = await import('@one-base-template/portal-engine/designer');

    expect(designerExports.PortalTemplateDesignerLayout).toBe(PortalTemplateDesignerLayout);
    expect(designerExports.PortalTemplateDesignerHeader).toBe(PortalTemplateDesignerHeader);
    expect(designerExports.PortalTemplateDesignerSidebar).toBe(PortalTemplateDesignerSidebar);
    expect(designerExports.PortalTemplateDesignerToolbar).toBe(PortalTemplateDesignerToolbar);
    expect(designerExports.PortalTemplateDesignerPreview).toBe(PortalTemplateDesignerPreview);
    expect(designerExports.PortalPageDesignerLayout).toBe(PortalPageDesignerLayout);
    expect(designerExports.PortalMaterialPalette).toBe(PortalMaterialPalette);
    expect(designerExports.PortalPropertyInspector).toBe(PortalPropertyInspector);
    expect(designerExports.usePortalTemplateDesignerRoute).toBe(usePortalTemplateDesignerRoute);
    expect(designerExports.usePortalPageDesignerRoute).toBe(usePortalPageDesignerRoute);
  });

  it('package exports 应允许通过 internal 子路径导入', async () => {
    const internalExports = await import('@one-base-template/portal-engine/internal');

    expect(internalExports.PortalTemplateWorkbenchShell).toBe(PortalTemplateWorkbenchShell);
    expect(internalExports.PortalDesignerHeaderBar).toBe(PortalDesignerHeaderBar);
    expect(internalExports.PortalDesignerTreePanel).toBe(PortalDesignerTreePanel);
    expect(internalExports.PortalDesignerActionStrip).toBe(PortalDesignerActionStrip);
    expect(internalExports.PortalDesignerPreviewFrame).toBe(PortalDesignerPreviewFrame);
    expect(internalExports.PortalPageEditorWorkbench).toBe(PortalPageEditorWorkbench);
    expect(internalExports.MaterialLibrary).toBe(MaterialLibrary);
    expect(internalExports.PropertyPanel).toBe(PropertyPanel);
    expect(internalExports.useTemplateWorkbenchPageByRoute).toBe(useTemplateWorkbenchPageByRoute);
    expect(internalExports.usePageEditorWorkbenchByRoute).toBe(usePageEditorWorkbenchByRoute);
  });
});
