import { obHttp } from '@one-base-template/core';
import type { ApiResponse } from '@/types/api';
import type {
  MessageCategoryPageData,
  MessageCategoryRecord,
  MessageSendPayload,
  MessageSendResponse,
  MessageTemplatePageData,
  MessageTemplateRecord
} from './types';

export const messageSendApi = {
  send: async (data: MessageSendPayload) =>
    obHttp().post<MessageSendResponse>('/cmict/msg/msg', { data })
};

export const messageCategoryApi = {
  list: async (params: { currentPage: number; pageSize: number }) =>
    obHttp().get<ApiResponse<MessageCategoryPageData>>('/cmict/msg/cate/page', {
      params
    }),
  enabledList: async () =>
    obHttp().get<ApiResponse<MessageCategoryRecord[]>>('/cmict/msg/cate/enabled')
};

export const messageTemplateApi = {
  list: async (params: { currentPage: number; pageSize: number; title?: string }) =>
    obHttp().get<ApiResponse<MessageTemplatePageData>>('/cmict/msg/msgTemplate/page', {
      params
    }),
  detail: async (id: string) =>
    obHttp().get<ApiResponse<MessageTemplateRecord>>(`/cmict/msg/msgTemplate/${id}`)
};
