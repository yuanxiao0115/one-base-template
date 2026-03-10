import { getHttpClient } from "@/shared/api/http-client";
import type {
  ApiResponse,
  OrgTreeNode,
  PositionItem,
  RoleItem,
  UploadImageResult,
  UserBindAccountPayload,
  UserBriefRecord,
  UserChangeAccountPayload,
  UserDetailData,
  UserPageData,
  UserPageParams,
  UserResetPasswordPayload,
  UserSavePayload,
  UserSortPayload,
  UserStatusPayload,
  UserUniquePayload,
} from "./types";

export type {
  ApiResponse,
  CorporateUserRecord,
  OrgTreeNode,
  PositionItem,
  RoleItem,
  UploadImageResult,
  UserBindAccountPayload,
  UserBriefRecord,
  UserChangeAccountPayload,
  UserDetailData,
  UserDetailRecord,
  UserListRecord,
  UserOrgPostRecord,
  UserOrgRecord,
  UserPageData,
  UserPageParams,
  UserResetPasswordPayload,
  UserSavePayload,
  UserSortPayload,
  UserStatusPayload,
  UserUniquePayload,
  UserRoleRecord,
} from "./types";

export const userApi = {
  page: async (params: UserPageParams) =>
    getHttpClient().get<ApiResponse<UserPageData>>("/cmict/admin/user/manage/page", { params }),

  detail: async (params: { id: string }) =>
    getHttpClient().get<ApiResponse<UserDetailData>>("/cmict/admin/user/detail", {
      params: {
        id: params.id,
      },
    }),

  add: async (data: UserSavePayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/user/add", {
      data,
    }),

  update: async (data: UserSavePayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/user/update", {
      data,
    }),

  remove: async (data: { id: string }) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/user/delete", {
      data,
    }),

  orgList: async () => getHttpClient().get<ApiResponse<OrgTreeNode[]>>("/cmict/admin/org/manage/list"),

  positionList: async () => getHttpClient().get<ApiResponse<PositionItem[]>>("/cmict/admin/sys-post/list"),

  roleList: async () => getHttpClient().get<ApiResponse<RoleItem[]>>("/cmict/admin/role/list"),

  searchUsers: async (params: { nickName?: string }) =>
    getHttpClient().get<ApiResponse<UserBriefRecord[]>>("/cmict/admin/user/list", { params }),

  updateStatus: async (data: UserStatusPayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/user/state", {
      data,
    }),

  resetPwd: async (data: UserResetPasswordPayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/user/password-reset", { data }),

  changeUserAccount: async (data: UserChangeAccountPayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/user/change-userAccount", { data }),

  checkUnique: async (data: UserUniquePayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/user/unique/check", { data }),

  adjustOrgSort: async (data: UserSortPayload) =>
    getHttpClient().post<ApiResponse<boolean>>(
      `/cmict/admin/user/adjust-org-sort?orgId=${String(data.orgId)}&userId=${String(data.id)}&targetSort=${String(data.index)}`
    ),

  importUser: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/user/import", {
      data: formData,
      $isUpload: true,
    });
  },

  manageEditPhoto: async (data: FormData) =>
    getHttpClient().post<ApiResponse<UploadImageResult>>("/cmict/file/avatar/manage/upload", {
      data,
      $isUpload: true,
    }),

  editPhoto: async (data: FormData) =>
    getHttpClient().post<ApiResponse<UploadImageResult>>("/cmict/onemsg/personal/avatar/upload/user", {
      data,
      $isUpload: true,
    }),

  updateCorporateUser: async (data: UserBindAccountPayload) =>
    getHttpClient().post<ApiResponse<boolean>>("/cmict/admin/corporate-user/update", { data }),
};

export default userApi;
