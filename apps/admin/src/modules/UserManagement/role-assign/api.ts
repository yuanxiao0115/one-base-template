import { obHttp } from "@one-base-template/core";
import type {
  ApiResponse,
  RoleMemberPageData,
  RoleMemberPageParams,
  RoleMemberPayload,
  RoleMemberRecord,
  RoleOption,
  UserOption,
} from "./types";
export const roleAssignApi = {
  listRoles: async (params: { roleName?: string }) =>
    obHttp().get<ApiResponse<RoleOption[]>>("/cmict/admin/role/list", { params }),

  pageMembers: async (params: RoleMemberPageParams) =>
    obHttp().get<ApiResponse<RoleMemberPageData>>("/cmict/admin/role/member/page", { params }),

  listMembers: async (params: { roleId: string }) =>
    obHttp().get<ApiResponse<RoleMemberRecord[]>>("/cmict/admin/role/member/list", {
      params,
    }),

  addMembers: async (data: RoleMemberPayload) =>
    obHttp().post<ApiResponse<boolean>>("/cmict/admin/role/member/add", {
      data,
    }),

  removeMembers: async (data: RoleMemberPayload) =>
    obHttp().post<ApiResponse<boolean>>("/cmict/admin/role/member/remove", { data }),

  searchUsers: async (params: { nickName?: string }) =>
    obHttp().get<ApiResponse<UserOption[]>>("/cmict/admin/user/list", { params }),
};

export default roleAssignApi;
