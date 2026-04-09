import type { ApiPageData, ApiResponse } from '@/types/api';

export interface MessageTemplateRecord {
  id: string;
  title: string;
  cateId?: string;
  cateName?: string;
  content?: string;
  creator?: string;
  createTime?: string;
  modifier?: string;
  updateTime?: string;
}

export interface MessageTemplateQuery {
  currentPage: number;
  pageSize: number;
  title?: string;
  cateId?: string;
}

export interface MessageTemplatePayload {
  id?: string;
  title: string;
  cateId?: string;
  content?: string;
}

export interface MessageCategoryRecord {
  id: string;
  name: string;
}

export interface MessageTemplateFormModel {
  id?: string;
  title: string;
  cateId: string;
  content: string;
}

export type MessageTemplatePageData = ApiPageData<MessageTemplateRecord> & {
  totalCount?: number;
  total?: number;
};

export type MessageTemplateResponse<T> = ApiResponse<T>;
