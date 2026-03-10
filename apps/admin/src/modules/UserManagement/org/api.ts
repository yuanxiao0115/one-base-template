import { getObHttpClient } from "@one-base-template/core";
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
    getObHttpClient().get<ApiResponse<OrgRecord[]>>("/cmict/admin/org/children", { params }),

  searchOrgList: async (params: OrgSearchParams) =>
    getObHttpClient().get<ApiResponse<OrgRecord[]>>("/cmict/admin/org/search", { params }),

  queryAllOrgTree: async () =>
    getObHttpClient().get<ApiResponse<OrgRecord[]>>("/cmict/admin/org/manage/list"),

  addOrg: async (data: OrgSavePayload) =>
    getObHttpClient().post<ApiResponse<OrgRecord>>("/cmict/admin/org/add", {
      data,
    }),

  updateOrg: async (data: OrgSavePayload) =>
    getObHttpClient().post<ApiResponse<OrgRecord>>("/cmict/admin/org/update", {
      data,
    }),

  deleteOrg: async (data: { id: string }) =>
    getObHttpClient().post<ApiResponse<null>>("/cmict/admin/org/delete", {
      data,
    }),

  checkUnique: async (params: OrgUniqueParams) =>
    getObHttpClient().get<ApiResponse<boolean>>("/cmict/admin/org/unique/check", { params }),

  dictDataList: async (params: { dictCode: string }) =>
    getObHttpClient().get<ApiResponse<DictItem[]>>("/cmict/admin/dict-item/list", {
      params,
    }),

  getOrgLevelList: async () => getObHttpClient().get<ApiResponse<OrgLevelItem[]>>("/cmict/admin/org-level/list"),

  addOrgLevel: async (data: OrgLevelSavePayload) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/org-level/add", {
      data,
    }),

  updateOrgLevel: async (data: OrgLevelSavePayload) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/org-level/update", { data }),

  deleteOrgLevel: async (data: { id: string }) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/org-level/delete", { data }),

  queryOrgManagerList: async (params: OrgManagerParams) =>
    getObHttpClient().get<ApiResponse<OrgManagerRecord[]>>("/cmict/admin/org-admin/list", {
      params,
    }),

  searchAvailableUsers: async (params: UserSearchParams) =>
    getObHttpClient().get<ApiResponse<UserBriefRecord[]>>("/cmict/admin/user/list", { params }),

  getOrgContactsLazy: async (params: ContactLazyParams) =>
    getObHttpClient().get<ApiResponse<OrgContactNode[]>>("/cmict/admin/org/contacts/lazy/tree", { params }),

  searchContactUsers: async (params: ContactUserSearchParams) =>
    getObHttpClient().get<ApiResponse<OrgContactUserNode[]>>("/cmict/admin/user/structure/search/", { params }),

  getClientOwnInfo: async () => getObHttpClient().get<ApiResponse<ClientOwnInfoData>>("/cmict/admin/user/client-own-info"),

  addOrgManager: async (data: OrgManagerSavePayload) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/org-admin/add", {
      data,
    }),

  delOrgManager: async (data: { id: string }) =>
    getObHttpClient().post<ApiResponse<boolean>>("/cmict/admin/org-admin/delete", { data }),
};

export default orgApi;
