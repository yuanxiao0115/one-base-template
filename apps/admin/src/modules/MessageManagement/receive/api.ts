import { obHttp } from '@one-base-template/core';
import type {
  MessageBizResponse,
  MessageCategoryRecord,
  MessageReceivePageData,
  MessageReceiveQuery,
  MessageReceiveRecord,
  MessageReceiveUpdatePayload
} from './types';

export const messageReceiveApi = {
  page: async (params: MessageReceiveQuery) =>
    obHttp().get<MessageBizResponse<MessageReceivePageData>>('/cmict/msg/msgReceive/page', {
      params
    }),

  detail: async (id: string) =>
    obHttp().get<MessageBizResponse<MessageReceiveRecord>>(`/cmict/msg/msgReceive/${id}`),

  update: async (data: MessageReceiveUpdatePayload) =>
    obHttp().put<MessageBizResponse<boolean>>('/cmict/msg/msgReceive', { data }),

  batchDelete: async (ids: string[]) =>
    obHttp().delete<MessageBizResponse<boolean>>('/cmict/msg/msgReceive/batch', {
      data: { ids }
    }),

  categoryList: async () =>
    obHttp().get<MessageBizResponse<{ records?: MessageCategoryRecord[] }>>(
      '/cmict/msg/cate/page',
      {
        params: {
          currentPage: 1,
          pageSize: 99
        }
      }
    )
};
