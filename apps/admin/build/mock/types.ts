import type { IncomingMessage, ServerResponse } from "node:http";

export type JsonObject = Record<string, unknown>;

export interface OrgMockNode {
  id: string;
  parentId: string;
  orgName: string;
  briefName: string;
  sort: number;
  orgCategory: string;
  orgLevelName: string;
  institutionalType: string;
  uscc: string;
  createTime: string;
  orgType: number;
  isExternal: boolean;
}

export interface PermissionMockNode {
  id: string;
  parentId: string;
  resourceType: number;
  resourceName: string;
  permissionCode: string;
  icon: string;
  image: string;
  url: string;
  openMode: number;
  redirect: string;
  routeCache: number;
  sort: number;
  hidden: number;
  component: string;
  remark: string;
}

export interface AdminMockRouteContext {
  req: IncomingMessage;
  res: ServerResponse;
  url: string;
  cookieName: string;
  sczfwSystemPermissionCode: string;
  sessions: Map<string, { user: { id: string; name: string; companyId: string } }>;
  tokenSessions: Map<
    string,
    { user: { id: string; nickName: string; permissionCodes: string[]; roleCodes: string[]; companyId: string } }
  >;
  orgNodes: Map<string, OrgMockNode>;
  permissionNodes: Map<string, PermissionMockNode>;
  permissionTypeEnum: { key: string; value: string }[];
  createSession: (userName: string) => string;
  createTokenSession: (userName: string) => string;
  clearSession: (sid: string | undefined) => void;
  hasOrgChildren: (parentId: string) => boolean;
  toOrgRow: (item: OrgMockNode) => OrgMockNode & { hasChildren: boolean };
  listOrgChildren: (parentId: string) => Array<OrgMockNode & { hasChildren: boolean }>;
  isOrgInParentScope: (item: OrgMockNode, parentId: string) => boolean;
  toPermissionRow: (item: PermissionMockNode) => PermissionMockNode & { resourceTypeText: string };
  buildPermissionTree: (parentId?: string) => Array<Record<string, unknown>>;
  listPermissionByFilter: (params: { resourceName?: string; resourceType?: string }) => Array<Record<string, unknown>>;
  collectPermissionDescendantIds: (id: string, ids: Set<string>) => void;
  formatDateTime: (date: Date) => string;
}
