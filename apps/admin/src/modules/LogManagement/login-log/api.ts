import { getHttpClient } from "@/shared/api/http-client";
import type { ApiResponse, ClientTypeOption, LoginLogPageData, LoginLogPageParams, LoginLogRecord } from "./types";

export type { ApiResponse, ClientTypeOption, LoginLogPageData, LoginLogPageParams, LoginLogRecord } from "./types";

export const loginLogApi = {
  list: async (params: LoginLogPageParams) =>
    getHttpClient().get<ApiResponse<LoginLogPageData>>("/cmict/auth/login-record/page", {
      params,
    }),

  getEnum: async () =>
    getHttpClient().get<ApiResponse<ClientTypeOption[]>>("/cmict/auth/login-record/client-type/enum"),

  remove: async (data: { idList: string[] }) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/auth/login-record/delete", { data }),

  detail: async (params: { id: string }) =>
    getHttpClient().get<ApiResponse<LoginLogRecord>>("/cmict/auth/login-record/detail", {
      params,
    }),
};

export default loginLogApi;
