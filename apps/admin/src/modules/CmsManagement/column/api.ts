import { getHttpClient } from "@/shared/api/http-client";
import type { ApiResponse, ColumnRecord, ColumnSavePayload, ColumnTreeParams } from "./types";

export type { ApiResponse, ColumnRecord, ColumnSavePayload, ColumnTreeParams } from "./types";

export const columnApi = {
  tree: async (params: ColumnTreeParams) =>
    getHttpClient().get<ApiResponse<ColumnRecord[]>>("/cmict/cms/cmsCategory/tree", { params }),

  add: async (data: ColumnSavePayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/cms/cmsCategory", {
      data,
    }),

  update: async (data: ColumnSavePayload) =>
    getHttpClient().put<ApiResponse<boolean>>("/cmict/cms/cmsCategory", {
      data,
    }),

  remove: async (data: { id: string }) =>
    getHttpClient().delete<ApiResponse<boolean>>("/cmict/cms/cmsCategory", {
      data,
    }),
};

export default columnApi;
