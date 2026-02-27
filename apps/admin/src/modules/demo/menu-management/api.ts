import { getAppHttpClient } from '@/shared/api/http-client'

export interface BizResponse<T> {
  code: number
  data: T
  message?: string
}

export interface PermissionTypeOption {
  key: string
  value: string
}

export interface MenuPermissionRecord {
  id: string
  parentId: string
  resourceType: number
  resourceTypeText?: string
  resourceName: string
  permissionCode: string
  icon: string
  image: string
  url: string
  openMode: number
  redirect: string
  routeCache: number
  sort: number
  hidden: number
  component: string
  remark: string
  children?: MenuPermissionRecord[]
}

export interface PermissionSearchParams {
  resourceName?: string
  resourceType?: string | number
}

export interface PermissionSavePayload {
  id?: string
  parentId?: string
  resourceType: number
  resourceName: string
  permissionCode?: string
  icon?: string
  image?: string
  url?: string
  openMode?: number
  redirect?: string
  routeCache?: number
  sort?: number
  hidden?: number
  component?: string
  remark?: string
}

function getHttp() {
  return getAppHttpClient()
}

function normalizeText(value: string | undefined) {
  return (value || '').trim()
}

export const menuPermissionApi = {
  getResourceTypeEnum: () =>
    getHttp().get<BizResponse<PermissionTypeOption[]>>('/cmict/admin/permission/resource-type/enum'),

  getPermissionTree: () =>
    getHttp().get<BizResponse<MenuPermissionRecord[]>>('/cmict/admin/permission/tree'),

  getPermissionList: (params: PermissionSearchParams) =>
    getHttp().get<BizResponse<MenuPermissionRecord[]>>('/cmict/admin/permission/list', {
      params: {
        resourceName: normalizeText(params.resourceName),
        resourceType: params.resourceType ?? ''
      }
    }),

  addPermission: (data: PermissionSavePayload) =>
    getHttp().post<BizResponse<MenuPermissionRecord>>('/cmict/admin/permission/add', { data }),

  editPermission: (data: PermissionSavePayload) =>
    getHttp().post<BizResponse<MenuPermissionRecord>>('/cmict/admin/permission/update', { data }),

  deletePermission: (idList: string | string[]) =>
    getHttp().post<BizResponse<null>>('/cmict/admin/permission/delete', {
      data: {
        idList
      }
    })
}

export default menuPermissionApi
