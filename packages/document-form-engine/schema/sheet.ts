export interface DocumentSheetRange {
  row: number;
  col: number;
  rowspan: number;
  colspan: number;
}

export type DocumentSheetMerge = DocumentSheetRange;

export interface DocumentSheetCell extends DocumentSheetRange {
  value: string;
}

export interface DocumentSheetImage extends DocumentSheetRange {
  src: string;
  alt?: string;
  fit?: 'contain' | 'cover';
}

export interface DocumentSheetBorderSide {
  color: string;
  style: 'solid' | 'dashed' | 'dotted' | 'double';
  width: number;
}

export interface DocumentSheetStyle extends DocumentSheetRange {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | number;
  horizontalAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  wrap?: boolean;
  border?: {
    top?: DocumentSheetBorderSide;
    right?: DocumentSheetBorderSide;
    bottom?: DocumentSheetBorderSide;
    left?: DocumentSheetBorderSide;
  };
}

export interface DocumentSheetViewport {
  showGrid: boolean;
  zoom: number;
  frozenRows: number;
  frozenColumns: number;
}

export interface DocumentTemplateSheetConfig {
  rows: number;
  columns: number;
  rowHeights: Record<string, number>;
  columnWidths: Record<string, number>;
  merges: DocumentSheetMerge[];
  styles: DocumentSheetStyle[];
  cells: DocumentSheetCell[];
  images: DocumentSheetImage[];
  viewport: DocumentSheetViewport;
}

export interface DocumentTemplateSheetSource {
  rows?: number;
  columns?: number;
  rowHeights?: Record<string, number>;
  columnWidths?: Record<string, number>;
  merges?: DocumentSheetMerge[];
  styles?: DocumentSheetStyle[];
  cells?: DocumentSheetCell[];
  images?: DocumentSheetImage[];
  viewport?: Partial<DocumentSheetViewport>;
}

export interface DocumentSheetSeed {
  minHeight: number;
  rowHeight: number;
  columns: number;
  showGrid: boolean;
}

function resolvePositiveInteger(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.round(value as number));
}

function normalizeNumericMap(input: Record<string, number> | undefined) {
  if (!input) {
    return {};
  }

  const normalized: Record<string, number> = {};
  Object.entries(input).forEach(([key, value]) => {
    if (!Number.isFinite(value)) {
      return;
    }

    normalized[key] = Math.max(1, Math.round(value));
  });

  return normalized;
}

function normalizeRange<T extends DocumentSheetRange>(range: T) {
  return {
    ...range,
    row: resolvePositiveInteger(range.row, 1),
    col: resolvePositiveInteger(range.col, 1),
    rowspan: resolvePositiveInteger(range.rowspan, 1),
    colspan: resolvePositiveInteger(range.colspan, 1)
  };
}

function normalizeMerges(merges: DocumentSheetMerge[] | undefined) {
  if (!Array.isArray(merges)) {
    return [];
  }

  return merges
    .filter((item) => Number.isFinite(item?.row) && Number.isFinite(item?.col))
    .map((item) => normalizeRange(item));
}

function normalizeStyles(styles: DocumentSheetStyle[] | undefined) {
  if (!Array.isArray(styles)) {
    return [];
  }

  return styles
    .filter((item) => Number.isFinite(item?.row) && Number.isFinite(item?.col))
    .map((item) => ({
      ...normalizeRange(item),
      border: item.border
        ? {
            ...item.border
          }
        : undefined
    }));
}

function normalizeCells(cells: DocumentSheetCell[] | undefined) {
  if (!Array.isArray(cells)) {
    return [];
  }

  return cells
    .filter((item) => Number.isFinite(item?.row) && Number.isFinite(item?.col))
    .map((item) => ({
      ...normalizeRange(item),
      value: String(item.value ?? '')
    }));
}

function normalizeImages(images: DocumentSheetImage[] | undefined) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .filter((item) => Number.isFinite(item?.row) && Number.isFinite(item?.col))
    .map((item) => ({
      ...normalizeRange(item),
      src: String(item.src ?? ''),
      alt: typeof item.alt === 'string' ? item.alt : undefined,
      fit: (item.fit === 'cover' ? 'cover' : 'contain') as 'cover' | 'contain'
    }))
    .filter((item) => item.src);
}

export function createDefaultDocumentSheet(seed: DocumentSheetSeed): DocumentTemplateSheetConfig {
  const columns = resolvePositiveInteger(seed.columns, 24);
  const rowHeight = resolvePositiveInteger(seed.rowHeight, 28);
  const minHeight = resolvePositiveInteger(seed.minHeight, rowHeight);
  const rows = Math.max(1, Math.ceil(minHeight / rowHeight));

  return {
    rows,
    columns,
    rowHeights: {},
    columnWidths: {},
    merges: [],
    styles: [],
    cells: [],
    images: [],
    viewport: {
      showGrid: Boolean(seed.showGrid),
      zoom: 100,
      frozenRows: 0,
      frozenColumns: 0
    }
  };
}

export function normalizeDocumentSheet(
  input: DocumentTemplateSheetSource | null | undefined,
  fallback: DocumentTemplateSheetConfig
): DocumentTemplateSheetConfig {
  if (!input) {
    return {
      ...fallback,
      rowHeights: { ...fallback.rowHeights },
      columnWidths: { ...fallback.columnWidths },
      merges: [...fallback.merges],
      styles: [...fallback.styles],
      cells: [...fallback.cells],
      images: [...fallback.images],
      viewport: {
        ...fallback.viewport
      }
    };
  }

  return {
    rows: resolvePositiveInteger(input.rows, fallback.rows),
    columns: resolvePositiveInteger(input.columns, fallback.columns),
    rowHeights: normalizeNumericMap(input.rowHeights ?? fallback.rowHeights),
    columnWidths: normalizeNumericMap(input.columnWidths ?? fallback.columnWidths),
    merges: normalizeMerges(input.merges ?? fallback.merges),
    styles: normalizeStyles(input.styles ?? fallback.styles),
    cells: normalizeCells(input.cells ?? fallback.cells),
    images: normalizeImages(input.images ?? fallback.images),
    viewport: {
      showGrid:
        typeof input.viewport?.showGrid === 'boolean'
          ? input.viewport.showGrid
          : fallback.viewport.showGrid,
      zoom: resolvePositiveInteger(input.viewport?.zoom, fallback.viewport.zoom),
      frozenRows: Math.max(
        0,
        Math.round(input.viewport?.frozenRows ?? fallback.viewport.frozenRows)
      ),
      frozenColumns: Math.max(
        0,
        Math.round(input.viewport?.frozenColumns ?? fallback.viewport.frozenColumns)
      )
    }
  };
}
