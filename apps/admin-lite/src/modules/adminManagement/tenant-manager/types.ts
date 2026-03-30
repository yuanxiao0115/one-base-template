import type { ApiPageData } from '@/types/api';

export interface TenantManagerRecord {
  id: string;
  userAccount?: string;
  tenantName?: string;
  isEnable?: boolean | number;
  createTime?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface TenantManagerPageParams {
  tenantName?: string;
  isEnable?: string | boolean;
  currentPage?: number;
  pageSize?: number;
}

export type TenantManagerPageData = ApiPageData<TenantManagerRecord>;
