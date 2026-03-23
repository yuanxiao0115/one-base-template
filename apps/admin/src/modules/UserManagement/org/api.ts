import { obHttp } from '@one-base-template/core';
import type { ApiResponse } from '@/types/api';
import type {
  DictItem,
  OrgContactNode,
  OrgContactUserNode,
  OrgLevelItem,
  OrgLevelSavePayload,
  OrgManagerRecord,
  OrgRecord,
  OrgSavePayload
} from './types';

export const orgApi = {
  getOrgTree: async (params: { parentId?: string }) =>
    obHttp().get<ApiResponse<OrgRecord[]>>('/cmict/admin/org/children', { params }),

  searchOrgList: async (params: { parentId?: string; orgName?: string }) =>
    obHttp().get<ApiResponse<OrgRecord[]>>('/cmict/admin/org/search', { params }),

  queryAllOrgTree: async () =>
    obHttp().get<ApiResponse<OrgRecord[]>>('/cmict/admin/org/manage/list'),

  addOrg: async (data: OrgSavePayload) =>
    obHttp().post<ApiResponse<OrgRecord>>('/cmict/admin/org/add', {
      data
    }),

  updateOrg: async (data: OrgSavePayload) =>
    obHttp().post<ApiResponse<OrgRecord>>('/cmict/admin/org/update', {
      data
    }),

  deleteOrg: async (data: { id: string }) =>
    obHttp().post<ApiResponse<null>>('/cmict/admin/org/delete', {
      data
    }),

  checkUnique: async (params: { orgName: string; parentId?: string; orgId?: string }) =>
    obHttp().get<ApiResponse<boolean>>('/cmict/admin/org/unique/check', { params }),

  dictDataList: async (params: { dictCode: string }) =>
    obHttp().get<ApiResponse<DictItem[]>>('/cmict/admin/dict-item/list', {
      params
    }),

  getOrgLevelList: async () =>
    obHttp().get<ApiResponse<OrgLevelItem[]>>('/cmict/admin/org-level/list'),

  addOrgLevel: async (data: OrgLevelSavePayload) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/org-level/add', {
      data
    }),

  updateOrgLevel: async (data: OrgLevelSavePayload) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/org-level/update', { data }),

  deleteOrgLevel: async (data: { id: string }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/org-level/delete', { data }),

  queryOrgManagerList: async (params: { orgId: string }) =>
    obHttp().get<ApiResponse<OrgManagerRecord[]>>('/cmict/admin/org-admin/list', {
      params
    }),

  getOrgContactsLazy: async (params: { parentId?: string }) =>
    obHttp().get<ApiResponse<OrgContactNode[]>>('/cmict/admin/org/contacts/lazy/tree', { params }),

  searchContactUsers: async (params: { search?: string }) =>
    obHttp().get<ApiResponse<OrgContactUserNode[]>>('/cmict/admin/user/structure/search/', {
      params
    }),

  addOrgManager: async (data: { orgId: string; userId: string[] }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/org-admin/add', {
      data
    }),

  delOrgManager: async (data: { id: string }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/org-admin/delete', { data })
};

export default orgApi;
