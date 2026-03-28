export { default as DocumentDesignerWorkbench } from './DocumentDesignerWorkbench.vue';
export { default as DocumentFormDesignerLayout } from './DocumentFormDesignerLayout.vue';
export { default as DocumentMaterialPalette } from './DocumentMaterialPalette.vue';
export { default as DocumentCanvas } from './DocumentCanvas.vue';
export { default as UniverDocumentCanvas } from './UniverDocumentCanvas.vue';
export { default as DocumentPropertyInspector } from './DocumentPropertyInspector.vue';
export type {
  DocumentDesignerRouteQueryLike,
  DocumentDesignerRouteQueryPrimitive,
  DocumentDesignerRouteQueryValue
} from './route';
export { resolveDocumentDesignerRouteParams } from './route';
export type { CanvasGridRange, ClampCanvasRangeOptions } from './canvas-bridge';
export {
  anchorToCanvasRange,
  canvasRangeToAnchor,
  clampCanvasRange,
  normalizeCanvasRange
} from './canvas-bridge';
export { createMaterialNode, useDocumentDesignerState } from './useDocumentDesignerState';
