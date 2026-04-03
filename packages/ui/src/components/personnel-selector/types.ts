export type PersonnelSelectMode = 'org' | 'person' | 'position' | 'role';
export type PersonnelSelectionField = 'userIds' | 'orgIds' | 'roleIds' | 'positionIds';

/**
 * 选择器节点类型，预留 org/role/position 扩展能力。
 * 当前主场景已落地 org + user。
 */
export type PersonnelNodeType = 'org' | 'position' | 'role' | 'user';

export interface PersonnelBreadcrumbNode {
  id: string;
  title: string;
}

export interface PersonnelNodeBase {
  id: string;
  parentId: string;
  title: string;
  nodeType: PersonnelNodeType;
}

export type PersonnelOrgNode = PersonnelNodeBase & {
  nodeType: 'org';
  companyId: string;
  orgName: string;
  orgType: number;
};

export type PersonnelUserNode = PersonnelNodeBase & {
  nodeType: 'user';
  companyId: string;
  userId: string;
  nickName: string;
  userAccount: string;
  phone: string;
};

export type PersonnelRoleNode = PersonnelNodeBase & {
  nodeType: 'role';
  roleId: string;
  roleName: string;
};

export type PersonnelPositionNode = PersonnelNodeBase & {
  nodeType: 'position';
  positionId: string;
  positionName: string;
};

export type PersonnelNode =
  | PersonnelOrgNode
  | PersonnelPositionNode
  | PersonnelRoleNode
  | PersonnelUserNode;

export interface PersonnelSelectedItem {
  id: string;
  nodeType: PersonnelNodeType;
  title: string;
  subTitle?: string;
}

export type PersonnelSelectedOrg = PersonnelSelectedItem & {
  nodeType: 'org';
};

export type PersonnelSelectedRole = PersonnelSelectedItem & {
  nodeType: 'role';
};

export type PersonnelSelectedPosition = PersonnelSelectedItem & {
  nodeType: 'position';
};

export type PersonnelSelectedUser = PersonnelSelectedItem & {
  nodeType: 'user';
  nickName: string;
  userAccount: string;
  phone: string;
};

export interface PersonnelSelectionModel {
  userIds?: string[];
  orgIds?: string[];
  roleIds?: string[];
  positionIds?: string[];
}

export interface OpenPersonnelSelectionResult {
  mode: PersonnelSelectMode;
  selectionField: PersonnelSelectionField;
  ids: string[];
  model: Required<PersonnelSelectionModel>;
  selectedItems: PersonnelSelectedItem[];
  users: PersonnelSelectedUser[];
  orgs: PersonnelSelectedOrg[];
  roles: PersonnelSelectedRole[];
  positions: PersonnelSelectedPosition[];
}

export type PersonnelFetchNodes = (params: {
  parentId?: string;
  mode: PersonnelSelectMode;
}) => Promise<PersonnelNode[]>;

export type PersonnelSearchNodes = (params: {
  keyword: string;
  mode: PersonnelSelectMode;
}) => Promise<PersonnelNode[]>;
