import { getHttpClient } from "@/shared/api/http-client";
import type { ApiResponse, SysLogPageData, SysLogPageParams, SysLogRecord } from "./types";

export type { ApiResponse, SysLogPageData, SysLogPageParams, SysLogRecord } from "./types";

export const sysLogApi = {
  list: async (params: SysLogPageParams) =>
    getHttpClient().get<ApiResponse<SysLogPageData>>("/cmict/logstore/sys-log/page", {
      params,
    }),

  remove: async (data: { idList: string[] }) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/logstore/sys-log/delete", { data }),

  detail: async (params: { id: string }) =>
    getHttpClient().get<ApiResponse<SysLogRecord>>("/cmict/logstore/sys-log/detail", {
      params,
    }),
};

export default sysLogApi;
