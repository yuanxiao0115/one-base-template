import { getAppHttpClient } from "@/shared/api/http-client";
import { portalEndpoints } from "./endpoints";

interface BizResponse<T> {
  code?: unknown;
  data?: T;
  message?: string;
  success?: boolean;
}

function getHttp() {
  return getAppHttpClient();
}

export const cmsApi = {
  getCategoryTree: async () => getHttp().get<BizResponse<unknown>>(portalEndpoints.cms.categoryTree),

  getUserArticlesByCategory: async (category: string, params?: { pageSize?: number; currentPage?: number }) =>
    getHttp().get<BizResponse<unknown>>(`${portalEndpoints.cms.userArticleListPrefix}/${category}/article/list`, {
      params: {
        pageSize: params?.pageSize ?? 20,
        currentPage: params?.currentPage ?? 1,
      },
    }),

  getUserCarouselsByCategory: async (category: string) =>
    getHttp().get<BizResponse<unknown>>(`${portalEndpoints.cms.userCarouselListPrefix}/${category}/carousel/list`, {
      params: {
        pageSize: 20,
        currentPage: 1,
      },
    }),
};
