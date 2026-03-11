import { obHttp } from "@one-base-template/core";
import { portalEndpoints } from "./endpoints";

interface BizResponse<T> {
  code?: unknown;
  data?: T;
  message?: string;
  success?: boolean;
}

export const cmsApi = {
  getCategoryTree: async () => obHttp().get<BizResponse<unknown>>(portalEndpoints.cms.categoryTree),

  getUserArticlesByCategory: async (category: string, params?: { pageSize?: number; currentPage?: number }) =>
    obHttp().get<BizResponse<unknown>>(`${portalEndpoints.cms.userArticleListPrefix}/${category}/article/list`, {
      params: {
        pageSize: params?.pageSize ?? 20,
        currentPage: params?.currentPage ?? 1,
      },
    }),

  getUserCarouselsByCategory: async (category: string) =>
    obHttp().get<BizResponse<unknown>>(`${portalEndpoints.cms.userCarouselListPrefix}/${category}/carousel/list`, {
      params: {
        pageSize: 20,
        currentPage: 1,
      },
    }),
};
