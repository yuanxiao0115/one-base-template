import { obHttp } from '@one-base-template/core';

interface CmsBizResponse<T> {
  code?: unknown;
  data?: T;
  message?: string;
  success?: boolean;
}

export const cmsApi = {
  getCategoryTree: async () => obHttp().get<CmsBizResponse<unknown>>('/cmict/cms/cmsCategory/tree'),

  getUserArticlesByCategory: async (
    category: string,
    params?: { pageSize?: number; currentPage?: number }
  ) =>
    obHttp().get<CmsBizResponse<unknown>>(`/cmict/cms/cmsUser/category/${category}/article/list`, {
      params: {
        pageSize: params?.pageSize ?? 20,
        currentPage: params?.currentPage ?? 1
      }
    }),

  getUserCarouselsByCategory: async (category: string) =>
    obHttp().get<CmsBizResponse<unknown>>(`/cmict/cms/cmsUser/category/${category}/carousel/list`, {
      params: {
        pageSize: 20,
        currentPage: 1
      }
    })
};
