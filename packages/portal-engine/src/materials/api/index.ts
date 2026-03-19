import type { PortalEngineContext } from '../../runtime/context';
import {
  getDefaultPortalEngineContext,
  readPortalEngineContextValue,
  writePortalEngineContextValue
} from '../../runtime/context';

export interface CmsApi {
  getCategoryTree: () => Promise<unknown>;
  getUserArticlesByCategory: (
    category: string,
    params?: { pageSize?: number; currentPage?: number }
  ) => Promise<unknown>;
  getUserCarouselsByCategory: (category: string) => Promise<unknown>;
}

const PORTAL_CMS_API_CONTEXT_KEY = Symbol('portal-engine.cms-api');

function createFallbackResponse(message: string) {
  return {
    code: 500,
    success: false,
    message,
    data: null
  };
}

function createFallbackCmsApi(): CmsApi {
  return {
    async getCategoryTree() {
      return createFallbackResponse('portal-engine cmsApi 未配置：getCategoryTree');
    },
    async getUserArticlesByCategory() {
      return createFallbackResponse('portal-engine cmsApi 未配置：getUserArticlesByCategory');
    },
    async getUserCarouselsByCategory() {
      return createFallbackResponse('portal-engine cmsApi 未配置：getUserCarouselsByCategory');
    }
  };
}

export function setPortalCmsApi(
  api: Partial<CmsApi>,
  context: PortalEngineContext = getDefaultPortalEngineContext()
) {
  const currentCmsApi = getPortalCmsApi(context);
  return writePortalEngineContextValue(
    PORTAL_CMS_API_CONTEXT_KEY,
    {
      ...currentCmsApi,
      ...api
    },
    context
  );
}

export function resetPortalCmsApi(context: PortalEngineContext = getDefaultPortalEngineContext()) {
  return writePortalEngineContextValue(PORTAL_CMS_API_CONTEXT_KEY, createFallbackCmsApi(), context);
}

export function getPortalCmsApi(context: PortalEngineContext = getDefaultPortalEngineContext()) {
  return readPortalEngineContextValue<CmsApi>(
    PORTAL_CMS_API_CONTEXT_KEY,
    context,
    createFallbackCmsApi
  );
}

export const cmsApi: CmsApi = {
  getCategoryTree: () => getPortalCmsApi().getCategoryTree(),
  getUserArticlesByCategory: (category, params) =>
    getPortalCmsApi().getUserArticlesByCategory(category, params),
  getUserCarouselsByCategory: (category) => getPortalCmsApi().getUserCarouselsByCategory(category)
};
