type LooseField =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<unknown>
  | Record<string, unknown>;

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

export type OrgContactNodeType = 'org' | 'user';

export interface OrgContactNodeBase {
  id: string;
  parentId: string;
  companyId: string;
  title: string;
  nodeType: OrgContactNodeType;
  [key: string]: LooseField;
}

export type OrgContactOrgNode = OrgContactNodeBase & {
  nodeType: 'org';
  orgName: string;
  orgType: number;
  children?: OrgContactNode[];
};

export type OrgContactUserNode = OrgContactNodeBase & {
  nodeType: 'user';
  userId: string;
  nickName: string;
  phone: string;
  checked?: boolean;
};

export type OrgContactNode = OrgContactOrgNode | OrgContactUserNode;

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

export interface OrgLevelSavePayload {
  id?: string;
  orgLevel: number;
  orgLevelName: string;
  remark?: string;
}
