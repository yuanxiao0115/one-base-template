import { obHttp } from "@one-base-template/core";
import type { ApiResponse, SysLogPageData, SysLogPageParams, SysLogRecord } from "./types";


export const sysLogApi = {
  list: async (params: SysLogPageParams) =>
    obHttp().get<ApiResponse<SysLogPageData>>("/cmict/logstore/sys-log/page", {
      params,
    }),

  remove: async (data: { idList: string[] }) =>
    obHttp().post<ApiResponse<boolean>>("/cmict/logstore/sys-log/delete", { data }),

  detail: async (params: { id: string }) =>
    obHttp().get<ApiResponse<SysLogRecord>>("/cmict/logstore/sys-log/detail", {
      params,
    }),
};

export default sysLogApi;
