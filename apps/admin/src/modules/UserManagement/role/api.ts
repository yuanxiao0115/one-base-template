import { getHttpClient, trimText } from '@/shared/api/utils';
import { extractList, toNumberValue, toRecord, toStringValue } from '@/shared/api/normalize';

export type BizResponse<T> = {
  code: number
  data: T
  message?: string
}

export type RoleRecord = {
  id: string
  roleName: string
  roleCode: string
  remark: string
  createTime: string
  updateTime: string
}

export type RolePageParams = {
  roleName?: string
  currentPage?: number
  pageSize?: number
}

export type RolePageData = {
  records: RoleRecord[]
  total: number
  currentPage: number
  pageSize: number
}

export type RoleSavePayload = {
  id?: string
  roleName: string
  roleCode: string
  remark: string
}

export type PermissionTreeNode = {
  id: string
  resourceName: string
  children: PermissionTreeNode[]
}

export type RolePermissionSavePayload = {
  roleId: string
  permissionIdList: string[]
}

type RolePageRawData = {
  records?: unknown[]
  list?: unknown[]
  rows?: unknown[]
  items?: unknown[]
  total?: number | string | null
  totalCount?: number | string | null
  count?: number | string | null
  currentPage?: number | string | null
  current?: number | string | null
  page?: number | string | null
  pageSize?: number | string | null
  size?: number | string | null
}

type RoleRawRecord = {
  id?: number | string | null
  roleName?: string | null
  roleCode?: string | null
  remark?: string | null
  createTime?: string | null
  updateTime?: string | null
}

type PermissionTreeRawNode = {
  id?: number | string | null
  resourceName?: string | null
  children?: PermissionTreeRawNode[] | null
}

function toRoleRecord (item: RoleRawRecord): RoleRecord {
  return {
    id: toStringValue(item.id),
    roleName: toStringValue(item.roleName),
    roleCode: toStringValue(item.roleCode),
    remark: toStringValue(item.remark),
    createTime: toStringValue(item.createTime),
    updateTime: toStringValue(item.updateTime)
  };
}

function toRolePageData (data: unknown): RolePageData {
  const payload = toRecord(data) as RolePageRawData;
  const records = extractList(payload).map((item) => toRoleRecord((item ?? {}) as RoleRawRecord));

  return {
    records,
    total: toNumberValue(payload.totalCount ?? payload.total ?? payload.count, records.length),
    currentPage: toNumberValue(payload.currentPage ?? payload.current ?? payload.page, 1),
    pageSize: toNumberValue(payload.pageSize ?? payload.size, 10)
  };
}

function toPermissionTreeNode (item: PermissionTreeRawNode): PermissionTreeNode {
  return {
    id: toStringValue(item.id),
    resourceName: toStringValue(item.resourceName),
    children: extractList(item.children).map((child) => toPermissionTreeNode((child ?? {}) as PermissionTreeRawNode))
  };
}

export const roleApi = {
  page: async (params: RolePageParams) => getHttpClient()
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

  add: async (data: RoleSavePayload) => getHttpClient().post<BizResponse<boolean>>('/cmict/admin/role/add', { data }),

  update: async (data: RoleSavePayload) => getHttpClient().post<BizResponse<boolean>>('/cmict/admin/role/update', { data }),

  remove: async (data: { idList: string[] }) => getHttpClient().post<BizResponse<boolean>>('/cmict/admin/role/delete', { data }),

  getPermissionTree: async () => getHttpClient()
    .get<BizResponse<PermissionTreeNode[]>>('/cmict/admin/permission/tree')
    .then((response) => ({
      ...response,
      data: extractList(response.data).map((item) => toPermissionTreeNode((item ?? {}) as PermissionTreeRawNode))
    })),

  getRolePermissionIds: async (params: { roleId: string }) => getHttpClient()
    .get<BizResponse<string[]>>('/cmict/admin/permission/id/list', {
      params
    })
    .then((response) => ({
      ...response,
      data: extractList(response.data).map((item) => toStringValue(item))
        .filter(Boolean)
    })),

  updateRolePermissions: async (data: RolePermissionSavePayload) => getHttpClient().post<BizResponse<boolean>>('/cmict/admin/role/permission/edit', { data })
};

export default roleApi;
