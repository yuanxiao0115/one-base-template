import { obHttp } from '@one-base-template/core';
import type {
  MessageCategoryRecord,
  MessageTemplatePageData,
  MessageTemplatePayload,
  MessageTemplateQuery,
  MessageTemplateRecord,
  MessageTemplateResponse
} from './types';

export const messageTemplateApi = {
  page: async (params: MessageTemplateQuery) =>
    obHttp().get<MessageTemplateResponse<MessageTemplatePageData>>('/cmict/msg/msgTemplate/page', {
      params
    }),

  detail: async (id: string) =>
    obHttp().get<MessageTemplateResponse<MessageTemplateRecord>>(`/cmict/msg/msgTemplate/${id}`),

  create: async (data: Omit<MessageTemplatePayload, 'id'>) =>
    obHttp().post<MessageTemplateResponse<boolean>>('/cmict/msg/msgTemplate', { data }),

  update: async (data: MessageTemplatePayload) =>
    obHttp().put<MessageTemplateResponse<boolean>>('/cmict/msg/msgTemplate', { data }),

  remove: async (id: string) =>
    obHttp().delete<MessageTemplateResponse<boolean>>(`/cmict/msg/msgTemplate/${id}`),

  categoryList: async () =>
    obHttp().get<MessageTemplateResponse<{ records?: MessageCategoryRecord[] }>>(
      '/cmict/msg/cate/page',
      {
        params: {
          currentPage: 1,
          pageSize: 99
        }
      }
    )
};
