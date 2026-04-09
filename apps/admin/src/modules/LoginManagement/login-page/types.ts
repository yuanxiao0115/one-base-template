import type { ApiPageData, ApiResponse } from '@/types/api';

export interface LoginPageFodderRecord {
  id?: string;
  fodderId?: string;
  fodderName?: string;
  url?: string;
  fileId?: string;
}

export interface LoginPageRecord {
  id: string;
  modelName: string;
  creator?: string;
  createTime?: string;
  updateTime?: string;
  isAvailable?: 0 | 1;
  webLogoText?: string;
  webLoginLogo?: LoginPageFodderRecord | string;
  loginPageFodders?: LoginPageFodderRecord[];
  boxLocation?: string;
  boxOpacity?: number;
}

export interface LoginPageQuery {
  currentPage: number;
  pageSize: number;
  searchKey?: string;
  modelName?: string;
}

export interface LoginPageStatusPayload {
  id: string;
  isAvailable: 0 | 1;
}

export interface LoginPageFormModel {
  id?: string;
  modelName: string;
  webLogoText: string;
  webLoginLogoId: string;
  loginPageFodderIds: string[];
  boxLocation: 'right' | 'center';
  boxOpacity: number;
}

export interface LoginPageFormState extends LoginPageFormModel {
  backgroundIds: string[];
}

export interface LoginPagePayload {
  id?: string;
  modelName: string;
  webLogoText?: string;
  webLoginLogo?: string;
  loginPageFodders: Array<{ fodderId: string }>;
  boxLocation?: string;
  boxOpacity?: number;
}

export type LoginPagePageData = ApiPageData<LoginPageRecord> & {
  totalCount?: number;
  total?: number;
};

export type LoginPageResponse<T> = ApiResponse<T>;

export type LoginPageListQuery = LoginPageQuery;
export type LoginPageSavePayload = LoginPagePayload;
