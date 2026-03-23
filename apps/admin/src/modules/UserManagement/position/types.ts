import type { ApiPageData } from '@/types/api';

type LooseField =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<unknown>
  | Record<string, unknown>;

export interface PositionRecord {
  id: string;
  postName: string;
  sort?: number;
  remark?: string;
  [key: string]: LooseField;
}

export interface PositionPageParams {
  postName?: string;
  currentPage?: number;
  pageSize?: number;
}

export type PositionPageData = ApiPageData<PositionRecord>;

export interface PositionSavePayload {
  id?: string;
  postName: string;
  sort?: number;
  remark?: string;
  [key: string]: LooseField;
}
