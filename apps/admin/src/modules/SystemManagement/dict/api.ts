import { getObHttpClient } from "@one-base-template/core";
import type {
  ApiResponse,
  DictItemPageData,
  DictItemPageParams,
  DictItemSavePayload,
  DictPageData,
  DictPageParams,
  DictSavePayload,
} from "./types";

export type {
  ApiResponse,
  DictItemPageData,
  DictItemPageParams,
  DictItemRecord,
  DictItemSavePayload,
  DictPageData,
  DictPageParams,
  DictRecord,
  DictSavePayload,
} from "./types";

export const dictApi = {
  page: async (params: DictPageParams) =>
    getObHttpClient().get<ApiResponse<DictPageData>>("/cmict/admin/data-dict/page", { params }),

  add: async (data: DictSavePayload) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/data-dict/add", {
      data,
    }),

  update: async (data: DictSavePayload) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/data-dict/update", { data }),

  remove: async (data: { idList: string[] | string }) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/data-dict/delete", { data }),
};

export const dictItemApi = {
  page: async (params: DictItemPageParams) =>
    getObHttpClient().get<ApiResponse<DictItemPageData>>("/cmict/admin/dict-item/page", { params }),

  add: async (data: DictItemSavePayload) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/dict-item/add", {
      data,
    }),

  update: async (data: DictItemSavePayload) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/dict-item/update", { data }),

  remove: async (data: { idList: string[] | string }) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/dict-item/delete", { data }),

  toggleStatus: async (data: { ids: string[] | string; isEnable: boolean }) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/dict-item/deactivate", { data }),
};

export default dictApi;
