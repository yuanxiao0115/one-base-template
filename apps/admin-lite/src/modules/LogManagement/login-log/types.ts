import type { ApiPageData } from '@/types/api';

export type { ApiResponse } from '@/types/api';

export interface LoginLogRecord {
  id: string;
  userAccount: string;
  [key: string]: string | number | null | undefined;
}

export interface LoginLogPageParams {
  nickName?: string;
  clientType?: string;
  startTime?: string;
  endTime?: string;
  time?: string[];
  currentPage?: number;
  pageSize?: number;
}

export type LoginLogPageData = ApiPageData<LoginLogRecord>;

export interface ClientTypeOption {
  key: string;
  value: string;
}
