import { obHttp } from "@one-base-template/core";
import type { ApiResponse, PositionPageData, PositionPageParams, PositionRecord, PositionSavePayload, PositionUniqueParams } from "./types";


export const positionApi = {
  page: async (params: PositionPageParams) =>
    obHttp().get<ApiResponse<PositionPageData>>("/cmict/admin/sys-post/page", { params }),

  addPost: async (data: PositionSavePayload) =>
    obHttp().post<ApiResponse<PositionRecord>>("/cmict/admin/sys-post/add", { data }),

  updatePost: async (data: PositionSavePayload) =>
    obHttp().post<ApiResponse<PositionRecord>>("/cmict/admin/sys-post/update", { data }),

  removePost: async (data: { id: string }) =>
    obHttp().post<ApiResponse<null>>("/cmict/admin/sys-post/delete", {
      data,
    }),

  checkUnique: async (params: PositionUniqueParams) =>
    obHttp().get<ApiResponse<boolean>>("/cmict/admin/sys-post/unique/check", { params }),
};

export default positionApi;
