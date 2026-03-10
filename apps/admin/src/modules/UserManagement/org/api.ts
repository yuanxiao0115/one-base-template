import { getHttpClient } from "@/shared/api/http-client";
import type {
  ApiResponse,
  ClientOwnInfoData,
  ContactLazyParams,
  ContactUserSearchParams,
  DictItem,
  OrgContactNode,
  OrgContactUserNode,
  OrgLevelItem,
  OrgLevelSavePayload,
  OrgManagerParams,
  OrgManagerRecord,
  OrgManagerSavePayload,
  OrgRecord,
  OrgSavePayload,
  OrgSearchParams,
  OrgTreeParams,
  OrgUniqueParams,
  UserBriefRecord,
  UserSearchParams,
} from "./types";

export type {
  ApiResponse,
  ClientOwnInfoData,
  ContactLazyParams,
  ContactUserSearchParams,
  DictItem,
  OrgContactNode,
  OrgContactOrgNode,
  OrgContactUserNode,
  OrgLevelItem,
  OrgLevelSavePayload,
  OrgManagerParams,
  OrgManagerRecord,
  OrgManagerSavePayload,
  OrgRecord,
  OrgSavePayload,
  OrgSearchParams,
  OrgTreeParams,
  OrgUniqueParams,
  UserBriefRecord,
  UserSearchParams,
} from "./types";

export const orgApi = {
  getOrgTree: async (params: OrgTreeParams) =>
    getHttpClient().get<ApiResponse<OrgRecord[]>>("/cmict/admin/org/children", { params }),

  searchOrgList: async (params: OrgSearchParams) =>
    getHttpClient().get<ApiResponse<OrgRecord[]>>("/cmict/admin/org/search", { params }),

  queryAllOrgTree: async () =>
    getHttpClient().get<ApiResponse<OrgRecord[]>>("/cmict/admin/org/manage/list"),

  addOrg: async (data: OrgSavePayload) =>
    getHttpClient().post<ApiResponse<OrgRecord>>("/cmict/admin/org/add", {
      data,
    }),

  updateOrg: async (data: OrgSavePayload) =>
    getHttpClient().post<ApiResponse<OrgRecord>>("/cmict/admin/org/update", {
      data,
    }),

  deleteOrg: async (data: { id: string }) =>
    getHttpClient().post<ApiResponse<null>>("/cmict/admin/org/delete", {
      data,
    }),

  checkUnique: async (params: OrgUniqueParams) =>
    getHttpClient().get<ApiResponse<boolean>>("/cmict/admin/org/unique/check", { params }),

  dictDataList: async (params: { dictCode: string }) =>
    getHttpClient().get<ApiResponse<DictItem[]>>("/cmict/admin/dict-item/list", {
      params,
    }),

  getOrgLevelList: async () => getHttpClient().get<ApiResponse<OrgLevelItem[]>>("/cmict/admin/org-level/list"),

  addOrgLevel: async (data: OrgLevelSavePayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/org-level/add", {
      data,
    }),

  updateOrgLevel: async (data: OrgLevelSavePayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/org-level/update", { data }),

  deleteOrgLevel: async (data: { id: string }) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/org-level/delete", { data }),

  queryOrgManagerList: async (params: OrgManagerParams) =>
    getHttpClient().get<ApiResponse<OrgManagerRecord[]>>("/cmict/admin/org-admin/list", {
      params,
    }),

  searchAvailableUsers: async (params: UserSearchParams) =>
    getHttpClient().get<ApiResponse<UserBriefRecord[]>>("/cmict/admin/user/list", { params }),

  getOrgContactsLazy: async (params: ContactLazyParams) =>
    getHttpClient().get<ApiResponse<OrgContactNode[]>>("/cmict/admin/org/contacts/lazy/tree", { params }),

  searchContactUsers: async (params: ContactUserSearchParams) =>
    getHttpClient().get<ApiResponse<OrgContactUserNode[]>>("/cmict/admin/user/structure/search/", { params }),

  getClientOwnInfo: async () => getHttpClient().get<ApiResponse<ClientOwnInfoData>>("/cmict/admin/user/client-own-info"),

  addOrgManager: async (data: OrgManagerSavePayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/org-admin/add", {
      data,
    }),

  delOrgManager: async (data: { id: string }) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/org-admin/delete", { data }),
};

export default orgApi;
