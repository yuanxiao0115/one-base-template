import type { PortalPreviewMode } from '../utils/preview';

export type PortalRouteQueryPrimitive = string | number | null | undefined;
export type PortalRouteQueryValue = PortalRouteQueryPrimitive | PortalRouteQueryPrimitive[];
export type PortalRouteQueryLike = Record<string, PortalRouteQueryValue>;

const DEFAULT_TEMPLATE_ID_QUERY_KEYS = ['id', 'templateId'] as const;
const DEFAULT_TAB_ID_QUERY_KEY = 'tabId';

function normalizeString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
}

function normalizeQueryValue(value: PortalRouteQueryValue): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '';
    }
    return normalizeString(value[0]);
  }
  return normalizeString(value);
}

export function resolvePortalTemplateIdFromQuery(
  query: PortalRouteQueryLike,
  templateIdQueryKeys: readonly string[] = DEFAULT_TEMPLATE_ID_QUERY_KEYS
): string {
  for (const key of templateIdQueryKeys) {
    const value = normalizeQueryValue(query[key]);
    if (value) {
      return value;
    }
  }
  return '';
}

export function resolvePortalTabIdFromQuery(
  query: PortalRouteQueryLike,
  tabIdQueryKey: string = DEFAULT_TAB_ID_QUERY_KEY
): string {
  return normalizeQueryValue(query[tabIdQueryKey]);
}

export function buildNextRouteQueryWithTabId(
  query: PortalRouteQueryLike,
  tabId: string,
  tabIdQueryKey: string = DEFAULT_TAB_ID_QUERY_KEY
): PortalRouteQueryLike | null {
  const nextValue = tabId || undefined;
  const currentValue = resolvePortalTabIdFromQuery(query, tabIdQueryKey) || undefined;
  if (currentValue === nextValue) {
    return null;
  }
  return {
    ...query,
    [tabIdQueryKey]: nextValue
  };
}

export function buildPortalPageEditorRouteLocation(
  templateId: string,
  tabId: string,
  editRoutePath = '/portal/page/edit',
  tabIdQueryKey: string = DEFAULT_TAB_ID_QUERY_KEY
) {
  return {
    path: editRoutePath,
    query: {
      id: templateId,
      [tabIdQueryKey]: tabId
    } satisfies PortalRouteQueryLike
  };
}

export function buildPortalPreviewRouteLocation(
  templateId: string,
  tabId: string,
  previewMode: PortalPreviewMode,
  previewRouteName = 'PortalPreview',
  tabIdQueryKey: string = DEFAULT_TAB_ID_QUERY_KEY
) {
  return {
    name: previewRouteName,
    query: {
      templateId,
      [tabIdQueryKey]: tabId,
      previewMode
    } satisfies PortalRouteQueryLike
  };
}
