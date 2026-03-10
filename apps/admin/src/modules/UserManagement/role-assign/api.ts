import { getObHttpClient } from "@one-base-template/core";
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
    getObHttpClient().get<ApiResponse<RoleOption[]>>("/cmict/admin/role/list", { params }),

  pageMembers: async (params: RoleMemberPageParams) =>
    getObHttpClient().get<ApiResponse<RoleMemberPageData>>("/cmict/admin/role/member/page", { params }),

  listMembers: async (params: { roleId: string }) =>
    getObHttpClient().get<ApiResponse<RoleMemberRecord[]>>("/cmict/admin/role/member/list", {
      params,
    }),

  addMembers: async (data: RoleMemberPayload) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/role/member/add", {
      data,
    }),

  removeMembers: async (data: RoleMemberPayload) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/role/member/remove", { data }),

  getOrgContactsLazy: async (params: { parentId?: string }) =>
    getObHttpClient().get<ApiResponse<RoleAssignContactNode[]>>("/cmict/admin/org/contacts/lazy/tree", { params }),

  searchContactUsers: async (params: { search?: string }) =>
    getObHttpClient().get<ApiResponse<RoleAssignContactUserNode[]>>("/cmict/admin/user/structure/search/", { params }),

  searchUsers: async (params: { nickName?: string }) =>
    getObHttpClient().get<ApiResponse<UserOption[]>>("/cmict/admin/user/list", { params }),
};

export default roleAssignApi;
