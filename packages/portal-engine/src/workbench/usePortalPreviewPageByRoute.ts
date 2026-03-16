import { computed, type ComputedRef, type Ref } from 'vue';

import type { PortalPreviewNavigatePayload } from '../renderer/portal-preview-panel.types';
import { resolvePreviewMode, resolvePreviewViewport } from '../utils/preview';

import {
  resolvePortalTabIdFromQuery,
  resolvePortalTemplateIdFromQuery,
  type PortalRouteQueryLike
} from './template-workbench-route';

export type PortalPreviewRouteParamPrimitive = string | number | null | undefined;
export type PortalPreviewRouteParamValue =
  | PortalPreviewRouteParamPrimitive
  | PortalPreviewRouteParamPrimitive[];
export type PortalPreviewRouteParamsLike = Record<string, PortalPreviewRouteParamValue>;

function normalizeRouteParam(value: PortalPreviewRouteParamValue): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '';
    }
    return normalizeRouteParam(value[0]);
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
}

export interface UsePortalPreviewPageByRouteOptions {
  routeQuery: Readonly<Ref<PortalRouteQueryLike> | ComputedRef<PortalRouteQueryLike>>;
  routeParams?: Readonly<
    Ref<PortalPreviewRouteParamsLike> | ComputedRef<PortalPreviewRouteParamsLike>
  >;
  replaceRouteQuery: (nextQuery: PortalRouteQueryLike) => Promise<unknown> | void;
  onReplaceRouteQueryError?: (error: unknown) => void;
  openWindow?: (url: string, target?: string, features?: string) => void;
  templateIdQueryKeys?: readonly string[];
  tabIdQueryKey?: string;
}

export function usePortalPreviewPageByRoute(options: UsePortalPreviewPageByRouteOptions) {
  const tabIdQueryKey = options.tabIdQueryKey || 'tabId';
  const templateIdQueryKeys = options.templateIdQueryKeys || ['id', 'templateId'];

  const tabIdFromParams = computed(() => {
    if (!options.routeParams) {
      return '';
    }
    return normalizeRouteParam(options.routeParams.value[tabIdQueryKey]);
  });

  const tabId = computed(
    () =>
      resolvePortalTabIdFromQuery(options.routeQuery.value, tabIdQueryKey) || tabIdFromParams.value
  );
  const templateId = computed(() =>
    resolvePortalTemplateIdFromQuery(options.routeQuery.value, templateIdQueryKeys)
  );
  const previewMode = computed(() => resolvePreviewMode(options.routeQuery.value.previewMode));

  const previewViewport = computed(() => {
    const width = options.routeQuery.value.vw;
    const height = options.routeQuery.value.vh;
    if (typeof width !== 'string' || typeof height !== 'string') {
      return {
        width: 0,
        height: 0
      };
    }
    return resolvePreviewViewport(width, height);
  });

  function onNavigate(payload: PortalPreviewNavigatePayload) {
    if (payload.type === 'tab') {
      if (!payload.tabId) {
        return;
      }
      const nextQuery: PortalRouteQueryLike = {
        ...options.routeQuery.value,
        [tabIdQueryKey]: payload.tabId,
        templateId: templateId.value || undefined
      };
      const result = options.replaceRouteQuery(nextQuery);
      if (result && typeof (result as Promise<unknown>).catch === 'function') {
        void (result as Promise<unknown>).catch((error) => {
          options.onReplaceRouteQueryError?.(error);
        });
      }
      return;
    }

    if (payload.type === 'url' && payload.url) {
      const opener =
        options.openWindow ||
        ((url: string, target?: string, features?: string) => {
          if (typeof window !== 'undefined') {
            window.open(url, target, features);
          }
        });
      opener(payload.url, '_blank', 'noopener,noreferrer');
    }
  }

  return {
    tabId,
    templateId,
    previewMode,
    previewViewport,
    onNavigate
  };
}
