import type { AxiosProgressEvent } from 'axios';
import type { BizResponse } from '../types';

export interface MaterialCategoryRecord {
  id?: string | number;
  labelName?: string;
  count?: number;
  fodderType?: number;
  [key: string]: unknown;
}

export interface MaterialRecord {
  id?: string | number;
  fileId?: string;
  fodderName?: string;
  fodderLabelId?: string;
  fodderLabelName?: string;
  fileSize?: string;
  fileLength?: string;
  fileType?: string;
  dpi?: string;
  createTime?: string;
  creator?: string;
  fodderType?: number;
  checked?: boolean;
  previewUrl?: string;
  [key: string]: unknown;
}

export interface MaterialPageParams {
  fodderType: number;
  currentPage: number;
  pageSize: number;
  fodderLabelId?: string;
  searchKey?: string;
}

export interface MaterialPageData {
  records?: MaterialRecord[];
  total?: number;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  [key: string]: unknown;
}

export interface MaterialCategoryListParams {
  fodderType: number;
  searchKey?: string;
}

export interface MaterialCategorySavePayload {
  id?: string;
  fodderType: number;
  labelName: string;
}

export interface MaterialCategoryDeletePayload {
  id: string;
}

export interface MaterialDeletePayload {
  id: string;
}

export interface MaterialLabelRef {
  fodderLabelId: string | number;
}

export interface MaterialSavePayload {
  id?: string;
  fodderName: string;
  fodderType: number;
  fodderLabelList: MaterialLabelRef[];
  fileId?: string;
  fileLength?: string;
  fileSize?: string;
  fileType?: string;
  dpi?: string;
  [key: string]: unknown;
}

export interface UploadResourceResult {
  id?: string;
  fileLength?: string;
  fileSize?: string;
  fileType?: string;
  savedPath?: string;
  joinUrl?: string;
  [key: string]: unknown;
}

export interface UploadRequestOptions {
  onProgress?: (event: AxiosProgressEvent) => void;
}

export interface MaterialUploadDraft {
  uid: string;
  name: string;
  fileId: string;
  fileLength?: string;
  fileSize?: string;
  fileType?: string;
  width?: number;
  height?: number;
  previewUrl: string;
  fodderLabelIds: string[];
  loading?: boolean;
}

export type MaterialBizResponse<T> = BizResponse<T>;
