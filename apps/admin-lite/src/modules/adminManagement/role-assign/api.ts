import { obHttp } from '@one-base-template/core';
import type { ApiResponse } from '@/types/api';
import type { RoleMemberPageData, RoleMemberRecord, RoleOption } from './types';
export const roleAssignApi = {
  listRoles: async (params: { roleName?: string }) =>
    obHttp().get<ApiResponse<RoleOption[]>>('/cmict/admin/role/list', { params }),

  listMembersByPage: async (params: {
    roleId: string;
    keyWord?: string;
    currentPage?: number;
    pageSize?: number;
  }) => obHttp().get<ApiResponse<RoleMemberPageData>>('/cmict/admin/role/member/page', { params }),

  listMembers: async (params: { roleId: string }) =>
    obHttp().get<ApiResponse<RoleMemberRecord[]>>('/cmict/admin/role/member/list', {
      params
    }),

  addMembers: async (data: { roleId: string; userIdList: string[] }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/role/member/add', {
      data
    }),

  removeMembers: async (data: { roleId: string; userIdList: string[] }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/role/member/remove', { data })
};

export default roleAssignApi;
