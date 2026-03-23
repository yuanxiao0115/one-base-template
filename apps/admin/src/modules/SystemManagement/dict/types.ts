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

export interface DictRecord {
  id: string;
  dictCode: string;
  dictName: string;
  remark?: string;
  [key: string]: LooseField;
}

export interface DictPageParams {
  dictCode?: string;
  dictName?: string;
  currentPage?: number;
  pageSize?: number;
}

export type DictPageData = ApiPageData<DictRecord>;

export interface DictSavePayload {
  id?: string;
  dictCode: string;
  dictName: string;
  remark?: string;
  [key: string]: LooseField;
}

export interface DictItemRecord {
  id: string;
  dictId: string;
  itemName: string;
  itemValue: string;
  disabled?: number;
  sort?: number;
  remark?: string;
  [key: string]: LooseField;
}

export interface DictItemPageParams {
  dictId: string;
  itemName?: string;
  itemValue?: string;
  currentPage?: number;
  pageSize?: number;
}

export type DictItemPageData = ApiPageData<DictItemRecord>;

export interface DictItemSavePayload {
  id?: string;
  dictId: string;
  itemName: string;
  itemValue: string;
  sort?: number;
  remark?: string;
  [key: string]: LooseField;
}
