import { getHttpClient, trimText } from '@/shared/api/utils';
import {
  extractList,
  toBooleanValue,
  toNumberValue,
  toRecord,
  toStringValue
} from '@/shared/api/normalize';

export type BizResponse<T> = {
  code: number
  data: T
  message?: string
}

export type UserOrgPostRecord = {
  id?: string
  postId: string
  postName?: string
  sort: number
  status: number
}

export type UserOrgRecord = {
  id?: string
  orgId: string
  orgName?: string
  orgRankType?: number | null
  ownSort: number
  sort: number
  status: number
  postVos: UserOrgPostRecord[]
}

export type UserListRecord = {
  id: string
  nickName: string
  userAccount: string
  phone: string
  phoneShow: boolean
  mail: string
  gender: number
  isEnable: boolean
  userType: number
  isExternal: boolean
  createTime: string
  lastLoginTime: string
}

export type UserDetailRecord = UserListRecord & {
  avatar: string
  remark: string
  roleIds: string[]
  userOrgs: UserOrgRecord[]
}

export type UserRoleRecord = {
  id: string
  roleName: string
}

export type CorporateUserRecord = {
  id: string
  userId: string
  userName: string
  nickName: string
  phone: string
}

export type UserDetailData = {
  userInfo: UserDetailRecord
  userRoleList: UserRoleRecord[]
  corporateUserList: CorporateUserRecord[]
}

export type UserPageParams = {
  nickName?: string
  phone?: string
  userAccount?: string
  isEnable?: boolean | null
  mail?: string
  orgId?: string
  startDate?: string
  endDate?: string
  currentPage?: number
  pageSize?: number
}

export type UserPageData = {
  records: UserListRecord[]
  total: number
  currentPage: number
  pageSize: number
}

export type UserSavePayload = {
  id?: string
  nickName: string
  userAccount: string
  phone: string
  phoneShow: boolean
  mail: string
  gender: number
  isEnable: boolean
  userType: number
  isExternal: boolean
  remark: string
  roleIds: string[]
  userOrgs: UserOrgRecord[]
}

export type UserUniquePayload = {
  userId?: string
  userAccount?: string
  phone?: string
  mail?: string
}

export type UserStatusPayload = {
  isEnable: boolean
  ids: string[]
}

export type UserResetPasswordPayload = {
  id: string
}

export type UserChangeAccountPayload = {
  userId: string
  newUsername: string
  isReset: number
  newPassword?: string
}

export type UserBindAccountPayload = {
  corporateUserId: string
  userIds: string[]
}

export type UserSortPayload = {
  orgId: string
  id: string
  index: number
}

export type OrgTreeNode = {
  id: string
  orgName: string
  orgType: number
  sort: number
  children: OrgTreeNode[]
}

export type PositionItem = {
  id: string
  postName: string
}

export type RoleItem = {
  id: string
  roleName: string
}

export type UserBriefRecord = {
  id: string
  nickName: string
  phone: string
  userAccount: string
}

type UserRawOrgPost = {
  id?: number | string | null
  postId?: number | string | null
  postName?: string | null
  sort?: number | string | null
  status?: number | string | null
}

type UserRawOrg = {
  id?: number | string | null
  orgId?: number | string | null
  orgName?: string | null
  orgRankType?: number | string | null
  ownSort?: number | string | null
  sort?: number | string | null
  status?: number | string | null
  postVos?: UserRawOrgPost[] | null
}

type UserRawRecord = {
  id?: number | string | null
  nickName?: string | null
  userAccount?: string | null
  phone?: string | null
  phoneShow?: boolean | null
  mail?: string | null
  gender?: number | string | null
  isEnable?: boolean | null
  userType?: number | string | null
  isExternal?: boolean | null
  createTime?: string | null
  lastLoginTime?: string | null
  avatar?: string | null
  remark?: string | null
  userOrgs?: UserRawOrg[] | null
  roleIds?: Array<number | string> | null
  corporateUserQueryVOS?: UserRawCorporateUser[] | null
}

type UserRawRole = {
  id?: number | string | null
  roleName?: string | null
}

type UserRawCorporateUser = {
  id?: number | string | null
  userId?: number | string | null
  userName?: string | null
  nickName?: string | null
  phone?: string | null
}

type UserPageRawData = {
  records?: UserRawRecord[] | null
  list?: UserRawRecord[] | null
  rows?: UserRawRecord[] | null
  items?: UserRawRecord[] | null
  total?: number | string | null
  totalCount?: number | string | null
  count?: number | string | null
  currentPage?: number | string | null
  current?: number | string | null
  page?: number | string | null
  pageSize?: number | string | null
  size?: number | string | null
}

type OrgTreeRawNode = {
  id?: number | string | null
  orgName?: string | null
  orgType?: number | string | null
  sort?: number | string | null
  children?: OrgTreeRawNode[] | null
}

type PositionRawItem = {
  id?: number | string | null
  postName?: string | null
}

