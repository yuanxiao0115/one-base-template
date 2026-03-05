import { getHttpClient, trimText } from "@/shared/api/utils";
import { extractList, toNumberValue, toRecord, toStringValue } from "@/shared/api/normalize";

export interface BizResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export interface RoleOption {
  id: string;
  roleName: string;
  userAmount: number;
}

export interface RoleMemberRecord {
  id: string;
  userAccount: string;
  nickName: string;
}

export interface RoleMemberPageParams {
  roleId: string;
  keyWord?: string;
  currentPage?: number;
  pageSize?: number;
}

export interface RoleMemberPageData {
  records: RoleMemberRecord[];
  total: number;
  currentPage: number;
  pageSize: number;
}

export interface RoleMemberPayload {
  roleId: string;
  userIdList: string[];
}

export interface UserOption {
  id: string;
  nickName: string;
  userAccount: string;
  phone: string;
}

export type RoleAssignContactNodeType = "org" | "user";

export interface RoleAssignContactNodeBase {
  id: string;
  parentId: string;
  companyId: string;
  title: string;
  nodeType: RoleAssignContactNodeType;
}

export type RoleAssignContactOrgNode = RoleAssignContactNodeBase & {
  nodeType: "org";
  orgName: string;
  orgType: number;
  children: RoleAssignContactNode[];
};

export type RoleAssignContactUserNode = RoleAssignContactNodeBase & {
  nodeType: "user";
  userId: string;
  nickName: string;
  userAccount: string;
  phone: string;
};

export type RoleAssignContactNode = RoleAssignContactOrgNode | RoleAssignContactUserNode;

interface RoleRawRecord {
  id?: number | string | null;
  roleName?: string | null;
  userAmount?: number | string | null;
}

interface RoleMemberRawRecord {
  id?: number | string | null;
  userAccount?: string | null;
  nickName?: string | null;
}

interface UserRawRecord {
  id?: number | string | null;
  nickName?: string | null;
  userAccount?: string | null;
  phone?: string | null;
  companyId?: number | string | null;
  parentId?: number | string | null;
  userOrgs?: Array<{
    companyId?: number | string | null;
    orgId?: number | string | null;
  }> | null;
}

interface ContactOrgRawRecord {
  id?: number | string | null;
  parentId?: number | string | null;
  companyId?: number | string | null;
  name?: string | null;
  orgName?: string | null;
  orgType?: number | string | null;
}

interface ContactResponseRawData {
  orgIndustryContactVOS?: ContactOrgRawRecord[] | null;
  orgDetailList?: ContactOrgRawRecord[] | null;
  userStructureQueryVOS?: UserRawRecord[] | null;
  userList?: UserRawRecord[] | null;
}

interface RoleMemberPageRawData {
  records?: unknown[];
  list?: unknown[];
  rows?: unknown[];
  items?: unknown[];
  total?: number | string | null;
  totalCount?: number | string | null;
  count?: number | string | null;
  currentPage?: number | string | null;
  current?: number | string | null;
  page?: number | string | null;
  pageSize?: number | string | null;
  size?: number | string | null;
}

function toRoleOption(item: RoleRawRecord): RoleOption {
  return {
    id: toStringValue(item.id),
    roleName: toStringValue(item.roleName),
    userAmount: toNumberValue(item.userAmount, 0),
  };
}

function toRoleMember(item: RoleMemberRawRecord): RoleMemberRecord {
  return {
    id: toStringValue(item.id),
    userAccount: toStringValue(item.userAccount),
    nickName: toStringValue(item.nickName),
  };
}

function toUserOption(item: UserRawRecord): UserOption {
  return {
    id: toStringValue(item.id),
    nickName: toStringValue(item.nickName),
    userAccount: toStringValue(item.userAccount),
    phone: toStringValue(item.phone),
  };
}

function toRoleMemberPageData(data: unknown): RoleMemberPageData {
  const payload = toRecord(data) as RoleMemberPageRawData;
  const records = extractList(payload).map((item) => toRoleMember((item ?? {}) as RoleMemberRawRecord));

  return {
    records,
    total: toNumberValue(payload.totalCount ?? payload.total ?? payload.count, records.length),
    currentPage: toNumberValue(payload.currentPage ?? payload.current ?? payload.page, 1),
    pageSize: toNumberValue(payload.pageSize ?? payload.size, 10),
  };
}

function toContactOrgNodes(rawData: ContactResponseRawData, parentId: string): RoleAssignContactOrgNode[] {
  const orgRows = Array.isArray(rawData.orgIndustryContactVOS)
    ? rawData.orgIndustryContactVOS
    : Array.isArray(rawData.orgDetailList)
      ? rawData.orgDetailList
      : [];

  return orgRows.map((item) => ({
    id: toStringValue(item.id),
    parentId: toStringValue(item.parentId) || parentId,
    companyId: toStringValue(item.companyId),
    title: toStringValue(item.name) || toStringValue(item.orgName),
    orgName: toStringValue(item.name) || toStringValue(item.orgName),
    orgType: toNumberValue(item.orgType),
    nodeType: "org",
    children: [],
  }));
}

