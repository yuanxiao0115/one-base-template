import type { ApiPageData } from "@/shared/api/types";

export type { ApiResponse } from "@/shared/api/types";

type LooseField = string | number | boolean | null | undefined | Array<unknown> | Record<string, unknown>;

export interface UserOrgPostRecord {
  id?: string;
  postId: string;
  postName?: string;
  sort?: number;
  status?: number;
  [key: string]: LooseField;
}

export interface UserOrgRecord {
  id?: string;
  orgId: string;
  orgName?: string;
  orgRankType?: number | null;
  ownSort?: number;
  sort?: number;
  status?: number;
  postVos?: UserOrgPostRecord[];
  [key: string]: LooseField;
}

export interface UserListRecord {
  id: string;
  nickName: string;
  userAccount: string;
  phone: string;
  phoneShow: boolean;
  mail?: string;
  gender?: number;
  isEnable?: boolean;
  userType?: number;
  isExternal?: boolean;
  createTime?: string;
  lastLoginTime?: string;
  [key: string]: LooseField;
}

export type UserDetailRecord = UserListRecord & {
  avatar?: string;
  remark?: string;
  roleIds?: string[];
  userOrgs?: UserOrgRecord[];
};

export interface UserRoleRecord {
  id: string;
  roleName?: string;
  [key: string]: LooseField;
}

export interface CorporateUserRecord {
  id: string;
  userId: string;
  userName: string;
  nickName?: string;
  phone: string;
  [key: string]: LooseField;
}

export interface UserDetailData {
  userInfo: UserDetailRecord;
  userRoleList?: UserRoleRecord[];
  corporateUserList?: CorporateUserRecord[];
  [key: string]: LooseField;
}

export interface UserPageParams {
  nickName?: string;
  phone?: string;
  userAccount?: string;
  isEnable?: boolean | null;
  mail?: string;
  orgId?: string;
  startDate?: string;
  endDate?: string;
  currentPage?: number;
  pageSize?: number;
}

export type UserPageData = ApiPageData<UserListRecord>;

export interface UserSavePayload {
  id?: string;
  nickName: string;
  userAccount: string;
  phone: string;
  phoneShow: boolean;
  mail: string;
  gender: number;
  isEnable: boolean;
  userType: number;
  isExternal: boolean;
  remark: string;
  roleIds: string[];
  userOrgs: UserOrgRecord[];
}

export interface UserUniquePayload {
  userId?: string;
  userAccount?: string;
  phone?: string;
  mail?: string;
}

export interface UserStatusPayload {
  isEnable: boolean;
  ids: string[];
}

export interface UserResetPasswordPayload {
  id: string;
}

export interface UserChangeAccountPayload {
  userId: string;
  newUsername: string;
  isReset: number;
  newPassword?: string;
}

export interface UserBindAccountPayload {
  corporateUserId: string;
  userIds: string[];
}

export interface UserSortPayload {
  orgId: string;
  id: string;
  index: number;
}

export interface OrgTreeNode {
  id: string;
  orgName: string;
  orgType: number;
  sort: number;
  children?: OrgTreeNode[];
  [key: string]: LooseField;
}

export interface PositionItem {
  id: string;
  postName: string;
  [key: string]: LooseField;
}

export interface RoleItem {
  id: string;
  roleName: string;
  [key: string]: LooseField;
}

export interface UserBriefRecord {
  id: string;
  nickName: string;
  phone: string;
  userAccount: string;
  [key: string]: LooseField;
}

export interface UploadImageResult {
  id?: string;
  [key: string]: LooseField;
}