type RoleRawItem = {
  id?: number | string | null
  roleName?: string | null
}

type UserDetailRawData = {
  userInfo?: UserRawRecord | null
  userRoleList?: UserRawRole[] | null
  corporateUserQueryVOS?: UserRawCorporateUser[] | null
}

function toUserOrgPost (item: UserRawOrgPost): UserOrgPostRecord {
  return {
    id: toStringValue(item.id),
    postId: toStringValue(item.postId),
    postName: toStringValue(item.postName),
    sort: toNumberValue(item.sort, 1),
    status: toNumberValue(item.status, 1)
  };
}

function toUserOrg (item: UserRawOrg): UserOrgRecord {
  const postVos = extractList(item.postVos).map((post) => toUserOrgPost((post || {}) as UserRawOrgPost));

  return {
    id: toStringValue(item.id),
    orgId: toStringValue(item.orgId),
    orgName: toStringValue(item.orgName),
    orgRankType: item.orgRankType == null || item.orgRankType === ''
      ? null
      : toNumberValue(item.orgRankType),
    ownSort: toNumberValue(item.ownSort, 1),
    sort: toNumberValue(item.sort, 1),
    status: toNumberValue(item.status, 1),
    postVos: postVos.length > 0
      ? postVos
      : [{
        postId: '',
        sort: 1,
        status: 1
      }]
  };
}

function toUserRow (item: UserRawRecord): UserListRecord {
  return {
    id: toStringValue(item.id),
    nickName: toStringValue(item.nickName),
    userAccount: toStringValue(item.userAccount),
    phone: toStringValue(item.phone),
    phoneShow: toBooleanValue(item.phoneShow, true),
    mail: toStringValue(item.mail),
    gender: toNumberValue(item.gender, 1),
    isEnable: toBooleanValue(item.isEnable, true),
    userType: toNumberValue(item.userType, 0),
    isExternal: toBooleanValue(item.isExternal, false),
    createTime: toStringValue(item.createTime),
    lastLoginTime: toStringValue(item.lastLoginTime)
  };
}

function toUserRole (item: UserRawRole): UserRoleRecord {
  return {
    id: toStringValue(item.id),
    roleName: toStringValue(item.roleName)
  };
}

function toCorporateUser (item: UserRawCorporateUser): CorporateUserRecord {
  return {
    id: toStringValue(item.id),
    userId: toStringValue(item.userId),
    userName: toStringValue(item.userName),
    nickName: toStringValue(item.nickName),
    phone: toStringValue(item.phone)
  };
}

function toUserDetail (userInfo: UserRawRecord, userRoleList: UserRoleRecord[]): UserDetailRecord {
  const userOrgs = extractList(userInfo.userOrgs).map((item) => toUserOrg((item || {}) as UserRawOrg));
  const roleIds = userRoleList.map((item) => item.id).filter(Boolean);

  return {
    ...toUserRow(userInfo),
    avatar: toStringValue(userInfo.avatar),
    remark: toStringValue(userInfo.remark),
    roleIds,
    userOrgs: userOrgs.length > 0
      ? userOrgs
      : [{
        orgId: '',
        ownSort: 1,
        sort: 1,
        status: 1,
        postVos: [{
          postId: '',
          sort: 1,
          status: 1
        }]
      }]
  };
}

function toUserPageData (data: unknown): UserPageData {
  const payload = toRecord(data) as UserPageRawData;
  const records = extractList(payload).map((item) => toUserRow((item || {}) as UserRawRecord));
  const total = toNumberValue(payload.totalCount ?? payload.total ?? payload.count, records.length);
  const currentPage = toNumberValue(payload.currentPage ?? payload.current ?? payload.page, 1);
  const pageSize = toNumberValue(payload.pageSize ?? payload.size, 10);

  return {
    records,
    total,
    currentPage,
    pageSize
  };
}

function toUserDetailData (data: unknown): UserDetailData {
  const payload = toRecord(data) as UserDetailRawData;
  const fallbackUserInfo = (payload as unknown as UserRawRecord) || {};
  const userInfo = ((payload.userInfo || fallbackUserInfo) || {});

  const userRoleList = extractList(payload.userRoleList).map((item) => toUserRole((item || {}) as UserRawRole));

  const corporateSource = payload.corporateUserQueryVOS ?? userInfo.corporateUserQueryVOS;
  const corporateUserList = extractList(corporateSource).map((item) => toCorporateUser((item || {}) as UserRawCorporateUser));

  return {
    userInfo: toUserDetail(userInfo, userRoleList),
    userRoleList,
    corporateUserList
  };
}

function toOrgTree (item: OrgTreeRawNode): OrgTreeNode {
  const children = extractList(item.children).map((child) => toOrgTree((child || {}) as OrgTreeRawNode));
  return {
    id: toStringValue(item.id),
    orgName: toStringValue(item.orgName),
    orgType: toNumberValue(item.orgType, 0),
    sort: toNumberValue(item.sort, 0),
    children
  };
}

