import { obHttp } from '@one-base-template/core';
import type {
  MaterialBizResponse,
  MaterialCategoryDeletePayload,
  MaterialCategoryListParams,
  MaterialCategoryRecord,
  MaterialCategorySavePayload,
  MaterialDeletePayload,
  MaterialPageData,
  MaterialPageParams,
  MaterialRecord,
  MaterialSavePayload,
  UploadRequestOptions,
  UploadResourceResult
} from './types';

export const materialApi = {
  listCategories: async (params: MaterialCategoryListParams) =>
    obHttp().get<MaterialBizResponse<MaterialCategoryRecord[]>>('/cmict/portal/fodder-label/list', {
      params
    }),

  addCategory: async (data: MaterialCategorySavePayload) =>
    obHttp().post<MaterialBizResponse<boolean>>('/cmict/portal/fodder-label/add', {
      data
    }),

  updateCategory: async (data: MaterialCategorySavePayload) =>
    obHttp().post<MaterialBizResponse<boolean>>('/cmict/portal/fodder-label/update', {
      data
    }),

  removeCategory: async (data: MaterialCategoryDeletePayload) =>
    obHttp().post<MaterialBizResponse<boolean>>('/cmict/portal/fodder-label/delete', {
      data
    }),

  pageMaterials: async (params: MaterialPageParams) =>
    obHttp().get<MaterialBizResponse<MaterialPageData>>('/cmict/portal/fodder/page', {
      params
    }),

  getMaterialDetail: async (params: { id: string }) =>
    obHttp().get<MaterialBizResponse<MaterialRecord>>('/cmict/portal/fodder/detail', {
      params
    }),

  addMaterials: async (data: MaterialSavePayload[]) =>
    obHttp().post<MaterialBizResponse<boolean>>('/cmict/portal/fodder/add', {
      data
    }),

  updateMaterial: async (data: MaterialSavePayload) =>
    obHttp().post<MaterialBizResponse<boolean>>('/cmict/portal/fodder/update', {
      data
    }),

  removeMaterials: async (data: MaterialDeletePayload) =>
    obHttp().post<MaterialBizResponse<boolean>>('/cmict/portal/fodder/delete', {
      data
    }),

  uploadResource: async (file: File, options?: UploadRequestOptions) => {
    const formData = new FormData();
    formData.append('file', file);
    return obHttp().post<MaterialBizResponse<UploadResourceResult>>('/cmict/file/resource/upload', {
      data: formData,
      $isUpload: true,
      onUploadProgress: options?.onProgress
    });
  }
};

export default materialApi;
