import { getHttpClient } from "@/shared/api/http-client";
import type {
  ApiResponse,
  RoleAssignContactNode,
  RoleAssignContactUserNode,
  RoleMemberPageData,
  RoleMemberPageParams,
  RoleMemberPayload,
  RoleMemberRecord,
  RoleOption,
  UserOption,
} from "./types";

export type {
  ApiResponse,
  RoleAssignContactNode,
  RoleAssignContactOrgNode,
  RoleAssignContactUserNode,
  RoleMemberPageData,
  RoleMemberPageParams,
  RoleMemberPayload,
  RoleMemberRecord,
  RoleOption,
  UserOption,
} from "./types";

export const roleAssignApi = {
  listRoles: async (params: { roleName?: string }) =>
    getHttpClient().get<ApiResponse<RoleOption[]>>("/cmict/admin/role/list", { params }),

  pageMembers: async (params: RoleMemberPageParams) =>
    getHttpClient().get<ApiResponse<RoleMemberPageData>>("/cmict/admin/role/member/page", { params }),

  listMembers: async (params: { roleId: string }) =>
    getHttpClient().get<ApiResponse<RoleMemberRecord[]>>("/cmict/admin/role/member/list", {
      params,
    }),

  addMembers: async (data: RoleMemberPayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/role/member/add", {
      data,
    }),

  removeMembers: async (data: RoleMemberPayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/role/member/remove", { data }),

  getOrgContactsLazy: async (params: { parentId?: string }) =>
    getHttpClient().get<ApiResponse<RoleAssignContactNode[]>>("/cmict/admin/org/contacts/lazy/tree", { params }),

  searchContactUsers: async (params: { search?: string }) =>
    getHttpClient().get<ApiResponse<RoleAssignContactUserNode[]>>("/cmict/admin/user/structure/search/", { params }),

  searchUsers: async (params: { nickName?: string }) =>
    getHttpClient().get<ApiResponse<UserOption[]>>("/cmict/admin/user/list", { params }),
};

export default roleAssignApi;
