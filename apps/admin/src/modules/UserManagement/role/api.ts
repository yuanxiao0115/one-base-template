import { getHttpClient, trimText } from '@/shared/api/utils'
import { extractList, toNumberValue, toRecord, toStringValue } from '@/shared/api/normalize'

export interface BizResponse<T> {
  code: number
  data: T
  message?: string
}

export interface RoleRecord {
  id: string
  roleName: string
  roleCode: string
  remark: string
  createTime: string
  updateTime: string
}

export interface RolePageParams {
  roleName?: string
  currentPage?: number
  pageSize?: number
}

export interface RolePageData {
  records: RoleRecord[]
  total: number
  currentPage: number
  pageSize: number
}

export interface RoleSavePayload {
  id?: string
  roleName: string
  roleCode: string
  remark: string
}

export interface PermissionTreeNode {
  id: string
  resourceName: string
  children: PermissionTreeNode[]
}

export interface RolePermissionSavePayload {
  roleId: string
  permissionIdList: string[]
}

type RolePageRawData = {
  records?: unknown[]
  list?: unknown[]
  rows?: unknown[]
  items?: unknown[]
  total?: string | number | null
  totalCount?: string | number | null
  count?: string | number | null
  currentPage?: string | number | null
  current?: string | number | null
  page?: string | number | null
  pageSize?: string | number | null
  size?: string | number | null
}

type RoleRawRecord = {
  id?: string | number | null
  roleName?: string | null
  roleCode?: string | null
  remark?: string | null
  createTime?: string | null
  updateTime?: string | null
}

type PermissionTreeRawNode = {
  id?: string | number | null
  resourceName?: string | null
  children?: PermissionTreeRawNode[] | null
}

function toRoleRecord(item: RoleRawRecord): RoleRecord {
  return {
    id: toStringValue(item.id),
    roleName: toStringValue(item.roleName),
    roleCode: toStringValue(item.roleCode),
    remark: toStringValue(item.remark),
    createTime: toStringValue(item.createTime),
    updateTime: toStringValue(item.updateTime)
  }
}

function toRolePageData(data: unknown): RolePageData {
  const payload = toRecord(data) as RolePageRawData
  const records = extractList(payload).map((item) => toRoleRecord((item || {}) as RoleRawRecord))

  return {
    records,
    total: toNumberValue(payload.totalCount ?? payload.total ?? payload.count, records.length),
    currentPage: toNumberValue(payload.currentPage ?? payload.current ?? payload.page, 1),
    pageSize: toNumberValue(payload.pageSize ?? payload.size, 10)
  }
}

function toPermissionTreeNode(item: PermissionTreeRawNode): PermissionTreeNode {
  return {
    id: toStringValue(item.id),
    resourceName: toStringValue(item.resourceName),
    children: extractList(item.children).map((child) => toPermissionTreeNode((child || {}) as PermissionTreeRawNode))
  }
}

export const roleApi = {
  page: (params: RolePageParams) =>
    getHttpClient()
      .get<BizResponse<RolePageData>>('/cmict/admin/role/page', {
        params: {
          roleName: trimText(params.roleName),
          currentPage: params.currentPage,
          pageSize: params.pageSize
        }
      })
      .then((response) => ({
        ...response,
        data: toRolePageData(response.data)
      })),

  add: (data: RoleSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/role/add', { data }),

  update: (data: RoleSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/role/update', { data }),

  remove: (data: { idList: string[] }) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/role/delete', { data }),

  getPermissionTree: () =>
    getHttpClient()
      .get<BizResponse<PermissionTreeNode[]>>('/cmict/admin/permission/tree')
      .then((response) => ({
        ...response,
        data: extractList(response.data).map((item) => toPermissionTreeNode((item || {}) as PermissionTreeRawNode))
      })),

  getRolePermissionIds: (params: { roleId: string }) =>
    getHttpClient()
      .get<BizResponse<string[]>>('/cmict/admin/permission/id/list', {
        params
      })
      .then((response) => ({
        ...response,
        data: extractList(response.data).map((item) => toStringValue(item)).filter(Boolean)
      })),

  updateRolePermissions: (data: RolePermissionSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/role/permission/edit', { data })
}

export default roleApi
