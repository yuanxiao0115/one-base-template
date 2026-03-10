import { getHttpClient } from "@/shared/api/http-client";
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
    getHttpClient().get<ApiResponse<ContentPageData>>("/cmict/cms/cmsArticleManage", { params }),

  detail: async (id: string) =>
    getHttpClient().get<ApiResponse<ContentDetail>>(`/cmict/cms/cmsArticleManage/${id}`),

  add: async (data: ContentSavePayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/cms/cmsArticleManage", {
      data,
    }),

  update: async (data: ContentSavePayload) =>
    getHttpClient().put<ApiResponse<boolean>>("/cmict/cms/cmsArticleManage", {
      data,
    }),

  remove: async (data: { id: string }) =>
    getHttpClient().delete<ApiResponse<boolean>>("/cmict/cms/cmsArticleManage", {
      data,
    }),

  categoryTree: async () =>
    getHttpClient().get<ApiResponse<ContentCategoryRecord[]>>("/cmict/cms/cmsCategory/tree"),

  uploadResource: async (file: File, options?: UploadRequestOptions) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await getHttpClient().post<ApiResponse<UploadResourceResult>>("/cmict/file/resource/upload", {
      data: formData,
      $isUpload: true,
      onUploadProgress: options?.onProgress,
    });
    return response.data;
  },

  uploadAttachment: async (file: File, options?: UploadRequestOptions): Promise<UploadAttachmentResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await getHttpClient().post<ApiResponse<UploadAttachmentResult>>("/cmict/file/upload-file", {
      data: formData,
      $isUpload: true,
      onUploadProgress: options?.onProgress,
    });
    return response.data;
  },
};

export default contentApi;
