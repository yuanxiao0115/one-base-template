import { getObHttpClient } from "@one-base-template/core";
import type { ApiResponse, ClientTypeOption, LoginLogPageData, LoginLogPageParams, LoginLogRecord } from "./types";

export type { ApiResponse, ClientTypeOption, LoginLogPageData, LoginLogPageParams, LoginLogRecord } from "./types";

export const loginLogApi = {
  list: async (params: LoginLogPageParams) =>
    getObHttpClient().get<ApiResponse<LoginLogPageData>>("/cmict/auth/login-record/page", {
      params,
    }),

  getEnum: async () =>
    getObHttpClient().get<ApiResponse<ClientTypeOption[]>>("/cmict/auth/login-record/client-type/enum"),

  remove: async (data: { idList: string[] }) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/auth/login-record/delete", { data }),

  detail: async (params: { id: string }) =>
    getObHttpClient().get<ApiResponse<LoginLogRecord>>("/cmict/auth/login-record/detail", {
      params,
    }),
};

export default loginLogApi;
