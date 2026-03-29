import type { DocumentTemplateSchema } from '../schema/types';
import { anchorToCanvasRange, type CanvasGridRange } from './canvas-bridge';

export interface CanvasGridMetrics {
  maxRows: number;
  maxColumns: number;
  rowHeight: number;
  columnWidth: number;
}

export interface CanvasSheetCell {
  id: string;
  kind: 'static' | 'field';
  label: string;
  range: CanvasGridRange;
  rowCount: number;
  columnCount: number;
  isActive: boolean;
}

export function resolveCanvasGridMetrics(template: DocumentTemplateSchema): CanvasGridMetrics {
  return {
    maxRows: Math.max(1, template.sheet.rows),
    maxColumns: Math.max(1, template.sheet.columns),
    rowHeight: 28,
    columnWidth: Math.max(32, Math.floor(template.page.width / Math.max(1, template.sheet.columns)))
  };
}

export function buildCanvasSheetCells(
  template: DocumentTemplateSchema,
  selectedPlacementId: string | null | undefined
): CanvasSheetCell[] {
  const placementRoots = new Set(
    template.placements.map((item) => `${item.range.row}:${item.range.col}`)
  );

  const staticCells = template.sheet.cells
    .filter((cell) => !placementRoots.has(`${cell.row}:${cell.col}`))
    .map((cell) => {
      const range = anchorToCanvasRange(cell);

      return {
        id: `static:${cell.row}:${cell.col}`,
        kind: 'static' as const,
        label: cell.value,
        range,
        rowCount: range.endRow - range.startRow + 1,
        columnCount: range.endColumn - range.startColumn + 1,
        isActive: false
      };
    });

  const placementCells = template.placements.map((placement) => {
    const field = template.fields.find((item) => item.id === placement.fieldId);
    const range = anchorToCanvasRange(placement.range);

    return {
      id: placement.id,
      kind: 'field' as const,
      label: `[${field?.type ?? 'field'}] ${field?.label ?? placement.fieldId}`,
      range,
      rowCount: range.endRow - range.startRow + 1,
      columnCount: range.endColumn - range.startColumn + 1,
      isActive: placement.id === selectedPlacementId
    };
  });

  return [...staticCells, ...placementCells];
}
