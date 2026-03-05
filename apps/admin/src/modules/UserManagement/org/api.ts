import { getHttpClient, trimText } from '@/shared/api/utils';
import { extractList, toBooleanValue, toNullableNumber, toNumberValue, toStringValue } from '@/shared/api/normalize';

export type BizResponse<T> = {
  code: number;
  data: T;
  message?: string;
}

export type DictItem = {
  itemName: string;
  itemValue: string;
}

export type OrgLevelItem = {
  id: string;
  orgLevel: number;
  orgLevelName: string;
  remark?: string;
}

export type OrgManagerRecord = {
  id: string;
  userId: string;
  nickName: string;
  phone: string;
}

export type UserBriefRecord = {
  id: string;
  nickName: string;
  phone: string;
  companyId?: string;
  parentId?: string;
}

export type OrgRecord = {
  id: string;
  parentId: string;
  orgName: string;
  briefName: string;
  sort: number;
  orgCategory: string;
  orgLevelName: string;
  orgLevel: number | null;
  orgLevelId: string;
  institutionalType: string;
  uscc: string;
  createTime: string;
  orgType: number;
  isExternal: boolean;
  remark: string;
  hasChildren?: boolean;
  children?: OrgRecord[];
}

export type OrgContactNodeType = 'org' | 'user';

export type OrgContactNodeBase = {
  id: string;
  parentId: string;
  companyId: string;
  title: string;
  nodeType: OrgContactNodeType;
}

export type OrgContactOrgNode = OrgContactNodeBase & {
  nodeType: 'org';
  orgName: string;
  orgType: number;
  children: OrgContactNode[];
}

export type OrgContactUserNode = OrgContactNodeBase & {
  nodeType: 'user';
  userId: string;
  nickName: string;
  phone: string;
  checked?: boolean;
}

export type OrgContactNode = OrgContactOrgNode | OrgContactUserNode;

type OrgRawRecord = {
  id?: number | string | null;
  parentId?: number | string | null;
  orgName?: string | null;
  briefName?: string | null;
  sort?: number | string | null;
  orgCategory?: number | string | null;
  orgLevelName?: string | null;
  orgLevel?: number | string | null;
  orgLevelId?: number | string | null;
  institutionalType?: number | string | null;
  uscc?: string | null;
  createTime?: string | null;
  orgType?: number | string | null;
  isExternal?: boolean | null;
  remark?: string | null;
  hasChildren?: boolean | null;
  isLeaf?: boolean | null;
  leaf?: boolean | null;
  noLazyChildren?: boolean | null;
  children?: OrgRawRecord[] | null;
}

type DictRawItem = {
  itemName?: string | null;
  itemValue?: number | string | null;
}

type OrgLevelRawItem = {
  id?: number | string | null;
  orgLevel?: number | string | null;
  orgLevelName?: string | null;
  remark?: string | null;
}

type OrgManagerRawRecord = {
  id?: number | string | null;
  userId?: number | string | null;
  nickName?: string | null;
  phone?: string | null;
}

type UserRawRecord = {
  id?: number | string | null;
  nickName?: string | null;
  phone?: string | null;
  companyId?: number | string | null;
  parentId?: number | string | null;
  userOrgs?: Array<{
    companyId?: number | string | null;
    orgId?: number | string | null;
    orgName?: string | null;
  }> | null;
}

type ContactOrgRawRecord = {
  id?: number | string | null;
  parentId?: number | string | null;
  companyId?: number | string | null;
  name?: string | null;
  orgName?: string | null;
  orgType?: number | string | null;
}

type ContactResponseRawData = {
  orgIndustryContactVOS?: ContactOrgRawRecord[] | null;
  orgDetailList?: ContactOrgRawRecord[] | null;
  userStructureQueryVOS?: UserRawRecord[] | null;
  userList?: UserRawRecord[] | null;
}

export type OrgTreeParams = {
  parentId?: string;
}

export type OrgSearchParams = {
  parentId?: string;
  orgName?: string;
}

export type OrgUniqueParams = {
  orgName: string;
  parentId?: string;
  orgId?: string;
}

export type OrgManagerParams = {
  orgId: string;
}

export type UserSearchParams = {
  nickName?: string;
}

export type ContactLazyParams = {
  parentId?: string;
}

export type ContactUserSearchParams = {
  search?: string;
}

export type OrgSavePayload = {
  id?: string;
  parentId: string;
  orgName: string;
  briefName: string;
  sort: number;
  orgCategory: string;
  orgLevelName: string;
  orgLevel: number | null;
  orgLevelId: string;
  institutionalType: string;
  uscc: string;
  orgType: number;
  isExternal: boolean;
  remark: string;
}

export type OrgManagerSavePayload = {
  orgId: string;
  userId: string[];
}

