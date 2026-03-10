import { getHttpClient } from "@/shared/api/http-client";
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
    getHttpClient().get<ApiResponse<DictPageData>>("/cmict/admin/data-dict/page", { params }),

  add: async (data: DictSavePayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/data-dict/add", {
      data,
    }),

  update: async (data: DictSavePayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/data-dict/update", { data }),

  remove: async (data: { idList: string[] | string }) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/data-dict/delete", { data }),
};

export const dictItemApi = {
  page: async (params: DictItemPageParams) =>
    getHttpClient().get<ApiResponse<DictItemPageData>>("/cmict/admin/dict-item/page", { params }),

  add: async (data: DictItemSavePayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/dict-item/add", {
      data,
    }),

  update: async (data: DictItemSavePayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/dict-item/update", { data }),

  remove: async (data: { idList: string[] | string }) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/dict-item/delete", { data }),

  toggleStatus: async (data: { ids: string[] | string; isEnable: boolean }) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/dict-item/deactivate", { data }),
};

export default dictApi;
