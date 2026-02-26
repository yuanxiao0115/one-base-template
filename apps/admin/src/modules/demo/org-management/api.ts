import { getObHttpClient } from '@/infra/http'

export interface BizResponse<T> {
  code: number
  data: T
  message?: string
}

export interface OrgRecord {
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

export interface OrgTreeParams {
  parentId?: string
}

export interface OrgSearchParams {
  orgName?: string
}

export interface OrgSavePayload {
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
  { value: '1', label: '党政机关' },
  { value: '2', label: '事业单位' },
  { value: '3', label: '群团组织' }
]

export const institutionalTypeOptions = [
  { value: '1', label: '机关部室' },
  { value: '2', label: '直属单位' },
  { value: '3', label: '基层机构' }
]

export const orgTypeOptions = [
  { value: 1, label: '单位' },
  { value: 2, label: '部门' }
]

export const orgCategoryLabelMap = Object.fromEntries(
  orgCategoryOptions.map((item) => [item.value, item.label])
) as Record<string, string>

export const institutionalTypeLabelMap = Object.fromEntries(
  institutionalTypeOptions.map((item) => [item.value, item.label])
) as Record<string, string>

export const orgTypeLabelMap = Object.fromEntries(
  orgTypeOptions.map((item) => [String(item.value), item.label])
) as Record<string, string>

function getHttp() {
  return getObHttpClient()
}

function normalizeKeyword(keyword: string | undefined) {
  return (keyword || '').trim()
}

export const orgDemoApi = {
  getOrgTree: (params: OrgTreeParams) =>
    getHttp().get<BizResponse<OrgRecord[]>>('/cmict/admin/org/children', {
      params: {
        parentId: params.parentId || '0'
      }
    }),

  searchOrgList: (params: OrgSearchParams) =>
    getHttp().get<BizResponse<OrgRecord[]>>('/cmict/admin/org/search', {
      params: {
        orgName: normalizeKeyword(params.orgName)
      }
    }),

  addOrg: (data: OrgSavePayload) =>
    getHttp().post<BizResponse<OrgRecord>>('/cmict/admin/org/add', { data }),

  editOrg: (data: OrgSavePayload) =>
    getHttp().post<BizResponse<OrgRecord>>('/cmict/admin/org/update', { data }),

  deleteOrg: (data: { id: string }) =>
    getHttp().post<BizResponse<null>>('/cmict/admin/org/delete', { data })
}

export default orgDemoApi
