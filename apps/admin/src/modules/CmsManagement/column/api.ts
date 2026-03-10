import { getObHttpClient } from "@one-base-template/core";
import type { ApiResponse, ColumnRecord, ColumnSavePayload, ColumnTreeParams } from "./types";

export type { ApiResponse, ColumnRecord, ColumnSavePayload, ColumnTreeParams } from "./types";

export const columnApi = {
  tree: async (params: ColumnTreeParams) =>
    getObHttpClient().get<ApiResponse<ColumnRecord[]>>("/cmict/cms/cmsCategory/tree", { params }),

  add: async (data: ColumnSavePayload) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/cms/cmsCategory", {
      data,
    }),

  update: async (data: ColumnSavePayload) =>
    getObHttpClient().put<ApiResponse<boolean>>("/cmict/cms/cmsCategory", {
      data,
    }),

  remove: async (data: { id: string }) =>
    getObHttpClient().delete<ApiResponse<boolean>>("/cmict/cms/cmsCategory", {
      data,
    }),
};

export default columnApi;
