import type { Router } from 'vue-router';
import type { PortalEngineContext } from '../runtime/context';
import {
  getDefaultPortalEngineContext,
  readPortalEngineContextValue,
  writePortalEngineContextValue,
} from '../runtime/context';

type MaybePromise<T> = T | Promise<T>;
type RouterLike = Pick<Router, 'push'>;

export interface PortalCmsNavigationResult {
  handled: boolean;
  message?: string;
}

export interface PortalCmsListNavigationContext {
  router: RouterLike;
  categoryId: string;
  tabId?: string;
  moreLink?: string;
}

export interface PortalCmsDetailNavigationContext {
  router: RouterLike;
  articleId: string;
  categoryId?: string;
  tabId?: string;
}

export interface PortalCmsNavigation {
  openList?: (
    context: PortalCmsListNavigationContext
  ) => MaybePromise<void | boolean | PortalCmsNavigationResult>;
  openDetail?: (
    context: PortalCmsDetailNavigationContext
  ) => MaybePromise<void | boolean | PortalCmsNavigationResult>;
}

const UNRESOLVED_LIST_RESULT: PortalCmsNavigationResult = {
  handled: false,
  message: '当前应用未配置 CMS 列表跳转',
};

const UNRESOLVED_DETAIL_RESULT: PortalCmsNavigationResult = {
  handled: false,
  message: '当前应用未配置 CMS 详情跳转',
};

const PORTAL_CMS_NAVIGATION_CONTEXT_KEY = Symbol('portal-engine.cms-navigation');

function createFallbackPortalCmsNavigation(): PortalCmsNavigation {
  return {};
}

export function getPortalCmsNavigation(context: PortalEngineContext = getDefaultPortalEngineContext()) {
  return readPortalEngineContextValue<PortalCmsNavigation>(
    PORTAL_CMS_NAVIGATION_CONTEXT_KEY,
    context,
    createFallbackPortalCmsNavigation
  );
}

function normalizeNavigationResult(
  value: void | boolean | PortalCmsNavigationResult,
  fallbackResult: PortalCmsNavigationResult
): PortalCmsNavigationResult {
  if (value === false) {
    return fallbackResult;
  }

  if (value === true || value == null) {
    return { handled: true };
  }

  return {
    handled: value.handled,
    message: value.message,
  };
}

export function setPortalCmsNavigation(
  navigation: Partial<PortalCmsNavigation>,
  context: PortalEngineContext = getDefaultPortalEngineContext()
) {
  const currentPortalCmsNavigation = getPortalCmsNavigation(context);
  return writePortalEngineContextValue(
    PORTAL_CMS_NAVIGATION_CONTEXT_KEY,
    {
      ...currentPortalCmsNavigation,
      ...navigation,
    },
    context
  );
}

export function resetPortalCmsNavigation(context: PortalEngineContext = getDefaultPortalEngineContext()) {
  return writePortalEngineContextValue(PORTAL_CMS_NAVIGATION_CONTEXT_KEY, createFallbackPortalCmsNavigation(), context);
}

export async function navigatePortalCmsList(
  navigationContext: PortalCmsListNavigationContext,
  context: PortalEngineContext = getDefaultPortalEngineContext()
): Promise<PortalCmsNavigationResult> {
  const currentPortalCmsNavigation = getPortalCmsNavigation(context);
  const openList = currentPortalCmsNavigation.openList;
  if (!openList) {
    return UNRESOLVED_LIST_RESULT;
  }

  return normalizeNavigationResult(await openList(navigationContext), UNRESOLVED_LIST_RESULT);
}

export async function navigatePortalCmsDetail(
  navigationContext: PortalCmsDetailNavigationContext,
  context: PortalEngineContext = getDefaultPortalEngineContext()
): Promise<PortalCmsNavigationResult> {
  const currentPortalCmsNavigation = getPortalCmsNavigation(context);
  const openDetail = currentPortalCmsNavigation.openDetail;
  if (!openDetail) {
    return UNRESOLVED_DETAIL_RESULT;
  }

  return normalizeNavigationResult(await openDetail(navigationContext), UNRESOLVED_DETAIL_RESULT);
}
