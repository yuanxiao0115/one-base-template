import { obHttp } from '@one-base-template/core';
import type {
  ApiResponse,
  ClientTypeOption,
  LoginLogPageData,
  LoginLogPageParams,
  LoginLogRecord
} from './types';

export const loginLogApi = {
  list: async (params: LoginLogPageParams) =>
    obHttp().get<ApiResponse<LoginLogPageData>>('/cmict/auth/login-record/page', {
      params
    }),

  getEnum: async () =>
    obHttp().get<ApiResponse<ClientTypeOption[]>>('/cmict/auth/login-record/client-type/enum'),

  remove: async (data: { idList: string[] }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/auth/login-record/delete', { data }),

  detail: async (params: { id: string }) =>
    obHttp().get<ApiResponse<LoginLogRecord>>('/cmict/auth/login-record/detail', {
      params
    })
};

export default loginLogApi;
