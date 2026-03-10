export type { ApiResponse } from "@/shared/api/types";

type LooseField = string | number | boolean | null | undefined | Array<unknown> | Record<string, unknown>;

export interface DictItem {
  itemName: string;
  itemValue: string;
  [key: string]: LooseField;
}

export interface OrgLevelItem {
  id: string;
  orgLevel: number;
  orgLevelName: string;
  remark?: string;
  [key: string]: LooseField;
}

export interface OrgManagerRecord {
  id: string;
  userId: string;
  nickName: string;
  phone: string;
}

export interface UserBriefRecord {
  id: string;
  nickName?: string;
  phone?: string;
  companyId?: string;
  parentId?: string;
  [key: string]: LooseField;
}

export interface OrgRecord {
  id: string;
  parentId?: string;
  orgName: string;
  briefName?: string;
  sort?: number;
  orgCategory?: string;
  orgLevelName?: string;
  orgLevel?: number | null;
  orgLevelId?: string;
  institutionalType?: string;
  uscc?: string;
  orgType?: number;
  isExternal?: boolean;
  remark?: string;
  hasChildren?: boolean;
  children?: OrgRecord[];
  [key: string]: LooseField;
}

export type OrgContactNodeType = "org" | "user";

export interface OrgContactNodeBase {
  id: string;
  parentId: string;
  companyId: string;
  title: string;
  nodeType: OrgContactNodeType;
  [key: string]: LooseField;
}

export type OrgContactOrgNode = OrgContactNodeBase & {
  nodeType: "org";
  orgName: string;
  orgType: number;
  children?: OrgContactNode[];
};

export type OrgContactUserNode = OrgContactNodeBase & {
  nodeType: "user";
  userId: string;
  nickName: string;
  phone: string;
  checked?: boolean;
};

export type OrgContactNode = OrgContactOrgNode | OrgContactUserNode;

export interface OrgTreeParams {
  parentId?: string;
}

export interface OrgSearchParams {
  parentId?: string;
  orgName?: string;
}

export interface OrgUniqueParams {
  orgName: string;
  parentId?: string;
  orgId?: string;
}

export interface OrgManagerParams {
  orgId: string;
}

export interface UserSearchParams {
  nickName?: string;
}

export interface ContactLazyParams {
  parentId?: string;
}

export interface ContactUserSearchParams {
  search?: string;
}

export interface OrgSavePayload {
  id?: string;
  parentId: string;
  orgName: string;
  briefName?: string;
  sort?: number;
  orgCategory?: string;
  orgLevelName?: string;
  orgLevel?: number | null;
  orgLevelId?: string;
  institutionalType?: string;
  uscc?: string;
  orgType?: number;
  isExternal?: boolean;
  remark?: string;
  [key: string]: LooseField;
}

export interface OrgManagerSavePayload {
  orgId: string;
  userId: string[];
}

export interface OrgLevelSavePayload {
  id?: string;
  orgLevel: number;
  orgLevelName: string;
  remark?: string;
}

export interface ClientOwnInfoData {
  userOrgs?: Array<{ companyId?: number | string; orgCode?: string }>;
  [key: string]: LooseField;
}
