import type { ApiPageData } from '@/types/api';

export type { ApiResponse } from '@/types/api';

export interface SysLogRecord {
  id: string;
  userAccount: string;
  operationResult?: number;
  [key: string]: string | number | null | undefined;
}

export interface SysLogPageParams {
  operator?: string;
  clientIp?: string;
  module?: string;
  operationType?: string;
  operationResult?: number | string;
  userAccount?: string;
  nickName?: string;
  browserName?: string;
  clientOS?: string;
  tenantId?: string;
  startTime?: string;
  endTime?: string;
  time?: string[];
  currentPage?: number;
  pageSize?: number;
}

export type SysLogPageData = ApiPageData<SysLogRecord>;
