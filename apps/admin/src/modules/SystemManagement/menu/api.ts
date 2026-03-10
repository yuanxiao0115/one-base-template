import { getHttpClient } from "@/shared/api/http-client";
import type { ApiResponse, MenuPermissionRecord, PermissionSavePayload, PermissionSearchParams, PermissionTypeOption } from "./types";

export type { ApiResponse, MenuPermissionRecord, PermissionSavePayload, PermissionSearchParams, PermissionTypeOption } from "./types";

export const menuPermissionApi = {
  getResourceTypeEnum: async () =>
    getHttpClient().get<ApiResponse<PermissionTypeOption[]>>("/cmict/admin/permission/resource-type/enum"),

  getPermissionTree: async () =>
    getHttpClient().get<ApiResponse<MenuPermissionRecord[]>>("/cmict/admin/permission/tree"),

  getPermissionList: async (params: PermissionSearchParams) =>
    getHttpClient().get<ApiResponse<MenuPermissionRecord[]>>("/cmict/admin/permission/list", {
      params,
    }),

  addPermission: async (data: PermissionSavePayload) =>
    getHttpClient().post<ApiResponse<MenuPermissionRecord>>("/cmict/admin/permission/add", { data }),

  editPermission: async (data: PermissionSavePayload) =>
    getHttpClient().post<ApiResponse<MenuPermissionRecord>>("/cmict/admin/permission/update", { data }),

  deletePermission: async (idList: string[] | string) =>
    getHttpClient().post<ApiResponse<null>>("/cmict/admin/permission/delete", {
      data: { idList },
    }),
};

export default menuPermissionApi;
