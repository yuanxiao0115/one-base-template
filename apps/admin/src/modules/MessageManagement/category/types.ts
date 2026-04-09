import type { ApiPageData, ApiResponse } from '@/types/api';

export interface MessageCategoryRecord {
  id: string;
  name: string;
  creator?: string;
  createTime?: string;
  modifier?: string;
  updateTime?: string;
}

export interface MessageCategoryQuery {
  currentPage: number;
  pageSize: number;
  name?: string;
}

export interface MessageCategoryPayload {
  id?: string;
  name: string;
}

export interface MessageCategoryFormModel {
  id?: string;
  name: string;
}

export type MessageCategoryPageData = ApiPageData<MessageCategoryRecord> & {
  totalCount?: number;
  total?: number;
};

export type MessageCategoryResponse<T> = ApiResponse<T>;
