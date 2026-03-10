import { getObHttpClient } from "@one-base-template/core";
import type {
  ApiResponse,
  PermissionTreeNode,
  RolePageData,
  RolePageParams,
  RolePermissionSavePayload,
  RoleSavePayload,
} from "./types";

export type {
  ApiResponse,
  PermissionTreeNode,
  RolePageData,
  RolePageParams,
  RolePermissionSavePayload,
  RoleRecord,
  RoleSavePayload,
} from "./types";

export const roleApi = {
  page: async (params: RolePageParams) =>
    getObHttpClient().get<ApiResponse<RolePageData>>("/cmict/admin/role/page", { params }),

  add: async (data: RoleSavePayload) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/role/add", {
      data,
    }),

  update: async (data: RoleSavePayload) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/role/update", {
      data,
    }),

  remove: async (data: { idList: string[] }) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/role/delete", {
      data,
    }),

  getPermissionTree: async () =>
    getObHttpClient().get<ApiResponse<PermissionTreeNode[]>>("/cmict/admin/permission/tree"),

  getRolePermissionIds: async (params: { roleId: string }) =>
    getObHttpClient().get<ApiResponse<string[]>>("/cmict/admin/permission/id/list", {
      params,
    }),

  updateRolePermissions: async (data: RolePermissionSavePayload) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/role/permission/edit", { data }),
};

export default roleApi;
