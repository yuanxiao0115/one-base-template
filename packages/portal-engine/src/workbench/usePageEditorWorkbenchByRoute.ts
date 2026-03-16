import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  type ComputedRef,
  type Ref
} from 'vue';

import type { PortalPreviewMode } from '../utils/preview';

import type {
  CreatePageEditorControllerOptions,
  PageEditorController
} from './page-editor-controller';
import { createPageEditorController } from './page-editor-controller';
import {
  buildPortalPageEditorBackRouteLocation,
  buildPortalPreviewRouteLocation,
  resolvePortalTabIdFromQuery,
  resolvePortalTemplateIdFromQuery,
  type PortalRouteQueryLike
} from './template-workbench-route';

interface ResolveLocationPayload {
  name: string;
  query: PortalRouteQueryLike;
}

interface PageEditorControllerLifecycle {
  mount: () => void;
  dispose: () => void;
}

export interface UsePageEditorWorkbenchByRouteOptions<
  TController extends PageEditorControllerLifecycle = PageEditorController
> extends Omit<CreatePageEditorControllerOptions, 'tabId' | 'templateId' | 'resolvePreviewHref'> {
  routeQuery: Readonly<Ref<PortalRouteQueryLike> | ComputedRef<PortalRouteQueryLike>>;
  resolveRouteHref: (payload: ResolveLocationPayload) => string;
  previewRouteName?: string;
  templateIdQueryKeys?: readonly string[];
  tabIdQueryKey?: string;
  designRoutePath?: string;
  templateListRoutePath?: string;
  controllerFactory?: (options: CreatePageEditorControllerOptions) => TController;
}

export function usePageEditorWorkbenchByRoute<
  TController extends PageEditorControllerLifecycle = PageEditorController
>(options: UsePageEditorWorkbenchByRouteOptions<TController>) {
  const tabIdQueryKey = options.tabIdQueryKey || 'tabId';
  const templateIdQueryKeys = options.templateIdQueryKeys || ['id', 'templateId'];
  const previewRouteName = options.previewRouteName || 'PortalPreview';
  const designRoutePath = options.designRoutePath || '/portal/design';
  const templateListRoutePath = options.templateListRoutePath || '/portal/setting';

  const tabId = computed(() =>
    resolvePortalTabIdFromQuery(options.routeQuery.value, tabIdQueryKey)
  );
  const templateId = computed(() =>
    resolvePortalTemplateIdFromQuery(options.routeQuery.value, templateIdQueryKeys)
  );

  const {
    routeQuery: _routeQuery,
    resolveRouteHref: _resolveRouteHref,
    previewRouteName: _previewRouteName,
    templateIdQueryKeys: _templateIdQueryKeys,
    tabIdQueryKey: _tabIdQueryKey,
    designRoutePath: _designRoutePath,
    templateListRoutePath: _templateListRoutePath,
    controllerFactory: _controllerFactory,
    ...controllerOptions
  } = options;

  const controllerFactory = options.controllerFactory || createPageEditorController;
  const controller = controllerFactory({
    ...controllerOptions,
    tabId,
    templateId,
    resolvePreviewHref: ({ tabId: nextTabId, templateId: nextTemplateId, previewMode }) =>
      options.resolveRouteHref(
        buildPortalPreviewRouteLocation(
          nextTemplateId,
          nextTabId,
          previewMode as PortalPreviewMode,
          previewRouteName,
          tabIdQueryKey
        )
      )
  });

  const backRouteLocation = computed(() =>
    buildPortalPageEditorBackRouteLocation(
      templateId.value,
      tabId.value,
      designRoutePath,
      templateListRoutePath,
      tabIdQueryKey
    )
  );

  if (getCurrentInstance()) {
    onMounted(() => {
      controller.mount();
    });

    onBeforeUnmount(() => {
      controller.dispose();
    });
  }

  return {
    tabId,
    templateId,
    backRouteLocation,
    controller
  };
}
