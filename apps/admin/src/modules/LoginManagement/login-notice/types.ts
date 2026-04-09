import type { ApiPageData, ApiResponse } from '@/types/api';

export interface LoginNoticeUserPopup {
  userId: string;
  nickName: string;
}

export type LoginNoticeUserPopUp = LoginNoticeUserPopup;

export interface LoginNoticeRecord {
  id: string;
  title: string;
  content?: string;
  isPublish?: 0 | 1;
  creator?: string;
  createTime?: string;
  showTitle?: 0 | 1;
  showBtn?: 0 | 1;
  showContent?: 0 | 1;
  notificationType?: 0 | 1 | 2;
  notificationScope?: 0 | 1;
  userPopUps?: LoginNoticeUserPopup[];
  linkUrl?: string;
  backgroundId?: string;
  popSize?: string;
  frequency?: string;
  beginDate?: string;
  endDate?: string;
}

export interface LoginNoticeQuery {
  currentPage: number;
  pageSize: number;
  title?: string;
}

export type LoginNoticeListQuery = LoginNoticeQuery;

export interface LoginNoticeFormModel {
  id?: string;
  title: string;
  content: string;
  frequency: string;
  time: string[];
  notificationScope: 0 | 1;
  userPopUps: LoginNoticeUserPopup[];
  notificationType: 0 | 1 | 2;
  popSize: string;
  showTitle: 0 | 1;
  showContent: 0 | 1;
  showBtn: 0 | 1;
  linkUrl: string;
  backgroundId: string;
}

export type LoginNoticeFormState = LoginNoticeFormModel;

export interface LoginNoticePayload {
  id?: string;
  title: string;
  content: string;
  frequency: string;
  beginDate: string;
  endDate: string;
  notificationScope: 0 | 1;
  userPopUps: LoginNoticeUserPopup[];
  notificationType: 0 | 1 | 2;
  popSize: string;
  showTitle: 0 | 1;
  showContent: 0 | 1;
  showBtn: 0 | 1;
  linkUrl?: string;
  backgroundId?: string;
}

export type LoginNoticeSavePayload = LoginNoticePayload;

export type LoginNoticePageData = ApiPageData<LoginNoticeRecord> & {
  totalCount?: number;
  total?: number;
};

export type LoginNoticeResponse<T> = ApiResponse<T>;
