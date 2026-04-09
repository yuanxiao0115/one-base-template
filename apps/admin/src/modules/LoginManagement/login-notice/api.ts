import { obHttp } from '@one-base-template/core';
import type {
  LoginNoticePageData,
  LoginNoticePayload,
  LoginNoticeQuery,
  LoginNoticeRecord,
  LoginNoticeResponse
} from './types';

export const loginNoticeApi = {
  page: async (params: LoginNoticeQuery) =>
    obHttp().get<LoginNoticeResponse<LoginNoticePageData>>('/cmict/portal/up/page-list', {
      params
    }),

  save: async (data: LoginNoticePayload) =>
    obHttp().post<LoginNoticeResponse<boolean>>('/cmict/portal/up/save', { data }),

  publish: async (data: LoginNoticePayload) =>
    obHttp().post<LoginNoticeResponse<boolean>>('/cmict/portal/up/publish', { data }),

  remove: async (id: string) =>
    obHttp().post<LoginNoticeResponse<boolean>>('/cmict/portal/up/delete', {
      data: { id }
    }),

  delete: async (data: { id: string }) =>
    obHttp().post<LoginNoticeResponse<boolean>>('/cmict/portal/up/delete', { data }),

  detail: async (params: { id: string } | string) =>
    obHttp().get<LoginNoticeResponse<LoginNoticeRecord>>('/cmict/portal/up/detail', {
      params: typeof params === 'string' ? { id: params } : params
    })
};
