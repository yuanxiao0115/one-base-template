import { obHttp } from "@one-base-template/core";
import { templateApi } from "./template/api";
import type { BizResponse, PortalTab, PortalTemplate, TabListParams } from "./types";

export { templateApi } from "./template/api";

export const portalApi = {
  template: templateApi,

  tab: {
    list: async (params: TabListParams) =>
      obHttp().get<BizResponse<unknown>>("/cmict/portal/tab/page", { params }),

    detail: async (params: { id: string }) =>
      obHttp().get<BizResponse<PortalTab>>("/cmict/portal/tab/detail", {
        params,
      }),

    add: async (data: Partial<PortalTab>) =>
      obHttp().post<BizResponse<unknown>>("/cmict/portal/tab/add", {
        data,
      }),

    update: async (data: Partial<PortalTab>) =>
      obHttp().put<BizResponse<unknown>>("/cmict/portal/tab/update", {
        data,
      }),

    delete: async (data: { id: string }) =>
      obHttp().delete<BizResponse<unknown>>("/cmict/portal/tab/delete", {
        data,
      }),
  },

  templatePublic: {
    getDetail: async (params: { id: string }) =>
      obHttp().get<BizResponse<PortalTemplate>>("/cmict/portal/public/portal/template/get-detail", { params }),
  },

  tabPublic: {
    detail: async (params: { id: string }) =>
      obHttp().get<BizResponse<PortalTab>>("/cmict/portal/public/portal/tab/detail", {
        params,
      }),
  },
};

interface CmsBizResponse<T> {
  code?: unknown;
  data?: T;
  message?: string;
  success?: boolean;
}

/**
 * cMS 接口（party-building 组件依赖）
 */
export const cmsApi = {
  getCategoryTree: async () => obHttp().get<CmsBizResponse<unknown>>("/cmict/cms/cmsCategory/tree"),

  getUserArticlesByCategory: async (category: string, params?: { pageSize?: number; currentPage?: number }) =>
    obHttp().get<CmsBizResponse<unknown>>(`/cmict/cms/cmsUser/category/${category}/article/list`, {
      params: {
        pageSize: params?.pageSize ?? 20,
        currentPage: params?.currentPage ?? 1,
      },
    }),

  getUserCarouselsByCategory: async (category: string) =>
    obHttp().get<CmsBizResponse<unknown>>(`/cmict/cms/cmsUser/category/${category}/carousel/list`, {
      params: {
        pageSize: 20,
        currentPage: 1,
      },
    }),
};
