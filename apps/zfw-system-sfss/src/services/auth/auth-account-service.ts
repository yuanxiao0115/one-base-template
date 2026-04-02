import { obHttp } from '@one-base-template/core';
import type { ApiResponse } from '@/types/api';

export interface TenantOptionRecord {
  id: string | number;
  tenantName: string;
  [key: string]: unknown;
}

export interface SwitchTenantResult {
  tenantId?: string | number;
  tenantName?: string;
}

export interface UploadAvatarResult {
  id?: string;
  url?: string;
  [key: string]: unknown;
}

export const authAccountService = {
  listTenants: async () =>
    obHttp().get<ApiResponse<TenantOptionRecord[]>>('/cmict/admin/tenant/list'),

  switchTenant: async (data: { tenantId: string | number }) =>
    obHttp().post<ApiResponse<SwitchTenantResult>>('/cmict/admin/tenant/switch', {
      data
    }),

  checkPassword: async (data: { oldPassword: string }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/user/password-check', {
      data
    }),

  changePassword: async (data: { oldPassword: string; newPassword: string }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/user/password-change', {
      data
    }),

  uploadAvatar: async (data: FormData) =>
    obHttp().post<ApiResponse<UploadAvatarResult>>('/cmict/file/avatar/manage/upload', {
      data,
      $isUpload: true
    })
};

export default authAccountService;
