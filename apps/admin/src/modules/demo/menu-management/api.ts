import { getAppHttpClient } from '@/shared/api/http-client';

export type BizResponse<T> = {
  code: number
  data: T
  message?: string
}

export type PermissionTypeOption = {
  key: string
  value: string
}

export type MenuPermissionRecord = {
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

export type PermissionSearchParams = {
  resourceName?: string
  resourceType?: number | string
}

export type PermissionSavePayload = {
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

function getHttp () {
  return getAppHttpClient();
}

function normalizeText (value: string | undefined) {
  return (value || '').trim();
}

export const menuPermissionApi = {
  getResourceTypeEnum: async () => getHttp().get<BizResponse<PermissionTypeOption[]>>('/cmict/admin/permission/resource-type/enum'),

  getPermissionTree: async () => getHttp().get<BizResponse<MenuPermissionRecord[]>>('/cmict/admin/permission/tree'),

  getPermissionList: async (params: PermissionSearchParams) => getHttp().get<BizResponse<MenuPermissionRecord[]>>('/cmict/admin/permission/list', {
    params: {
      resourceName: normalizeText(params.resourceName),
      resourceType: params.resourceType ?? ''
    }
  }),

  addPermission: async (data: PermissionSavePayload) => getHttp().post<BizResponse<MenuPermissionRecord>>('/cmict/admin/permission/add', { data }),

  editPermission: async (data: PermissionSavePayload) => getHttp().post<BizResponse<MenuPermissionRecord>>('/cmict/admin/permission/update', { data }),

  deletePermission: async (idList: string[] | string) => getHttp().post<BizResponse<null>>('/cmict/admin/permission/delete', {
    data: {
      idList
    }
  })
};

export default menuPermissionApi;
