import { obHttp } from '@one-base-template/core';
import type {
  MessageCategoryPageData,
  MessageCategoryPayload,
  MessageCategoryQuery,
  MessageCategoryRecord,
  MessageCategoryResponse
} from './types';

export const messageCategoryApi = {
  page: async (params: MessageCategoryQuery) =>
    obHttp().get<MessageCategoryResponse<MessageCategoryPageData>>('/cmict/msg/cate/page', {
      params
    }),

  detail: async (id: string) =>
    obHttp().get<MessageCategoryResponse<MessageCategoryRecord>>(`/cmict/msg/cate/${id}`),

  create: async (data: Omit<MessageCategoryPayload, 'id'>) =>
    obHttp().post<MessageCategoryResponse<boolean>>('/cmict/msg/cate', { data }),

  update: async (data: MessageCategoryPayload) =>
    obHttp().put<MessageCategoryResponse<boolean>>('/cmict/msg/cate', { data }),

  remove: async (id: string) =>
    obHttp().delete<MessageCategoryResponse<boolean>>(`/cmict/msg/cate/${id}`)
};
