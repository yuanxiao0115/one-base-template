import { obHttp } from '@one-base-template/core';
import type {
  ApiResponse,
  DictItemPageData,
  DictItemPageParams,
  DictItemSavePayload,
  DictPageData,
  DictPageParams,
  DictSavePayload
} from './types';

export const dictApi = {
  page: async (params: DictPageParams) =>
    obHttp().get<ApiResponse<DictPageData>>('/cmict/admin/data-dict/page', { params }),

  add: async (data: DictSavePayload) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/data-dict/add', {
      data
    }),

  update: async (data: DictSavePayload) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/data-dict/update', { data }),

  remove: async (data: { idList: string[] | string }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/data-dict/delete', { data })
};

export const dictItemApi = {
  page: async (params: DictItemPageParams) =>
    obHttp().get<ApiResponse<DictItemPageData>>('/cmict/admin/dict-item/page', { params }),

  add: async (data: DictItemSavePayload) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/dict-item/add', {
      data
    }),

  update: async (data: DictItemSavePayload) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/dict-item/update', { data }),

  remove: async (data: { idList: string[] | string }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/dict-item/delete', { data }),

  toggleStatus: async (data: { ids: string[] | string; isEnable: boolean }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/dict-item/deactivate', { data })
};

export default dictApi;
