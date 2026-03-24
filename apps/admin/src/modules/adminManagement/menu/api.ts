import { obHttp } from '@one-base-template/core';
import type {
  ApiResponse,
  MenuPermissionRecord,
  PermissionSavePayload,
  PermissionSearchParams,
  PermissionTypeOption
} from './types';

export const menuPermissionApi = {
  getResourceTypeEnum: async () =>
    obHttp().get<ApiResponse<PermissionTypeOption[]>>('/cmict/admin/permission/resource-type/enum'),

  getPermissionTree: async () =>
    obHttp().get<ApiResponse<MenuPermissionRecord[]>>('/cmict/admin/permission/tree'),

  getPermissionList: async (params: PermissionSearchParams) =>
    obHttp().get<ApiResponse<MenuPermissionRecord[]>>('/cmict/admin/permission/list', {
      params
    }),

  addPermission: async (data: PermissionSavePayload) =>
    obHttp().post<ApiResponse<MenuPermissionRecord>>('/cmict/admin/permission/add', { data }),

  editPermission: async (data: PermissionSavePayload) =>
    obHttp().post<ApiResponse<MenuPermissionRecord>>('/cmict/admin/permission/update', { data }),

  deletePermission: async (idList: string[] | string) =>
    obHttp().post<ApiResponse<null>>('/cmict/admin/permission/delete', {
      data: { idList }
    })
};

export default menuPermissionApi;
