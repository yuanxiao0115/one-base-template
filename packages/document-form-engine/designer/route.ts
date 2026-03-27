export type DocumentDesignerRouteQueryPrimitive = string | number | boolean | null | undefined;

export type DocumentDesignerRouteQueryValue =
  | DocumentDesignerRouteQueryPrimitive
  | DocumentDesignerRouteQueryPrimitive[];

export type DocumentDesignerRouteQueryLike = Record<string, DocumentDesignerRouteQueryValue>;

export interface ResolveDocumentDesignerRouteParamsOptions {
  templateIdKey?: string;
}

export interface DocumentDesignerRouteParams {
  templateId: string;
}

function normalizeQueryValue(value: DocumentDesignerRouteQueryValue): string {
  if (Array.isArray(value)) {
    const picked = value.find((item) => item !== null && item !== undefined);
    return picked == null ? '' : String(picked).trim();
  }

  if (value == null) {
    return '';
  }

  return String(value).trim();
}

export function resolveDocumentDesignerRouteParams(
  query: DocumentDesignerRouteQueryLike,
  options: ResolveDocumentDesignerRouteParamsOptions = {}
): DocumentDesignerRouteParams {
  const templateIdKey = options.templateIdKey ?? 'templateId';
  return {
    templateId: normalizeQueryValue(query[templateIdKey])
  };
}