function toContactUserNodes(rawData: ContactResponseRawData, parentId: string): RoleAssignContactUserNode[] {
  const userRows = Array.isArray(rawData.userStructureQueryVOS)
    ? rawData.userStructureQueryVOS
    : Array.isArray(rawData.userList)
      ? rawData.userList
      : [];

  const users: RoleAssignContactUserNode[] = [];
  userRows.forEach((item) => {
    const userId = toStringValue(item.id);
    if (!userId) {
      return;
    }

    const nickName = toStringValue(item.nickName);
    const phone = toStringValue(item.phone);
    const userAccount = toStringValue(item.userAccount);
    const userOrgs = Array.isArray(item.userOrgs) ? item.userOrgs : [];

    if (userOrgs.length === 0) {
      users.push({
        id: userId,
        userId,
        nickName,
        userAccount,
        phone,
        title: nickName || userAccount || phone,
        parentId: toStringValue(item.parentId) || parentId,
        companyId: toStringValue(item.companyId),
        nodeType: "user",
      });
      return;
    }

    userOrgs.forEach((org) => {
      users.push({
        id: `${userId}-${toStringValue(org.orgId) || "0"}`,
        userId,
        nickName,
        userAccount,
        phone,
        title: nickName || userAccount || phone,
        parentId: toStringValue(org.orgId) || parentId,
        companyId: toStringValue(org.companyId),
        nodeType: "user",
      });
    });
  });

  return users;
}

function toContactNodes(data: unknown, parentId = "0"): RoleAssignContactNode[] {
  const rawData = (data ?? {}) as ContactResponseRawData;
  const orgNodes = toContactOrgNodes(rawData, parentId);
  const userNodes = toContactUserNodes(rawData, parentId);
  return [...orgNodes, ...userNodes];
}

export const roleAssignApi = {
  listRoles: async (params: { roleName?: string }) =>
    getHttpClient()
      .get<BizResponse<RoleOption[]>>("/cmict/admin/role/list", {
        params: {
          roleName: trimText(params.roleName),
        },
      })
      .then((response) => ({
        ...response,
        data: extractList(response.data).map((item) => toRoleOption((item ?? {}) as RoleRawRecord)),
      })),

  pageMembers: async (params: RoleMemberPageParams) =>
    getHttpClient()
      .get<BizResponse<RoleMemberPageData>>("/cmict/admin/role/member/page", {
        params: {
          roleId: params.roleId,
          keyWord: trimText(params.keyWord),
          currentPage: params.currentPage,
          pageSize: params.pageSize,
        },
      })
      .then((response) => ({
        ...response,
        data: toRoleMemberPageData(response.data),
      })),

  listMembers: async (params: { roleId: string }) =>
    getHttpClient()
      .get<BizResponse<RoleMemberRecord[]>>("/cmict/admin/role/member/list", {
        params,
      })
      .then((response) => ({
        ...response,
        data: extractList(response.data).map((item) => toRoleMember((item ?? {}) as RoleMemberRawRecord)),
      })),

  addMembers: async (data: RoleMemberPayload) =>
    getHttpClient().post<BizResponse<boolean>>("/cmict/admin/role/member/add", {
      data,
    }),

  removeMembers: async (data: RoleMemberPayload) =>
    getHttpClient().post<BizResponse<boolean>>("/cmict/admin/role/member/remove", { data }),

  getOrgContactsLazy: async (params: { parentId?: string }) =>
    getHttpClient()
      .get<BizResponse<unknown>>("/cmict/admin/org/contacts/lazy/tree", {
        params: {
          parentId: params.parentId || "0",
        },
      })
      .then((response) => ({
        ...response,
        data: toContactNodes(response.data, params.parentId || "0"),
      })),

  searchContactUsers: async (params: { search?: string }) =>
    getHttpClient()
      .get<BizResponse<unknown>>("/cmict/admin/user/structure/search/", {
        params: {
          search: trimText(params.search),
        },
      })
      .then((response) => ({
        ...response,
        data: toContactUserNodes((response.data ?? {}) as ContactResponseRawData, "0"),
      })),

  searchUsers: async (params: { keyword?: string }) =>
    getHttpClient()
      .get<BizResponse<UserOption[]>>("/cmict/admin/user/list", {
        params: {
          nickName: trimText(params.keyword),
        },
      })
      .then((response) => ({
        ...response,
        data: extractList(response.data).map((item) => toUserOption((item ?? {}) as UserRawRecord)),
      })),
};

export default roleAssignApi;
