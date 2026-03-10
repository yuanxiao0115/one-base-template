import type { ApiPageData } from "@/shared/api/types";

export type { ApiResponse } from "@/shared/api/types";

type LooseField = string | number | boolean | null | undefined | Array<unknown> | Record<string, unknown>;

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

export interface PositionUniqueParams {
  id?: string;
  postName: string;
}
