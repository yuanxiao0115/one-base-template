import type { ApiPageData } from '@/types/api';

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
  phone?: string;
  [key: string]: LooseField;
}

export type RoleMemberPageData = ApiPageData<RoleMemberRecord>;
