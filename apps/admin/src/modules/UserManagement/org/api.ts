import { getHttpClient, trimText } from '@/shared/api/utils';

export interface BizResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export interface DictItem {
  itemName: string;
  itemValue: string;
}

export interface OrgLevelItem {
  id: string;
  orgLevel: number;
  orgLevelName: string;
  remark?: string;
}

export interface OrgManagerRecord {
  id: string;
  userId: string;
  nickName: string;
  phone: string;
}

export interface UserBriefRecord {
  id: string;
  nickName: string;
  phone: string;
  companyId?: string;
  parentId?: string;
}

export interface OrgRecord {
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

export interface OrgContactNodeBase {
  id: string;
  parentId: string;
  companyId: string;
  title: string;
  nodeType: OrgContactNodeType;
}

export interface OrgContactOrgNode extends OrgContactNodeBase {
  nodeType: 'org';
  orgName: string;
  orgType: number;
  children: OrgContactNode[];
}

export interface OrgContactUserNode extends OrgContactNodeBase {
  nodeType: 'user';
  userId: string;
  nickName: string;
  phone: string;
  checked?: boolean;
}

export type OrgContactNode = OrgContactOrgNode | OrgContactUserNode;

interface OrgRawRecord {
  id?: string | number | null;
  parentId?: string | number | null;
  orgName?: string | null;
  briefName?: string | null;
  sort?: number | string | null;
  orgCategory?: number | string | null;
  orgLevelName?: string | null;
  orgLevel?: number | string | null;
  orgLevelId?: string | number | null;
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

interface DictRawItem {
  itemName?: string | null;
  itemValue?: string | number | null;
}

interface OrgLevelRawItem {
  id?: string | number | null;
  orgLevel?: number | string | null;
  orgLevelName?: string | null;
  remark?: string | null;
}

interface OrgManagerRawRecord {
  id?: string | number | null;
  userId?: string | number | null;
  nickName?: string | null;
  phone?: string | null;
}

interface UserRawRecord {
  id?: string | number | null;
  nickName?: string | null;
  phone?: string | null;
  companyId?: string | number | null;
  parentId?: string | number | null;
  userOrgs?: Array<{
    companyId?: string | number | null;
    orgId?: string | number | null;
    orgName?: string | null;
  }> | null;
}

interface ContactOrgRawRecord {
  id?: string | number | null;
  parentId?: string | number | null;
  companyId?: string | number | null;
  name?: string | null;
  orgName?: string | null;
  orgType?: string | number | null;
}

interface ContactResponseRawData {
  orgIndustryContactVOS?: ContactOrgRawRecord[] | null;
  orgDetailList?: ContactOrgRawRecord[] | null;
  userStructureQueryVOS?: UserRawRecord[] | null;
  userList?: UserRawRecord[] | null;
}

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

function toStringValue(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string') return value;
  return '';
}

function toNumberValue(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = toNumberValue(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function extractList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];

  const record = data as Record<string, unknown>;
  const candidates = [record.records, record.list, record.rows, record.items, record.levelList];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function getHasChildren(row: OrgRawRecord, children: OrgRecord[]): boolean {
  if (typeof row.hasChildren === 'boolean') return row.hasChildren;
  if (children.length > 0) return true;
  if (row.isLeaf === true || row.leaf === true || row.noLazyChildren === true) return false;
  if (row.isLeaf === false || row.leaf === false) return true;
  return true;
}

function toOrgRow(row: OrgRawRecord): OrgRecord {
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
    isExternal: Boolean(row.isExternal),
    remark: toStringValue(row.remark),
    hasChildren: getHasChildren(row, children || []),
    children
  };
}

export function toOrgRows(rows: unknown): OrgRecord[] {
  return extractList(rows).map((row) => toOrgRow((row || {}) as OrgRawRecord));
}

function toDictItems(rows: unknown): DictItem[] {
  return extractList(rows).map((row) => {
    const raw = (row || {}) as DictRawItem;
    return {
      itemName: toStringValue(raw.itemName),
      itemValue: toStringValue(raw.itemValue)
    };
  });
}

function toOrgLevelItems(rows: unknown): OrgLevelItem[] {
  return extractList(rows).map((row) => {
    const raw = (row || {}) as OrgLevelRawItem;
    return {
      id: toStringValue(raw.id),
      orgLevel: toNumberValue(raw.orgLevel),
      orgLevelName: toStringValue(raw.orgLevelName),
      remark: toStringValue(raw.remark)
    };
  });
}

function toOrgManagerItems(rows: unknown): OrgManagerRecord[] {
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

function toUserBriefItems(rows: unknown): UserBriefRecord[] {
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

function toContactOrgNodes(rawData: ContactResponseRawData, parentId: string): OrgContactOrgNode[] {
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

function toContactUserNodes(rawData: ContactResponseRawData, parentId: string): OrgContactUserNode[] {
  const userRows = Array.isArray(rawData.userStructureQueryVOS)
    ? rawData.userStructureQueryVOS
    : Array.isArray(rawData.userList)
      ? rawData.userList
      : [];

  const users: OrgContactUserNode[] = [];
  userRows.forEach((item) => {
    const userId = toStringValue(item.id);
    if (!userId) return;

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

function toContactNodes(data: unknown, parentId = '0'): OrgContactNode[] {
  const rawData = (data || {}) as ContactResponseRawData;
  const orgNodes = toContactOrgNodes(rawData, parentId);
  const userNodes = toContactUserNodes(rawData, parentId);
  return [...orgNodes, ...userNodes];
}

export const orgApi = {
  getOrgTree: (params: OrgTreeParams) =>
    getHttpClient()
      .get<BizResponse<OrgRecord[]>>('/cmict/admin/org/children', {
        params: {
          parentId: params.parentId || '0'
        }
      })
      .then((response) => ({
        ...response,
        data: toOrgRows(response.data)
      })),

  searchOrgList: (params: OrgSearchParams) =>
    getHttpClient()
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

  queryAllOrgTree: () =>
    getHttpClient()
      .get<BizResponse<OrgRecord[]>>('/cmict/admin/org/manage/list')
      .then((response) => ({
        ...response,
        data: toOrgRows(response.data)
      })),

  addOrg: (data: OrgSavePayload) =>
    getHttpClient().post<BizResponse<OrgRecord>>('/cmict/admin/org/add', { data }),

  updateOrg: (data: OrgSavePayload) =>
    getHttpClient().post<BizResponse<OrgRecord>>('/cmict/admin/org/update', { data }),

  deleteOrg: (data: { id: string }) =>
    getHttpClient().post<BizResponse<null>>('/cmict/admin/org/delete', { data }),

  checkUnique: (params: OrgUniqueParams) =>
    getHttpClient().get<BizResponse<boolean>>('/cmict/admin/org/unique/check', {
      params: {
        orgName: trimText(params.orgName),
        parentId: params.parentId || '0',
        orgId: params.orgId
      }
    }),

  dictDataList: (params: { dictCode: string }) =>
    getHttpClient()
      .get<BizResponse<DictItem[]>>('/cmict/admin/dict-item/list', {
        params
      })
      .then((response) => ({
        ...response,
        data: toDictItems(response.data)
      })),

  getOrgLevelList: () =>
    getHttpClient()
      .get<BizResponse<OrgLevelItem[]>>('/cmict/admin/org-level/list')
      .then((response) => ({
        ...response,
        data: toOrgLevelItems(response.data)
      })),

  addOrgLevel: (data: OrgLevelSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/org-level/add', { data }),

  updateOrgLevel: (data: OrgLevelSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/org-level/update', { data }),

  deleteOrgLevel: (data: { id: string }) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/org-level/delete', { data }),

  queryOrgManagerList: (params: OrgManagerParams) =>
    getHttpClient()
      .get<BizResponse<OrgManagerRecord[]>>('/cmict/admin/org-admin/list', {
        params
      })
      .then((response) => ({
        ...response,
        data: toOrgManagerItems(response.data)
      })),

  searchAvailableUsers: (params: UserSearchParams) =>
    getHttpClient()
      .get<BizResponse<UserBriefRecord[]>>('/cmict/admin/user/list', {
        params: {
          nickName: trimText(params.nickName)
        }
      })
      .then((response) => ({
        ...response,
        data: toUserBriefItems(response.data)
      })),

  getOrgContactsLazy: (params: ContactLazyParams) =>
    getHttpClient()
      .get<BizResponse<unknown>>('/cmict/admin/org/contacts/lazy/tree', {
        params: {
          parentId: params.parentId || '0'
        }
      })
      .then((response) => ({
        ...response,
        data: toContactNodes(response.data, params.parentId || '0')
      })),

  searchContactUsers: (params: ContactUserSearchParams) =>
    getHttpClient()
      .get<BizResponse<unknown>>('/cmict/admin/user/structure/search/', {
        params: {
          search: trimText(params.search)
        }
      })
      .then((response) => ({
        ...response,
        data: toContactUserNodes((response.data || {}) as ContactResponseRawData, '0')
      })),

  getClientOwnInfo: () =>
    getHttpClient().get<BizResponse<{ userOrgs?: Array<{ companyId?: string | number; orgCode?: string }> }>>(
      '/cmict/admin/user/client-own-info'
    ),

  addOrgManager: (data: OrgManagerSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/org-admin/add', { data }),

  delOrgManager: (data: { id: string }) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/org-admin/delete', { data })
};

export default orgApi;
