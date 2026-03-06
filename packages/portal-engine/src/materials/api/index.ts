export interface CmsApi {
  getCategoryTree: () => Promise<unknown>;
  getUserArticlesByCategory: (category: string, params?: { pageSize?: number; currentPage?: number }) => Promise<unknown>;
  getUserCarouselsByCategory: (category: string) => Promise<unknown>;
}

function createFallbackResponse(message: string) {
  return {
    code: 500,
    success: false,
    message,
    data: null,
  };
}

const fallbackCmsApi: CmsApi = {
  async getCategoryTree() {
    return createFallbackResponse('portal-engine cmsApi 未配置：getCategoryTree');
  },
  async getUserArticlesByCategory() {
    return createFallbackResponse('portal-engine cmsApi 未配置：getUserArticlesByCategory');
  },
  async getUserCarouselsByCategory() {
    return createFallbackResponse('portal-engine cmsApi 未配置：getUserCarouselsByCategory');
  },
};

let currentCmsApi: CmsApi = fallbackCmsApi;

export function setPortalCmsApi(api: Partial<CmsApi>) {
  currentCmsApi = {
    ...currentCmsApi,
    ...api,
  };
}

export function getPortalCmsApi() {
  return currentCmsApi;
}

export const cmsApi: CmsApi = {
  getCategoryTree: () => currentCmsApi.getCategoryTree(),
  getUserArticlesByCategory: (category, params) => currentCmsApi.getUserArticlesByCategory(category, params),
  getUserCarouselsByCategory: (category) => currentCmsApi.getUserCarouselsByCategory(category),
};
