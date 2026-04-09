import { obHttp } from '@one-base-template/core';
import type {
  MessageBizResponse,
  MessageCategoryRecord,
  MessageHistoryPageData,
  MessageHistoryQuery,
  MessageHistoryRecord
} from './types';

export const messageHistoryApi = {
  page: async (params: MessageHistoryQuery) =>
    obHttp().get<MessageBizResponse<MessageHistoryPageData>>('/cmict/msg/msg/page', { params }),

  detail: async (id: string) =>
    obHttp().get<MessageBizResponse<MessageHistoryRecord>>(`/cmict/msg/msg/${id}`),

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
