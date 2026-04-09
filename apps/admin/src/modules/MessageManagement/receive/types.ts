import type { ApiPageData } from '@/types/api';

export interface MessageReceiveRecord {
  id: string;
  title: string;
  content?: string;
  cateId?: string;
  cateName?: string;
  sender?: string;
  senderName?: string;
  createTime?: string;
  readTime?: string;
  star?: 0 | 1;
  important?: 0 | 1;
}

export interface MessageReceiveQuery {
  currentPage: number;
  pageSize: number;
  title?: string;
  cateId?: string;
  read?: boolean;
  ascFlag?: 0 | 1;
}

export interface MessageReceiveUpdatePayload {
  id?: string;
  ids?: string[];
  read?: boolean;
  star?: 0 | 1;
  important?: 0 | 1;
  isDeleted?: boolean;
}

export interface MessageCategoryRecord {
  id: string;
  name: string;
}

export interface MessageBizResponse<T> {
  code: number;
  message?: string;
  success?: boolean;
  data: T;
}

export type MessageReceivePageData = ApiPageData<MessageReceiveRecord> & {
  totalCount?: number;
  total?: number;
  current?: number;
  size?: number;
};
