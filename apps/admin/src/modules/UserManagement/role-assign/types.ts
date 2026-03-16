import type { ApiPageData } from '@/shared/api/types';

export type { ApiResponse } from '@/shared/api/types';

type LooseField =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<unknown>
  | Record<string, unknown>;

export interface RoleOption {
  id: string;
  roleName: string;
  userAmount?: number;
  [key: string]: LooseField;
}

export interface RoleMemberRecord {
  id: string;
  userAccount?: string;
  nickName?: string;
  [key: string]: LooseField;
}

export interface RoleMemberPageParams {
  roleId: string;
  keyWord?: string;
  currentPage?: number;
  pageSize?: number;
}

export type RoleMemberPageData = ApiPageData<RoleMemberRecord>;

export interface RoleMemberPayload {
  roleId: string;
  userIdList: string[];
}

export interface UserOption {
  id: string;
  nickName: string;
  userAccount: string;
  phone: string;
  [key: string]: LooseField;
}

export type RoleAssignContactNodeType = 'org' | 'user';

export interface RoleAssignContactNodeBase {
  id: string;
  parentId: string;
  companyId: string;
  title: string;
  nodeType: RoleAssignContactNodeType;
  [key: string]: LooseField;
}

export type RoleAssignContactOrgNode = RoleAssignContactNodeBase & {
  nodeType: 'org';
  orgName: string;
  orgType: number;
  children?: RoleAssignContactNode[];
};

export type RoleAssignContactUserNode = RoleAssignContactNodeBase & {
  nodeType: 'user';
  userId: string;
  nickName: string;
  userAccount: string;
  phone: string;
};

export type RoleAssignContactNode = RoleAssignContactOrgNode | RoleAssignContactUserNode;
