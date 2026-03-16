import { computed, type ComputedRef, type Ref } from 'vue';

import type { PortalPreviewMode } from '../utils/preview';

import type {
  CreateTemplateWorkbenchPageControllerOptions,
  TemplateWorkbenchPageController
} from './template-workbench-page-controller';
import { createTemplateWorkbenchPageController } from './template-workbench-page-controller';
import {
  buildNextRouteQueryWithTabId,
  buildPortalPageEditorRouteLocation,
  buildPortalPreviewRouteLocation,
  resolvePortalTabIdFromQuery,
  resolvePortalTemplateIdFromQuery,
  type PortalRouteQueryLike
} from './template-workbench-route';

interface RouteLocationPayload {
  path: string;
  query: PortalRouteQueryLike;
}

interface ResolveLocationPayload {
  name: string;
  query: PortalRouteQueryLike;
}

export interface UseTemplateWorkbenchPageByRouteOptions<
  TController = TemplateWorkbenchPageController
> extends Omit<
  CreateTemplateWorkbenchPageControllerOptions,
  'templateId' | 'routeTabId' | 'syncRouteTabId' | 'openEditor' | 'resolvePreviewHref'
> {
  routeQuery: Readonly<Ref<PortalRouteQueryLike> | ComputedRef<PortalRouteQueryLike>>;
  replaceRouteQuery: (nextQuery: PortalRouteQueryLike) => Promise<unknown> | void;
  onReplaceRouteQueryError?: (error: unknown) => void;
  pushRoute: (payload: RouteLocationPayload) => Promise<unknown> | void;
  resolveRouteHref: (payload: ResolveLocationPayload) => string;
  editRoutePath?: string;
  previewRouteName?: string;
  templateIdQueryKeys?: readonly string[];
  tabIdQueryKey?: string;
  controllerFactory?: (options: CreateTemplateWorkbenchPageControllerOptions) => TController;
}

export function useTemplateWorkbenchPageByRoute<TController = TemplateWorkbenchPageController>(
  options: UseTemplateWorkbenchPageByRouteOptions<TController>
) {
  const tabIdQueryKey = options.tabIdQueryKey || 'tabId';
  const editRoutePath = options.editRoutePath || '/portal/page/edit';
  const previewRouteName = options.previewRouteName || 'PortalPreview';
  const templateIdQueryKeys = options.templateIdQueryKeys || ['id', 'templateId'];

  const templateId = computed(() =>
    resolvePortalTemplateIdFromQuery(options.routeQuery.value, templateIdQueryKeys)
  );
  const routeTabId = computed(() =>
    resolvePortalTabIdFromQuery(options.routeQuery.value, tabIdQueryKey)
  );

  function syncRouteTabId(tabId: string) {
    const nextQuery = buildNextRouteQueryWithTabId(options.routeQuery.value, tabId, tabIdQueryKey);
    if (!nextQuery) {
      return;
    }
    const result = options.replaceRouteQuery(nextQuery);
    if (!result || typeof (result as Promise<unknown>).catch !== 'function') {
      return;
    }
    void (result as Promise<unknown>).catch((error) => {
      options.onReplaceRouteQueryError?.(error);
    });
  }

  const controllerFactory = options.controllerFactory || createTemplateWorkbenchPageController;
  const controller = controllerFactory({
    ...options,
    templateId,
    routeTabId,
    syncRouteTabId,
    openEditor: ({ templateId: nextTemplateId, tabId }) => {
      void options.pushRoute(
        buildPortalPageEditorRouteLocation(nextTemplateId, tabId, editRoutePath, tabIdQueryKey)
      );
    },
    resolvePreviewHref: ({ templateId: nextTemplateId, tabId, previewMode }) =>
      options.resolveRouteHref(
        buildPortalPreviewRouteLocation(
          nextTemplateId,
          tabId,
          previewMode as PortalPreviewMode,
          previewRouteName,
          tabIdQueryKey
        )
      )
  });

  return {
    templateId,
    routeTabId,
    syncRouteTabId,
    controller
  };
}
