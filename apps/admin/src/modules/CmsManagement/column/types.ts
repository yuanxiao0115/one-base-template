export type { ApiResponse } from '@/types/api';

type LooseField =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<unknown>
  | Record<string, unknown>;

export interface ColumnRecord {
  id: string;
  categoryName: string;
  parentCategoryId?: string;
  isShow?: number;
  sort?: number;
  children?: ColumnRecord[];
  [key: string]: LooseField;
}

export interface ColumnTreeParams {
  categoryName?: string;
  isShow?: number | string;
}

export interface ColumnSavePayload {
  id?: string;
  categoryName: string;
  parentCategoryId?: string | null;
  isShow?: number;
  sort?: number;
  [key: string]: LooseField;
}
