import type { AxiosProgressEvent } from 'axios';
import type { ApiPageData } from '@/types/api';

export type { ApiResponse } from '@/types/api';

type LooseField =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<unknown>
  | Record<string, unknown>;

export interface ContentAttachment {
  id?: string;
  attachmentName?: string;
  attachmentUrl: string;
  [key: string]: LooseField;
}

export interface ContentCategoryRecord {
  id: string;
  categoryName: string;
  parentCategoryId?: string;
  children?: ContentCategoryRecord[];
  [key: string]: LooseField;
}

export interface ContentRecord {
  id: string;
  articleTitle?: string;
  articleType?: number;
  articleAuthorName?: string;
  articleContent?: string;
  publishTime?: string;
  coverUrl?: string;
  articleSource?: string;
  outerHref?: string;
  reviewStatus?: number;
  cmsCategoryIdList?: string[];
  cmsArticleAttachmentList?: ContentAttachment[];
  [key: string]: LooseField;
}

export interface ContentDetail extends ContentRecord {
  cmsCategoryList?: Array<{
    id: string;
    categoryName?: string;
  }>;
}

export interface ContentPageParams {
  articleTitle?: string;
  cmsCategoryId?: string;
  articleType?: number | '';
  currentPage?: number;
  pageSize?: number;
}

export type ContentPageData = ApiPageData<ContentRecord>;

export interface ContentSavePayload {
  id?: string;
  articleTitle: string;
  cmsCategoryIdList: string[];
  articleType?: number;
  articleAuthorName?: string;
  articleContent?: string;
  publishTime?: string;
  coverUrl?: string;
  articleSource?: string;
  outerHref?: string;
  cmsArticleAttachmentList?: ContentAttachment[];
  [key: string]: LooseField;
}

export interface UploadResourceResult {
  id?: string;
  savedPath?: string;
  joinUrl?: string;
  [key: string]: LooseField;
}

export interface UploadAttachmentResult extends ContentAttachment {
  savedPath?: string;
  [key: string]: LooseField;
}

export interface UploadRequestOptions {
  onProgress?: (event: AxiosProgressEvent) => void;
}
