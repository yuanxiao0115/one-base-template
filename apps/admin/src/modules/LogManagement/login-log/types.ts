import type { ApiPageData } from "@/shared/api/types";

export type { ApiResponse } from "@/shared/api/types";

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
