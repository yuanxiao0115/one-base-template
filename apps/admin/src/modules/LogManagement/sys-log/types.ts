import type { ApiPageData } from "@/shared/api/types";

export type { ApiResponse } from "@/shared/api/types";

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
