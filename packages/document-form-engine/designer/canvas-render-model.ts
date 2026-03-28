import type { DocumentMaterialDefinition } from '../materials/types';
import type { DocumentTemplateSchema } from '../schema/types';
import { anchorToCanvasRange, clampCanvasRange, type CanvasGridRange } from './canvas-bridge';

export interface CanvasGridMetrics {
  maxRows: number;
  maxColumns: number;
  rowHeight: number;
  columnWidth: number;
}

export interface CanvasMaterialCell {
  nodeId: string;
  type: string;
  title: string;
  label: string;
  isActive: boolean;
  range: CanvasGridRange;
  rowCount: number;
  columnCount: number;
}

export function resolveCanvasGridMetrics(template: DocumentTemplateSchema): CanvasGridMetrics {
  const maxColumns = Math.max(1, template.grid.columns);
  const maxRows = Math.max(1, Math.ceil(template.page.minHeight / template.grid.rowHeight));
  const rowHeight = Math.max(20, template.grid.rowHeight);
  const columnWidth = Math.max(32, Math.floor(template.page.width / maxColumns));

  return {
    maxRows,
    maxColumns,
    rowHeight,
    columnWidth
  };
}

export function buildCanvasMaterialCells(
  template: DocumentTemplateSchema,
  materials: DocumentMaterialDefinition[],
  selectedNodeId: string | null | undefined
): CanvasMaterialCell[] {
  const metrics = resolveCanvasGridMetrics(template);
  const labelByType = new Map(materials.map((item) => [item.type, item.label]));

  return template.materials.map((node) => {
    const range = clampCanvasRange(anchorToCanvasRange(node.anchor), metrics);
    const rowCount = range.endRow - range.startRow + 1;
    const columnCount = range.endColumn - range.startColumn + 1;
    const materialLabel = labelByType.get(node.type) ?? node.type;

    return {
      nodeId: node.id,
      type: node.type,
      title: node.title,
      label: `${materialLabel} · ${node.title}`,
      isActive: node.id === selectedNodeId,
      range,
      rowCount,
      columnCount
    };
  });
}
