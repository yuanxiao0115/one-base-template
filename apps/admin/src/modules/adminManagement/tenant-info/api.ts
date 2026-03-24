import { obHttp } from '@one-base-template/core';
import type {
  ApiResponse,
  TenantInfoPageData,
  TenantInfoPageParams,
  TenantPermissionTreeNode,
  TenantInfoRecord,
  TenantInfoSavePayload
} from './types';

export const tenantInfoApi = {
  page: async (params: TenantInfoPageParams) =>
    obHttp().get<ApiResponse<TenantInfoPageData>>('/cmict/admin/tenant/page', { params }),

  add: async (data: TenantInfoSavePayload) =>
    obHttp().post<ApiResponse<TenantInfoRecord>>('/cmict/admin/tenant/add', { data }),

  update: async (data: TenantInfoSavePayload) =>
    obHttp().post<ApiResponse<TenantInfoRecord>>('/cmict/admin/tenant/update', { data }),

  remove: async (data: { idList: string | string[] }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/tenant/delete', { data }),

  deactivate: async (data: { ids: string | string[]; isEnable: boolean }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/tenant/deactivate', { data }),

  checkUnique: async (data: { id?: string; tenantName?: string; contactPhone?: string }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/tenant/unique/check', { data }),

  getTenantTree: async () =>
    obHttp().get<ApiResponse<TenantPermissionTreeNode[]>>('/cmict/admin/permission/tenant-tree'),

  getTenantPermissionIds: async (params: { tenantId: string }) =>
    obHttp().get<ApiResponse<Array<string | number>>>('/cmict/admin/tenant/permission-id/list', {
      params
    }),

  updateTenantPermission: async (data: { tenantId: string; permissionIdList: string[] }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/tenant/permission/edit', { data })
};

export default tenantInfoApi;
