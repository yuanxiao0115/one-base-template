import { obHttp } from '@one-base-template/core';
import type { ApiResponse } from '@/shared/api/types';
import type {
  OrgTreeNode,
  PositionItem,
  RoleItem,
  UploadImageResult,
  UserBriefRecord,
  UserDetailData,
  UserPageData,
  UserPageParams,
  UserSavePayload
} from './types';

export const userApi = {
  page: async (params: UserPageParams) =>
    obHttp().get<ApiResponse<UserPageData>>('/cmict/admin/user/manage/page', { params }),

  detail: async (params: { id: string }) =>
    obHttp().get<ApiResponse<UserDetailData>>('/cmict/admin/user/detail', {
      params: {
        id: params.id
      }
    }),

  add: async (data: UserSavePayload) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/user/add', {
      data
    }),

  update: async (data: UserSavePayload) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/user/update', {
      data
    }),

  remove: async (data: { id: string }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/user/delete', {
      data
    }),

  orgList: async () => obHttp().get<ApiResponse<OrgTreeNode[]>>('/cmict/admin/org/manage/list'),

  positionList: async () => obHttp().get<ApiResponse<PositionItem[]>>('/cmict/admin/sys-post/list'),

  roleList: async () => obHttp().get<ApiResponse<RoleItem[]>>('/cmict/admin/role/list'),

  searchUsers: async (params: { nickName?: string }) =>
    obHttp().get<ApiResponse<UserBriefRecord[]>>('/cmict/admin/user/list', { params }),

  updateStatus: async (data: { isEnable: boolean; ids: string[] }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/user/state', {
      data
    }),

  resetPwd: async (data: { id: string }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/user/password-reset', { data }),

  changeUserAccount: async (data: {
    userId: string;
    newUsername: string;
    isReset: number;
    newPassword?: string;
  }) => obHttp().post<ApiResponse<boolean>>('/cmict/admin/user/change-userAccount', { data }),

  checkUnique: async (data: {
    userId?: string;
    userAccount?: string;
    phone?: string;
    mail?: string;
  }) => obHttp().post<ApiResponse<boolean>>('/cmict/admin/user/unique/check', { data }),

  adjustOrgSort: async (data: { orgId: string; id: string; index: number }) =>
    obHttp().post<ApiResponse<boolean>>(
      `/cmict/admin/user/adjust-org-sort?orgId=${String(data.orgId)}&userId=${String(data.id)}&targetSort=${String(data.index)}`
    ),

  importUser: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return obHttp().post<ApiResponse<boolean>>('/cmict/admin/user/import', {
      data: formData,
      $isUpload: true
    });
  },

  manageEditPhoto: async (data: FormData) =>
    obHttp().post<ApiResponse<UploadImageResult>>('/cmict/file/avatar/manage/upload', {
      data,
      $isUpload: true
    }),

  editPhoto: async (data: FormData) =>
    obHttp().post<ApiResponse<UploadImageResult>>('/cmict/onemsg/personal/avatar/upload/user', {
      data,
      $isUpload: true
    }),

  updateCorporateUser: async (data: { corporateUserId: string; userIds: string[] }) =>
    obHttp().post<ApiResponse<boolean>>('/cmict/admin/corporate-user/update', { data })
};

export default userApi;
