import type { DocumentTemplateSchema } from './types';

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
  return {
    version: '1',
    kind: 'dispatch-form',
    title: '发文单模板',
    page: {
      size: DEFAULT_DOCUMENT_PAGE.size,
      width: DEFAULT_DOCUMENT_PAGE.width,
      minHeight: DEFAULT_DOCUMENT_PAGE.minHeight,
      padding: [...DEFAULT_DOCUMENT_PAGE.padding]
    },
    grid: { ...DEFAULT_DOCUMENT_GRID },
    materials: [],
    print: {
      showGrid: false
    }
  };
}

export function normalizeDocumentTemplate(
  input: Partial<DocumentTemplateSchema> | null | undefined
): DocumentTemplateSchema {
  const fallback = createDefaultDocumentTemplate();
  if (!input) {
    return fallback;
  }

  return {
    version: '1',
    kind: 'dispatch-form',
    title: typeof input.title === 'string' && input.title.trim() ? input.title : fallback.title,
    page: {
      ...fallback.page,
      ...input.page
    },
    grid: {
      ...fallback.grid,
      ...input.grid
    },
    materials: Array.isArray(input.materials) ? input.materials : fallback.materials,
    print: {
      ...fallback.print,
      ...input.print
    }
  };
}

export function serializeDocumentTemplate(template: DocumentTemplateSchema) {
  return JSON.stringify(template, null, 2);
}

export function parseDocumentTemplate(raw: string) {
  return normalizeDocumentTemplate(JSON.parse(raw) as Partial<DocumentTemplateSchema>);
}
