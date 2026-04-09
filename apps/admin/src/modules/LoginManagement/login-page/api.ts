import { obHttp } from '@one-base-template/core';
import type {
  LoginPageListQuery,
  LoginPagePageData,
  LoginPagePayload,
  LoginPageRecord,
  LoginPageResponse,
  LoginPageStatusPayload
} from './types';

export const loginPageApi = {
  page: async (params: LoginPageListQuery) =>
    obHttp().get<LoginPageResponse<LoginPagePageData>>('/cmict/portal/login-page/page', {
      params: {
        ...params,
        searchKey: params.searchKey ?? params.modelName
      }
    }),

  add: async (data: LoginPagePayload) =>
    obHttp().post<LoginPageResponse<boolean>>('/cmict/portal/login-page/add', { data }),

  update: async (data: LoginPagePayload) =>
    obHttp().post<LoginPageResponse<boolean>>('/cmict/portal/login-page/update', { data }),

  delete: async (data: { id: string }) =>
    obHttp().post<LoginPageResponse<boolean>>('/cmict/portal/login-page/delete', {
      data
    }),

  remove: async (id: string) =>
    obHttp().post<LoginPageResponse<boolean>>('/cmict/portal/login-page/delete', {
      data: { id }
    }),

  updateStatus: async (data: LoginPageStatusPayload) =>
    obHttp().post<LoginPageResponse<boolean>>('/cmict/portal/login-page/updateStatus', { data }),

  detail: async (params: { id: string } | string) =>
    obHttp().get<LoginPageResponse<LoginPageRecord>>('/cmict/portal/login-page/detail', {
      params: typeof params === 'string' ? { id: params } : params
    })
};
