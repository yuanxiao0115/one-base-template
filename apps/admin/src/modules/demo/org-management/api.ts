import { getAppHttpClient } from '@/shared/api/http-client';
import { toNumberValue, toStringValue } from '@/shared/api/normalize';

export type BizResponse<T> = {
  code: number
  data: T
  message?: string
}

export type OrgRecord = {
  id: string
  parentId: string
  orgName: string
  briefName: string
  sort: number
  orgCategory: string
  orgLevelName: string
  institutionalType: string
  uscc: string
  createTime: string
  orgType: number
  isExternal: boolean
  hasChildren?: boolean
  children?: OrgRecord[]
}

type OrgRawRecord = {
  id?: number | string | null
  parentId?: number | string | null
  orgName?: string | null
  briefName?: string | null
  sort?: number | string | null
  orgCategory?: number | string | null
  orgLevelName?: string | null
  institutionalType?: number | string | null
  uscc?: string | null
  createTime?: string | null
  orgType?: number | string | null
  isExternal?: boolean | null
  hasChildren?: boolean | null
  isLeaf?: boolean | null
  leaf?: boolean | null
  noLazyChildren?: boolean | null
  children?: OrgRawRecord[] | null
}

export type OrgTreeParams = {
  parentId?: string
}

export type OrgSearchParams = {
  parentId?: string
  orgName?: string
}

export type OrgSavePayload = {
  id?: string
  parentId?: string
  orgName: string
  briefName?: string
  sort?: number
  orgCategory?: string
  institutionalType?: string
  orgLevelName?: string
  uscc?: string
  orgType?: number
  isExternal?: boolean
}

export const orgCategoryOptions = [
  {
    value: '1',
    label: '党政机关'
  },
  {
    value: '2',
    label: '事业单位'
  },
  {
    value: '3',
    label: '群团组织'
  }
];

export const institutionalTypeOptions = [
  {
    value: '1',
    label: '机关部室'
  },
  {
    value: '2',
    label: '直属单位'
  },
  {
    value: '3',
    label: '基层机构'
  }
];

export const orgTypeOptions = [
  {
    value: 1,
    label: '单位'
  },
  {
    value: 2,
    label: '部门'
  }
];

export const orgCategoryLabelMap = Object.fromEntries(orgCategoryOptions.map((item) => [item.value, item.label])) as Record<string, string>;

export const institutionalTypeLabelMap = Object.fromEntries(institutionalTypeOptions.map((item) => [item.value, item.label])) as Record<string, string>;

export const orgTypeLabelMap = Object.fromEntries(orgTypeOptions.map((item) => [String(item.value), item.label])) as Record<string, string>;

function getHttp () {
  return getAppHttpClient();
}

function normalizeKeyword (keyword: string | undefined) {
  return (keyword || '').trim();
}

function getHasChildren (row: OrgRawRecord, children: OrgRecord[]) {
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
  const children = Array.isArray(row.children) ? row.children.map((item) => toOrgRow(item)) : undefined;

  return {
    id: toStringValue(row.id),
    parentId: toStringValue(row.parentId),
    orgName: toStringValue(row.orgName),
    briefName: toStringValue(row.briefName),
    sort: toNumberValue(row.sort),
    orgCategory: toStringValue(row.orgCategory),
    orgLevelName: toStringValue(row.orgLevelName),
    institutionalType: toStringValue(row.institutionalType),
    uscc: toStringValue(row.uscc),
    createTime: toStringValue(row.createTime),
    orgType: toNumberValue(row.orgType),
    isExternal: Boolean(row.isExternal),
    hasChildren: getHasChildren(row, children || []),
    children
  };
}

export function toOrgRows (rows: unknown): OrgRecord[] {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row) => toOrgRow((row || {}) as OrgRawRecord));
}

export const orgDemoApi = {
  getOrgTree: async (params: OrgTreeParams) => getHttp()
    .get<BizResponse<OrgRecord[]>>('/cmict/admin/org/children', {
      params: {
        parentId: params.parentId || '0'
      }
    })
    .then((response) => ({
      ...response,
      data: toOrgRows(response.data)
    })),

  searchOrgList: async (params: OrgSearchParams) => getHttp()
    .get<BizResponse<OrgRecord[]>>('/cmict/admin/org/search', {
      params: {
        parentId: params.parentId || '0',
        orgName: normalizeKeyword(params.orgName)
      }
    })
    .then((response) => ({
      ...response,
      data: toOrgRows(response.data)
    })),

  addOrg: async (data: OrgSavePayload) => getHttp().post<BizResponse<OrgRecord>>('/cmict/admin/org/add', { data }),

  editOrg: async (data: OrgSavePayload) => getHttp().post<BizResponse<OrgRecord>>('/cmict/admin/org/update', { data }),

  deleteOrg: async (data: { id: string }) => getHttp().post<BizResponse<null>>('/cmict/admin/org/delete', { data })
};

export default orgDemoApi;
