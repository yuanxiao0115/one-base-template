import { getObHttpClient } from "@one-base-template/core";
import type { ApiResponse, SysLogPageData, SysLogPageParams, SysLogRecord } from "./types";

export type { ApiResponse, SysLogPageData, SysLogPageParams, SysLogRecord } from "./types";

export const sysLogApi = {
  list: async (params: SysLogPageParams) =>
    getObHttpClient().get<ApiResponse<SysLogPageData>>("/cmict/logstore/sys-log/page", {
      params,
    }),

  remove: async (data: { idList: string[] }) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/logstore/sys-log/delete", { data }),

  detail: async (params: { id: string }) =>
    getObHttpClient().get<ApiResponse<SysLogRecord>>("/cmict/logstore/sys-log/detail", {
      params,
    }),
};

export default sysLogApi;