export type OrgLevelSavePayload = {
  id?: string;
  orgLevel: number;
  orgLevelName: string;
  remark?: string;
}

function getHasChildren (row: OrgRawRecord, children: OrgRecord[]): boolean {
  if (typeof row.hasChildren === 'boolean') {
    return row.hasChildren;
  }
  if (children.length > 0) {
    return true;
  }
  if (row.isLeaf === true || row.leaf === true || row.noLazyChildren === true) {
    return false;
  }
  if (row.isLeaf === false || row.leaf === false) {
    return true;
  }
  return true;
}

function toOrgRow (row: OrgRawRecord): OrgRecord {
  const children = Array.isArray(row.children)
    ? row.children.map((item) => toOrgRow(item))
    : undefined;

  return {
    id: toStringValue(row.id),
    parentId: toStringValue(row.parentId),
    orgName: toStringValue(row.orgName),
    briefName: toStringValue(row.briefName),
    sort: toNumberValue(row.sort),
    orgCategory: toStringValue(row.orgCategory),
    orgLevelName: toStringValue(row.orgLevelName),
    orgLevel: toNullableNumber(row.orgLevel),
    orgLevelId: toStringValue(row.orgLevelId),
    institutionalType: toStringValue(row.institutionalType),
    uscc: toStringValue(row.uscc),
    createTime: toStringValue(row.createTime),
    orgType: toNumberValue(row.orgType),
    isExternal: toBooleanValue(row.isExternal),
    remark: toStringValue(row.remark),
    hasChildren: getHasChildren(row, children || []),
    children
  };
}

export function toOrgRows (rows: unknown): OrgRecord[] {
  return extractList(rows).map((row) => toOrgRow((row || {}) as OrgRawRecord));
}

function toDictItems (rows: unknown): DictItem[] {
  return extractList(rows).map((row) => {
    const raw = (row || {}) as DictRawItem;
    return {
      itemName: toStringValue(raw.itemName),
      itemValue: toStringValue(raw.itemValue)
    };
  });
}

function toOrgLevelItems (rows: unknown): OrgLevelItem[] {
  return extractList(rows, ['records', 'list', 'rows', 'items', 'levelList']).map((row) => {
    const raw = (row || {}) as OrgLevelRawItem;
    return {
      id: toStringValue(raw.id),
      orgLevel: toNumberValue(raw.orgLevel),
      orgLevelName: toStringValue(raw.orgLevelName),
      remark: toStringValue(raw.remark)
    };
  });
}

function toOrgManagerItems (rows: unknown): OrgManagerRecord[] {
  return extractList(rows).map((row) => {
    const raw = (row || {}) as OrgManagerRawRecord;
    return {
      id: toStringValue(raw.id),
      userId: toStringValue(raw.userId),
      nickName: toStringValue(raw.nickName),
      phone: toStringValue(raw.phone)
    };
  });
}

function toUserBriefItems (rows: unknown): UserBriefRecord[] {
  return extractList(rows).map((row) => {
    const raw = (row || {}) as UserRawRecord;
    return {
      id: toStringValue(raw.id),
      nickName: toStringValue(raw.nickName),
      phone: toStringValue(raw.phone),
      companyId: toStringValue(raw.companyId),
      parentId: toStringValue(raw.parentId)
    };
  });
}

function toContactOrgNodes (rawData: ContactResponseRawData, parentId: string): OrgContactOrgNode[] {
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
    nodeType: 'org',
    children: []
  }));
}

function toContactUserNodes (rawData: ContactResponseRawData, parentId: string): OrgContactUserNode[] {
  const userRows = Array.isArray(rawData.userStructureQueryVOS)
    ? rawData.userStructureQueryVOS
    : Array.isArray(rawData.userList)
      ? rawData.userList
      : [];

  const users: OrgContactUserNode[] = [];
  userRows.forEach((item) => {
    const userId = toStringValue(item.id);
    if (!userId) {
      return;
    }

    const nickName = toStringValue(item.nickName);
    const phone = toStringValue(item.phone);
    const userOrgs = Array.isArray(item.userOrgs) ? item.userOrgs : [];

    if (userOrgs.length === 0) {
      users.push({
        id: userId,
        userId,
        nickName,
        phone,
        title: nickName,
        parentId: toStringValue(item.parentId) || parentId,
        companyId: toStringValue(item.companyId),
        nodeType: 'user'
      });
      return;
    }

    userOrgs.forEach((org) => {
      users.push({
        id: `${userId}-${toStringValue(org.orgId) || '0'}`,
        userId,
        nickName,
        phone,
        title: nickName,
        parentId: toStringValue(org.orgId) || parentId,
        companyId: toStringValue(org.companyId),
        nodeType: 'user'
      });
    });
  });

  return users;
}

