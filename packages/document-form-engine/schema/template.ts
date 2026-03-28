import { createDefaultDocumentSheet, normalizeDocumentSheet } from './sheet';
import type {
  AnyDocumentTemplateSchema,
  DocumentTemplateSchema,
  DocumentTemplateSchemaV1
} from './types';

export const DEFAULT_DOCUMENT_PAGE = {
  size: 'A4',
  width: 794,
  minHeight: 1123,
  padding: [32, 32, 32, 32]
} as const;

export const DEFAULT_DOCUMENT_GRID = {
  columns: 24,
  rowHeight: 24
} as const;

export function createDefaultDocumentTemplate(): DocumentTemplateSchema {
  const page = {
    size: DEFAULT_DOCUMENT_PAGE.size,
    width: DEFAULT_DOCUMENT_PAGE.width,
    minHeight: DEFAULT_DOCUMENT_PAGE.minHeight,
    padding: [...DEFAULT_DOCUMENT_PAGE.padding] as [number, number, number, number]
  };
  const grid = { ...DEFAULT_DOCUMENT_GRID };
  const print = {
    showGrid: false
  };

  return {
    version: '2',
    kind: 'dispatch-form',
    title: '发文单模板',
    page,
    grid,
    materials: [],
    print,
    sheet: createDefaultDocumentSheet({
      minHeight: page.minHeight,
      rowHeight: grid.rowHeight,
      columns: grid.columns,
      showGrid: print.showGrid
    })
  };
}

function isLegacySchema(
  input: Partial<AnyDocumentTemplateSchema>
): input is Partial<DocumentTemplateSchemaV1> {
  return input.version === '1';
}

export function normalizeDocumentTemplate(
  input: Partial<AnyDocumentTemplateSchema> | null | undefined
): DocumentTemplateSchema {
  const fallback = createDefaultDocumentTemplate();
  if (!input) {
    return fallback;
  }

  const page = {
    ...fallback.page,
    ...input.page
  };
  const grid = {
    ...fallback.grid,
    ...input.grid
  };
  const print = {
    ...fallback.print,
    ...input.print
  };
  const baseSheet = createDefaultDocumentSheet({
    minHeight: page.minHeight,
    rowHeight: grid.rowHeight,
    columns: grid.columns,
    showGrid: print.showGrid
  });
  const inputSheet = isLegacySchema(input) ? null : input.sheet;
  const sheet = normalizeDocumentSheet(inputSheet, baseSheet);

  return {
    version: '2',
    kind: 'dispatch-form',
    title: typeof input.title === 'string' && input.title.trim() ? input.title : fallback.title,
    page,
    grid,
    materials: Array.isArray(input.materials) ? input.materials : fallback.materials,
    print: {
      showGrid: sheet.viewport.showGrid
    },
    sheet
  };
}

export function serializeDocumentTemplate(template: DocumentTemplateSchema) {
  return JSON.stringify(template, null, 2);
}

export function parseDocumentTemplate(raw: string) {
  return normalizeDocumentTemplate(JSON.parse(raw) as Partial<AnyDocumentTemplateSchema>);
}
