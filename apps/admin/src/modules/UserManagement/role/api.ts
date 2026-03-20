import { obHttp } from '@one-base-template/core';
import type { ApiResponse } from '@/shared/api/types';
import type { PermissionTreeNode, RolePageData, RolePageParams, RoleSavePayload } from './types';

export const roleApi = {
  page: async (params: RolePageParams) =>
    obHttp().get<ApiResponse<RolePageData>>('/cmict/admin/role/page', { params }),

  add: async (data: RoleSavePayload) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/role/add', {
      data
    }),

  update: async (data: RoleSavePayload) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/role/update', {
      data
    }),

  remove: async (data: { idList: string[] }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/role/delete', {
      data
    }),

  getPermissionTree: async () =>
    obHttp().get<ApiResponse<PermissionTreeNode[]>>('/cmict/admin/permission/tree'),

  getRolePermissionIds: async (params: { roleId: string }) =>
    obHttp().get<ApiResponse<string[]>>('/cmict/admin/permission/id/list', {
      params
    }),

  updateRolePermissions: async (data: { roleId: string; permissionIdList: string[] }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/role/permission/edit', { data })
};

export default roleApi;