function toPositionItem (item: PositionRawItem): PositionItem {
  return {
    id: toStringValue(item.id),
    postName: toStringValue(item.postName)
  };
}

function toRoleItem (item: RoleRawItem): RoleItem {
  return {
    id: toStringValue(item.id),
    roleName: toStringValue(item.roleName)
  };
}

function toUserBrief (item: UserRawRecord): UserBriefRecord {
  return {
    id: toStringValue(item.id),
    nickName: toStringValue(item.nickName),
    phone: toStringValue(item.phone),
    userAccount: toStringValue(item.userAccount)
  };
}

function encodeQueryValue (value: number | string): string {
  return encodeURIComponent(String(value));
}

export const userApi = {
  page: async (params: UserPageParams) => {
    const startDate = trimText(params.startDate);
    const endDate = trimText(params.endDate);

    return getHttpClient()
      .get<BizResponse<UserPageData>>('/cmict/admin/user/manage/page', {
        params: {
          nickName: trimText(params.nickName),
          phone: trimText(params.phone),
          userAccount: trimText(params.userAccount),
          isEnable: params.isEnable,
          mail: trimText(params.mail),
          orgId: params.orgId,
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
          currentPage: params.currentPage,
          pageSize: params.pageSize
        }
      })
      .then((response) => ({
        ...response,
        data: toUserPageData(response.data)
      }));
  },

  detail: async (params: { id: string }) => getHttpClient()
    .get<BizResponse<UserDetailData>>('/cmict/admin/user/detail', {
      params: {
        id: params.id
      }
    })
    .then((response) => ({
      ...response,
      data: toUserDetailData(response.data)
    })),

  add: async (data: UserSavePayload) => getHttpClient().post<BizResponse<boolean>>('/cmict/admin/user/add', { data }),

  update: async (data: UserSavePayload) => getHttpClient().post<BizResponse<boolean>>('/cmict/admin/user/update', { data }),

  remove: async (data: { id: string }) => getHttpClient().post<BizResponse<boolean>>('/cmict/admin/user/delete', { data }),

  orgList: async () => getHttpClient()
    .get<BizResponse<OrgTreeNode[]>>('/cmict/admin/org/manage/list')
    .then((response) => ({
      ...response,
      data: extractList(response.data).map((item) => toOrgTree((item || {}) as OrgTreeRawNode))
    })),

  positionList: async () => getHttpClient()
    .get<BizResponse<PositionItem[]>>('/cmict/admin/sys-post/list')
    .then((response) => ({
      ...response,
      data: extractList(response.data).map((item) => toPositionItem((item || {}) as PositionRawItem))
    })),

  roleList: async () => getHttpClient()
    .get<BizResponse<RoleItem[]>>('/cmict/admin/role/list')
    .then((response) => ({
      ...response,
      data: extractList(response.data).map((item) => toRoleItem((item || {}) as RoleRawItem))
    })),

  searchUsers: async (params: { nickName?: string }) => getHttpClient()
    .get<BizResponse<UserBriefRecord[]>>('/cmict/admin/user/list', {
      params: {
        nickName: trimText(params.nickName)
      }
    })
    .then((response) => ({
      ...response,
      data: extractList(response.data).map((item) => toUserBrief((item || {}) as UserRawRecord))
    })),

  updateStatus: async (data: UserStatusPayload) => getHttpClient().post<BizResponse<boolean>>('/cmict/admin/user/state', { data }),

  resetPwd: async (data: UserResetPasswordPayload) => getHttpClient().post<BizResponse<boolean>>('/cmict/admin/user/password-reset', { data }),

  changeUserAccount: async (data: UserChangeAccountPayload) => getHttpClient().post<BizResponse<boolean>>('/cmict/admin/user/change-userAccount', { data }),

  checkUnique: async (data: UserUniquePayload) => getHttpClient().post<BizResponse<boolean>>('/cmict/admin/user/unique/check', { data }),

  adjustOrgSort: async (data: UserSortPayload) => getHttpClient().post<BizResponse<boolean>>(`/cmict/admin/user/adjust-org-sort?orgId=${encodeQueryValue(data.orgId)}&userId=${encodeQueryValue(data.id)}&targetSort=${encodeQueryValue(data.index)}`),

  importUser: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return getHttpClient().post<BizResponse<boolean>>('/cmict/admin/user/import', {
      data: formData,
      $isUpload: true
    });
  },

  manageEditPhoto: async (data: FormData) => getHttpClient().post<BizResponse<{ id?: string }>>('/cmict/file/avatar/manage/upload', {
    data,
    $isUpload: true
  }),

  editPhoto: async (data: FormData) => getHttpClient().post<BizResponse<{ id?: string }>>('/cmict/onemsg/personal/avatar/upload/user', {
    data,
    $isUpload: true
  }),

  updateCorporateUser: async (data: UserBindAccountPayload) => getHttpClient().post<BizResponse<boolean>>('/cmict/admin/corporate-user/update', { data })
};

export default userApi;
