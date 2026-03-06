import type { Router } from 'vue-router';

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

let currentPortalCmsNavigation: PortalCmsNavigation = {};

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

export function setPortalCmsNavigation(navigation: Partial<PortalCmsNavigation>) {
  currentPortalCmsNavigation = {
    ...currentPortalCmsNavigation,
    ...navigation,
  };
}

export function resetPortalCmsNavigation() {
  currentPortalCmsNavigation = {};
}

export async function navigatePortalCmsList(
  context: PortalCmsListNavigationContext
): Promise<PortalCmsNavigationResult> {
  const openList = currentPortalCmsNavigation.openList;
  if (!openList) {
    return UNRESOLVED_LIST_RESULT;
  }

  return normalizeNavigationResult(await openList(context), UNRESOLVED_LIST_RESULT);
}

export async function navigatePortalCmsDetail(
  context: PortalCmsDetailNavigationContext
): Promise<PortalCmsNavigationResult> {
  const openDetail = currentPortalCmsNavigation.openDetail;
  if (!openDetail) {
    return UNRESOLVED_DETAIL_RESULT;
  }

  return normalizeNavigationResult(await openDetail(context), UNRESOLVED_DETAIL_RESULT);
}
