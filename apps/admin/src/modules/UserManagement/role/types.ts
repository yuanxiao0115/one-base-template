import type { ApiPageData } from '@/shared/api/types';

type LooseField =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<unknown>
  | Record<string, unknown>;

export interface RoleRecord {
  id: string;
  roleName: string;
  roleCode?: string;
  remark?: string;
  [key: string]: LooseField;
}

export interface RolePageParams {
  roleName?: string;
  currentPage?: number;
  pageSize?: number;
}

export type RolePageData = ApiPageData<RoleRecord>;

export interface RoleSavePayload {
  id?: string;
  roleName: string;
  roleCode: string;
  remark: string;
}

export interface PermissionTreeNode {
  id: string;
  resourceName?: string;
  children?: PermissionTreeNode[];
  [key: string]: LooseField;
}
