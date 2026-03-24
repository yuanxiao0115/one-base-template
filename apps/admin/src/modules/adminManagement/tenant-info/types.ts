import type { ApiPageData } from '@/types/api';

export type { ApiResponse } from '@/types/api';

export interface TenantInfoRecord {
  id: string;
  tenantName?: string;
  contactName?: string;
  contactPhone?: string;
  tenantState?: number | string;
  maxNumber?: number | string;
  managerAccount?: string;
  expireTime?: string;
  remark?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface TenantInfoPageParams {
  tenantName?: string;
  id?: string;
  contactName?: string;
  tenantState?: string | number;
  currentPage?: number;
  pageSize?: number;
}

export type TenantInfoPageData = ApiPageData<TenantInfoRecord>;

export interface TenantInfoSavePayload {
  id?: string;
  tenantName: string;
  contactName: string;
  contactPhone: string;
  maxNumber: number;
  tenantState: number;
  managerAccount: string;
  expireTime: string;
  remark?: string;
}

export interface TenantPermissionTreeNode {
  id: string | number;
  resourceName?: string;
  children?: TenantPermissionTreeNode[];
  [key: string]: unknown;
}

export interface TenantInfoForm {
  id: string;
  tenantName: string;
  contactName: string;
  contactPhone: string;
  maxNumber: number;
  tenantState: number;
  managerAccount: string;
  expireTime: string;
  remark: string;
}
