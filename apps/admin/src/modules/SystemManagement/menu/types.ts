export type { ApiResponse } from "@/shared/api/types";

type LooseField = string | number | boolean | null | undefined | Array<unknown> | Record<string, unknown>;

export interface PermissionTypeOption {
  key: string;
  value: string;
}

export interface MenuPermissionRecord {
  id: string;
  resourceType: number;
  resourceName: string;
  parentId?: string;
  resourceTypeText?: string;
  permissionCode?: string;
  icon?: string;
  image?: string;
  url?: string;
  openMode?: number;
  redirect?: string;
  routeCache?: number;
  sort?: number;
  hidden?: number;
  component?: string;
  remark?: string;
  children?: MenuPermissionRecord[];
  [key: string]: LooseField;
}

export interface PermissionSearchParams {
  resourceName?: string;
  resourceType?: number | string;
}

export interface PermissionSavePayload {
  id?: string;
  parentId?: string;
  resourceType: number;
  resourceName: string;
  permissionCode?: string;
  icon?: string;
  image?: string;
  url?: string;
  openMode?: number;
  redirect?: string;
  routeCache?: number;
  sort?: number;
  hidden?: number;
  component?: string;
  remark?: string;
  [key: string]: LooseField;
}
