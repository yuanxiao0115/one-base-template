import { getObHttpClient } from "@one-base-template/core";
import type {
  ApiResponse,
  ContentCategoryRecord,
  ContentDetail,
  ContentPageData,
  ContentPageParams,
  ContentSavePayload,
  UploadAttachmentResult,
  UploadRequestOptions,
  UploadResourceResult,
} from "./types";

export type {
  ApiResponse,
  ContentAttachment,
  ContentCategoryRecord,
  ContentDetail,
  ContentPageData,
  ContentPageParams,
  ContentRecord,
  ContentSavePayload,
  UploadAttachmentResult,
  UploadRequestOptions,
  UploadResourceResult,
} from "./types";

export const contentApi = {
  page: async (params: ContentPageParams) =>
    getObHttpClient().get<ApiResponse<ContentPageData>>("/cmict/cms/cmsArticleManage", { params }),

  detail: async (id: string) =>
    getObHttpClient().get<ApiResponse<ContentDetail>>(`/cmict/cms/cmsArticleManage/${id}`),

  add: async (data: ContentSavePayload) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/cms/cmsArticleManage", {
      data,
    }),

  update: async (data: ContentSavePayload) =>
    getObHttpClient().put<ApiResponse<boolean>>("/cmict/cms/cmsArticleManage", {
      data,
    }),

  remove: async (data: { id: string }) =>
    getObHttpClient().delete<ApiResponse<boolean>>("/cmict/cms/cmsArticleManage", {
      data,
    }),

  categoryTree: async () =>
    getObHttpClient().get<ApiResponse<ContentCategoryRecord[]>>("/cmict/cms/cmsCategory/tree"),

  uploadResource: async (file: File, options?: UploadRequestOptions) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await getObHttpClient().post<ApiResponse<UploadResourceResult>>("/cmict/file/resource/upload", {
      data: formData,
      $isUpload: true,
      onUploadProgress: options?.onProgress,
    });
    return response.data;
  },

  uploadAttachment: async (file: File, options?: UploadRequestOptions): Promise<UploadAttachmentResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await getObHttpClient().post<ApiResponse<UploadAttachmentResult>>("/cmict/file/upload-file", {
      data: formData,
      $isUpload: true,
      onUploadProgress: options?.onProgress,
    });
    return response.data;
  },
};

export default contentApi;
