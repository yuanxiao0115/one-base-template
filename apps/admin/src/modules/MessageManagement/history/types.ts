import type { ApiPageData } from '@/types/api';

export interface MessageHistoryRecord {
  id: string;
  title: string;
  content?: string;
  cateId?: string;
  cateName?: string;
  sendType?: number;
  sender?: string;
  createTime?: string;
  status?: number;
}

export interface MessageHistoryQuery {
  currentPage: number;
  pageSize: number;
  title?: string;
  cateId?: string;
  sendType?: number;
  status?: number;
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

export type MessageHistoryPageData = ApiPageData<MessageHistoryRecord> & {
  totalCount?: number;
  total?: number;
  current?: number;
  size?: number;
};
