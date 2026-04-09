import type { ApiPageData, ApiResponse } from '@/types/api';

export const SEND_TYPE = {
  scheduled: 0,
  immediate: 1,
  periodic: 2
} as const;

export type MessageSendType = (typeof SEND_TYPE)[keyof typeof SEND_TYPE];

export interface MessageCategoryRecord {
  id: string;
  name: string;
}

export interface MessageTemplateRecord {
  id: string;
  title: string;
  cateId?: string;
  content?: string;
  createTime?: string;
  updateTime?: string;
}

export interface MessageReceiverItem {
  id: string;
  name: string;
}

export interface MessageReceiverConfig {
  containsChildren: boolean;
  userList: MessageReceiverItem[];
  orgList: MessageReceiverItem[];
  roleList: MessageReceiverItem[];
}

export interface MessageSendPayload {
  title: string;
  cateId: string;
  sender: string;
  content: string;
  sendType: MessageSendType;
  receiverConfig: MessageReceiverConfig;
  sendTime?: string;
  cron?: string;
}

export type MessageCategoryPageData = ApiPageData<MessageCategoryRecord>;
export type MessageTemplatePageData = ApiPageData<MessageTemplateRecord>;
export type MessageSendResponse = ApiResponse<boolean>;