function toContactNodes (data: unknown, parentId = '0'): OrgContactNode[] {
  const rawData = (data || {}) as ContactResponseRawData;
  const orgNodes = toContactOrgNodes(rawData, parentId);
  const userNodes = toContactUserNodes(rawData, parentId);
  return [...orgNodes, ...userNodes];
}

export const orgApi = {
  getOrgTree: async (params: OrgTreeParams) => getHttpClient()
    .get<BizResponse<OrgRecord[]>>('/cmict/admin/org/children', {
      params: {
        parentId: params.parentId || '0'
      }
    })
    .then((response) => ({
      ...response,
      data: toOrgRows(response.data)
    })),

  searchOrgList: async (params: OrgSearchParams) => getHttpClient()
    .get<BizResponse<OrgRecord[]>>('/cmict/admin/org/search', {
      params: {
        parentId: params.parentId || '0',
        orgName: trimText(params.orgName)
      }
    })
    .then((response) => ({
      ...response,
      data: toOrgRows(response.data)
    })),

  queryAllOrgTree: async () => getHttpClient()
    .get<BizResponse<OrgRecord[]>>('/cmict/admin/org/manage/list')
    .then((response) => ({
      ...response,
      data: toOrgRows(response.data)
    })),

  addOrg: async (data: OrgSavePayload) => getHttpClient().post<BizResponse<OrgRecord>>('/cmict/admin/org/add', { data }),

  updateOrg: async (data: OrgSavePayload) => getHttpClient().post<BizResponse<OrgRecord>>('/cmict/admin/org/update', { data }),

  deleteOrg: async (data: { id: string }) => getHttpClient().post<BizResponse<null>>('/cmict/admin/org/delete', { data }),

  checkUnique: async (params: OrgUniqueParams) => getHttpClient().get<BizResponse<boolean>>('/cmict/admin/org/unique/check', {
    params: {
      orgName: trimText(params.orgName),
      parentId: params.parentId || '0',
      orgId: params.orgId
    }
  }),

  dictDataList: async (params: { dictCode: string }) => getHttpClient()
    .get<BizResponse<DictItem[]>>('/cmict/admin/dict-item/list', {
      params
    })
    .then((response) => ({
      ...response,
      data: toDictItems(response.data)
    })),

  getOrgLevelList: async () => getHttpClient()
    .get<BizResponse<OrgLevelItem[]>>('/cmict/admin/org-level/list')
    .then((response) => ({
      ...response,
      data: toOrgLevelItems(response.data)
    })),

  addOrgLevel: async (data: OrgLevelSavePayload) => getHttpClient().post<BizResponse<boolean>>('/cmict/admin/org-level/add', { data }),

  updateOrgLevel: async (data: OrgLevelSavePayload) => getHttpClient().post<BizResponse<boolean>>('/cmict/admin/org-level/update', { data }),

  deleteOrgLevel: async (data: { id: string }) => getHttpClient().post<BizResponse<boolean>>('/cmict/admin/org-level/delete', { data }),

  queryOrgManagerList: async (params: OrgManagerParams) => getHttpClient()
    .get<BizResponse<OrgManagerRecord[]>>('/cmict/admin/org-admin/list', {
      params
    })
    .then((response) => ({
      ...response,
      data: toOrgManagerItems(response.data)
    })),

  searchAvailableUsers: async (params: UserSearchParams) => getHttpClient()
    .get<BizResponse<UserBriefRecord[]>>('/cmict/admin/user/list', {
      params: {
        nickName: trimText(params.nickName)
      }
    })
    .then((response) => ({
      ...response,
      data: toUserBriefItems(response.data)
    })),

  getOrgContactsLazy: async (params: ContactLazyParams) => getHttpClient()
    .get<BizResponse<unknown>>('/cmict/admin/org/contacts/lazy/tree', {
      params: {
        parentId: params.parentId || '0'
      }
    })
    .then((response) => ({
      ...response,
      data: toContactNodes(response.data, params.parentId || '0')
    })),

  searchContactUsers: async (params: ContactUserSearchParams) => getHttpClient()
    .get<BizResponse<unknown>>('/cmict/admin/user/structure/search/', {
      params: {
        search: trimText(params.search)
      }
    })
    .then((response) => ({
      ...response,
      data: toContactUserNodes((response.data || {}) as ContactResponseRawData, '0')
    })),

  getClientOwnInfo: async () => getHttpClient().get<BizResponse<{ userOrgs?: Array<{ companyId?: number | string; orgCode?: string }> }>>('/cmict/admin/user/client-own-info'),

  addOrgManager: async (data: OrgManagerSavePayload) => getHttpClient().post<BizResponse<boolean>>('/cmict/admin/org-admin/add', { data }),

  delOrgManager: async (data: { id: string }) => getHttpClient().post<BizResponse<boolean>>('/cmict/admin/org-admin/delete', { data })
};

export default orgApi;
