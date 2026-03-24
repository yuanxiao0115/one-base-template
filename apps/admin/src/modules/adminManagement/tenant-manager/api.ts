import { obHttp } from '@one-base-template/core';
import type { ApiResponse, TenantManagerPageData, TenantManagerPageParams } from './types';

export const tenantManagerApi = {
  page: async (params: TenantManagerPageParams) =>
    obHttp().get<ApiResponse<TenantManagerPageData>>('/cmict/admin/tenant/manager/page', {
      params
    }),

  resetPassword: async (data: { id: string }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/tenant/manager/password-reset', { data }),

  deactivate: async (data: { ids: string[]; isEnable: boolean }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/tenant/manager/deactivate', { data })
};

export default tenantManagerApi;
