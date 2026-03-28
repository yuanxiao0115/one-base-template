import type { DocumentMaterialAnchor } from '../schema/types';

export interface CanvasGridRange {
  startRow: number;
  startColumn: number;
  endRow: number;
  endColumn: number;
}

export interface ClampCanvasRangeOptions {
  maxRows: number;
  maxColumns: number;
}

function toSafeInteger(value: number, fallback = 0) {
  if (Number.isFinite(value)) {
    return Math.trunc(value);
  }
  return fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeCanvasRange(range: CanvasGridRange): CanvasGridRange {
  const startRow = toSafeInteger(range.startRow);
  const endRow = toSafeInteger(range.endRow);
  const startColumn = toSafeInteger(range.startColumn);
  const endColumn = toSafeInteger(range.endColumn);

  return {
    startRow: Math.min(startRow, endRow),
    endRow: Math.max(startRow, endRow),
    startColumn: Math.min(startColumn, endColumn),
    endColumn: Math.max(startColumn, endColumn)
  };
}

export function clampCanvasRange(
  range: CanvasGridRange,
  options: ClampCanvasRangeOptions
): CanvasGridRange {
  const normalized = normalizeCanvasRange(range);
  const maxRowIndex = Math.max(0, toSafeInteger(options.maxRows, 1) - 1);
  const maxColumnIndex = Math.max(0, toSafeInteger(options.maxColumns, 1) - 1);

  const startRow = clamp(normalized.startRow, 0, maxRowIndex);
  const endRow = clamp(normalized.endRow, 0, maxRowIndex);
  const startColumn = clamp(normalized.startColumn, 0, maxColumnIndex);
  const endColumn = clamp(normalized.endColumn, 0, maxColumnIndex);

  return normalizeCanvasRange({
    startRow,
    endRow,
    startColumn,
    endColumn
  });
}

export function anchorToCanvasRange(anchor: DocumentMaterialAnchor): CanvasGridRange {
  const safeRow = Math.max(1, toSafeInteger(anchor.row, 1));
  const safeCol = Math.max(1, toSafeInteger(anchor.col, 1));
  const safeRowspan = Math.max(1, toSafeInteger(anchor.rowspan, 1));
  const safeColspan = Math.max(1, toSafeInteger(anchor.colspan, 1));

  return {
    startRow: safeRow - 1,
    startColumn: safeCol - 1,
    endRow: safeRow + safeRowspan - 2,
    endColumn: safeCol + safeColspan - 2
  };
}

export function canvasRangeToAnchor(range: CanvasGridRange): DocumentMaterialAnchor {
  const normalized = normalizeCanvasRange(range);

  return {
    row: normalized.startRow + 1,
    col: normalized.startColumn + 1,
    rowspan: normalized.endRow - normalized.startRow + 1,
    colspan: normalized.endColumn - normalized.startColumn + 1
  };
}
