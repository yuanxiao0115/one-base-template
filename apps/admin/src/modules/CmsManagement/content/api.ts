import { obHttp } from "@one-base-template/core";
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


export const contentApi = {
  page: async (params: ContentPageParams) =>
    obHttp().get<ApiResponse<ContentPageData>>("/cmict/cms/cmsArticleManage", { params }),

  detail: async (id: string) =>
    obHttp().get<ApiResponse<ContentDetail>>(`/cmict/cms/cmsArticleManage/${id}`),

  add: async (data: ContentSavePayload) =>
    obHttp().post<ApiResponse<boolean>>("/cmict/cms/cmsArticleManage", {
      data,
    }),

  update: async (data: ContentSavePayload) =>
    obHttp().put<ApiResponse<boolean>>("/cmict/cms/cmsArticleManage", {
      data,
    }),

  remove: async (data: { id: string }) =>
    obHttp().delete<ApiResponse<boolean>>("/cmict/cms/cmsArticleManage", {
      data,
    }),

  categoryTree: async () =>
    obHttp().get<ApiResponse<ContentCategoryRecord[]>>("/cmict/cms/cmsCategory/tree"),

  uploadResource: async (file: File, options?: UploadRequestOptions) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await obHttp().post<ApiResponse<UploadResourceResult>>("/cmict/file/resource/upload", {
      data: formData,
      $isUpload: true,
      onUploadProgress: options?.onProgress,
    });
    return response.data;
  },

  uploadAttachment: async (file: File, options?: UploadRequestOptions): Promise<UploadAttachmentResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await obHttp().post<ApiResponse<UploadAttachmentResult>>("/cmict/file/upload-file", {
      data: formData,
      $isUpload: true,
      onUploadProgress: options?.onProgress,
    });
    return response.data;
  },
};

export default contentApi;
