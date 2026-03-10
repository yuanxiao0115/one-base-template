import { getHttpClient } from "@/shared/api/http-client";
import type { ApiResponse, PositionPageData, PositionPageParams, PositionRecord, PositionSavePayload, PositionUniqueParams } from "./types";

export type { ApiResponse, PositionPageData, PositionPageParams, PositionRecord, PositionSavePayload, PositionUniqueParams } from "./types";

export const positionApi = {
  page: async (params: PositionPageParams) =>
    getHttpClient().get<ApiResponse<PositionPageData>>("/cmict/admin/sys-post/page", { params }),

  addPost: async (data: PositionSavePayload) =>
    getHttpClient().post<ApiResponse<PositionRecord>>("/cmict/admin/sys-post/add", { data }),

  updatePost: async (data: PositionSavePayload) =>
    getHttpClient().post<ApiResponse<PositionRecord>>("/cmict/admin/sys-post/update", { data }),

  removePost: async (data: { id: string }) =>
    getHttpClient().post<ApiResponse<null>>("/cmict/admin/sys-post/delete", {
      data,
    }),

  checkUnique: async (params: PositionUniqueParams) =>
    getHttpClient().get<ApiResponse<boolean>>("/cmict/admin/sys-post/unique/check", { params }),
};

export default positionApi;
