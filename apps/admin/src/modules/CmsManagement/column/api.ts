import { obHttp } from "@one-base-template/core";
import type { ApiResponse, ColumnRecord, ColumnSavePayload, ColumnTreeParams } from "./types";


export const columnApi = {
  tree: async (params: ColumnTreeParams) =>
    obHttp().get<ApiResponse<ColumnRecord[]>>("/cmict/cms/cmsCategory/tree", { params }),

  add: async (data: ColumnSavePayload) =>
    obHttp().post<ApiResponse<boolean>>("/cmict/cms/cmsCategory", {
      data,
    }),

  update: async (data: ColumnSavePayload) =>
    obHttp().put<ApiResponse<boolean>>("/cmict/cms/cmsCategory", {
      data,
    }),

  remove: async (data: { id: string }) =>
    obHttp().delete<ApiResponse<boolean>>("/cmict/cms/cmsCategory", {
      data,
    }),
};

export default columnApi;
