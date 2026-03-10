import { getObHttpClient } from "@one-base-template/core";
import type { ApiResponse, MenuPermissionRecord, PermissionSavePayload, PermissionSearchParams, PermissionTypeOption } from "./types";

export type { ApiResponse, MenuPermissionRecord, PermissionSavePayload, PermissionSearchParams, PermissionTypeOption } from "./types";

export const menuPermissionApi = {
  getResourceTypeEnum: async () =>
    getObHttpClient().get<ApiResponse<PermissionTypeOption[]>>("/cmict/admin/permission/resource-type/enum"),

  getPermissionTree: async () =>
    getObHttpClient().get<ApiResponse<MenuPermissionRecord[]>>("/cmict/admin/permission/tree"),

  getPermissionList: async (params: PermissionSearchParams) =>
    getObHttpClient().get<ApiResponse<MenuPermissionRecord[]>>("/cmict/admin/permission/list", {
      params,
    }),

  addPermission: async (data: PermissionSavePayload) =>
    getObHttpClient().post<ApiResponse<MenuPermissionRecord>>("/cmict/admin/permission/add", { data }),

  editPermission: async (data: PermissionSavePayload) =>
    getObHttpClient().post<ApiResponse<MenuPermissionRecord>>("/cmict/admin/permission/update", { data }),

  deletePermission: async (idList: string[] | string) =>
    getObHttpClient().post<ApiResponse<null>>("/cmict/admin/permission/delete", {
      data: { idList },
    }),
};

export default menuPermissionApi;
