import { getObHttpClient } from "@one-base-template/core";
import { normalizeTemplateWhiteList } from "../compat/mapper";
import type { BizResponse, PageResult, PortalTemplate, TemplateListParams } from "./types";

export type { BizResponse, PageResult, PortalTemplate, TemplateListParams } from "./types";

export const templateApi = {
  list: async (params: TemplateListParams) =>
    getObHttpClient().get<BizResponse<PageResult<PortalTemplate>>>("/cmict/portal/template/page", { params }),

  detail: async (params: { id: string }) => {
    const res = await getObHttpClient().get<BizResponse<PortalTemplate>>("/cmict/portal/template/detail", { params });
    return normalizeTemplateWhiteList(res);
  },

  getDetail: async (params: { id: string }) =>
    getObHttpClient().get<BizResponse<PortalTemplate>>("/cmict/portal/template/get-detail", { params }),

  add: async (data: Partial<PortalTemplate>) =>
    getObHttpClient().post<BizResponse<unknown>>("/cmict/portal/template/add", {
      data,
    }),

  copy: async (data: { id: string; templateName?: string }) =>
    getObHttpClient().post<BizResponse<unknown>>("/cmict/portal/template/copy", {
      data,
    }),

  update: async (data: Partial<PortalTemplate>) =>
    getObHttpClient().post<BizResponse<unknown>>("/cmict/portal/template/update", {
      data,
    }),

  publish: async (params: { id: string; status: number }) =>
    getObHttpClient().get<BizResponse<unknown>>(`/cmict/portal/template/publish/${params.status}`, {
      params: { id: params.id },
    }),

  hideToggle: async (params: { id: string; tabId: string; isHide: number }) =>
    getObHttpClient().get<BizResponse<unknown>>("/cmict/portal/template/hide", {
      params,
    }),

  delete: async (data: { id: string }) =>
    getObHttpClient().post<BizResponse<unknown>>("/cmict/portal/template/delete", {
      data,
    }),
};

export default templateApi;
