import { getHttpClient } from "@/shared/api/http-client";
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
    getHttpClient().get<ApiResponse<RolePageData>>("/cmict/admin/role/page", { params }),

  add: async (data: RoleSavePayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/role/add", {
      data,
    }),

  update: async (data: RoleSavePayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/role/update", {
      data,
    }),

  remove: async (data: { idList: string[] }) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/role/delete", {
      data,
    }),

  getPermissionTree: async () =>
    getHttpClient().get<ApiResponse<PermissionTreeNode[]>>("/cmict/admin/permission/tree"),

  getRolePermissionIds: async (params: { roleId: string }) =>
    getHttpClient().get<ApiResponse<string[]>>("/cmict/admin/permission/id/list", {
      params,
    }),

  updateRolePermissions: async (data: RolePermissionSavePayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/role/permission/edit", { data }),
};

export default roleApi;
