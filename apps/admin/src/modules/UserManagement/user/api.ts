import { getHttpClient, trimText } from '@/shared/api/utils'
import {
  extractList,
  toBooleanValue,
  toNumberValue,
  toRecord,
  toStringValue
} from '@/shared/api/normalize'

export interface BizResponse<T> {
  code: number
  data: T
  message?: string
}

export interface UserOrgPostRecord {
  id?: string
  postId: string
  postName?: string
  sort: number
  status: number
}

export interface UserOrgRecord {
  id?: string
  orgId: string
  orgName?: string
  orgRankType?: number | null
  ownSort: number
  sort: number
  status: number
  postVos: UserOrgPostRecord[]
}

export interface UserListRecord {
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

export interface UserDetailRecord extends UserListRecord {
  avatar: string
  remark: string
  roleIds: string[]
  userOrgs: UserOrgRecord[]
}

export interface UserRoleRecord {
  id: string
  roleName: string
}

export interface CorporateUserRecord {
  id: string
  userId: string
  userName: string
  nickName: string
  phone: string
}

export interface UserDetailData {
  userInfo: UserDetailRecord
  userRoleList: UserRoleRecord[]
  corporateUserList: CorporateUserRecord[]
}

export interface UserPageParams {
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

export interface UserPageData {
  records: UserListRecord[]
  total: number
  currentPage: number
  pageSize: number
}

export interface UserSavePayload {
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

export interface UserUniquePayload {
  userId?: string
  userAccount?: string
  phone?: string
  mail?: string
}

export interface UserStatusPayload {
  isEnable: boolean
  ids: string[]
}

export interface UserResetPasswordPayload {
  id: string
}

export interface UserChangeAccountPayload {
  userId: string
  newUsername: string
  isReset: number
  newPassword?: string
}

export interface UserBindAccountPayload {
  corporateUserId: string
  userIds: string[]
}

export interface UserSortPayload {
  orgId: string
  id: string
  index: number
}

export interface OrgTreeNode {
  id: string
  orgName: string
  orgType: number
  sort: number
  children: OrgTreeNode[]
}

export interface PositionItem {
  id: string
  postName: string
}

export interface RoleItem {
  id: string
  roleName: string
}

export interface UserBriefRecord {
  id: string
  nickName: string
  phone: string
  userAccount: string
}

type UserRawOrgPost = {
  id?: string | number | null
  postId?: string | number | null
  postName?: string | null
  sort?: string | number | null
  status?: string | number | null
}

type UserRawOrg = {
  id?: string | number | null
  orgId?: string | number | null
  orgName?: string | null
  orgRankType?: string | number | null
  ownSort?: string | number | null
  sort?: string | number | null
  status?: string | number | null
  postVos?: UserRawOrgPost[] | null
}

type UserRawRecord = {
  id?: string | number | null
  nickName?: string | null
  userAccount?: string | null
  phone?: string | null
  phoneShow?: boolean | null
  mail?: string | null
  gender?: string | number | null
  isEnable?: boolean | null
  userType?: string | number | null
  isExternal?: boolean | null
  createTime?: string | null
  lastLoginTime?: string | null
  avatar?: string | null
  remark?: string | null
  userOrgs?: UserRawOrg[] | null
  roleIds?: Array<string | number> | null
  corporateUserQueryVOS?: UserRawCorporateUser[] | null
}

type UserRawRole = {
  id?: string | number | null
  roleName?: string | null
}

type UserRawCorporateUser = {
  id?: string | number | null
  userId?: string | number | null
  userName?: string | null
  nickName?: string | null
  phone?: string | null
}

type UserPageRawData = {
  records?: UserRawRecord[] | null
  list?: UserRawRecord[] | null
  rows?: UserRawRecord[] | null
  items?: UserRawRecord[] | null
  total?: string | number | null
  totalCount?: string | number | null
  count?: string | number | null
  currentPage?: string | number | null
  current?: string | number | null
  page?: string | number | null
  pageSize?: string | number | null
  size?: string | number | null
}

type OrgTreeRawNode = {
  id?: string | number | null
  orgName?: string | null
  orgType?: string | number | null
  sort?: string | number | null
  children?: OrgTreeRawNode[] | null
}

type PositionRawItem = {
  id?: string | number | null
  postName?: string | null
}

type RoleRawItem = {
  id?: string | number | null
  roleName?: string | null
}

type UserDetailRawData = {
  userInfo?: UserRawRecord | null
  userRoleList?: UserRawRole[] | null
  corporateUserQueryVOS?: UserRawCorporateUser[] | null
}

function toUserOrgPost(item: UserRawOrgPost): UserOrgPostRecord {
  return {
    id: toStringValue(item.id),
    postId: toStringValue(item.postId),
    postName: toStringValue(item.postName),
    sort: toNumberValue(item.sort, 1),
    status: toNumberValue(item.status, 1)
  }
}

function toUserOrg(item: UserRawOrg): UserOrgRecord {
  const postVos = extractList(item.postVos).map((post) => toUserOrgPost((post || {}) as UserRawOrgPost))

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
      : [{ postId: '', sort: 1, status: 1 }]
  }
}

function toUserRow(item: UserRawRecord): UserListRecord {
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
  }
}

function toUserRole(item: UserRawRole): UserRoleRecord {
  return {
    id: toStringValue(item.id),
    roleName: toStringValue(item.roleName)
  }
}

function toCorporateUser(item: UserRawCorporateUser): CorporateUserRecord {
  return {
    id: toStringValue(item.id),
    userId: toStringValue(item.userId),
    userName: toStringValue(item.userName),
    nickName: toStringValue(item.nickName),
    phone: toStringValue(item.phone)
  }
}

function toUserDetail(userInfo: UserRawRecord, userRoleList: UserRoleRecord[]): UserDetailRecord {
  const userOrgs = extractList(userInfo.userOrgs).map((item) => toUserOrg((item || {}) as UserRawOrg))
  const roleIds = userRoleList.map((item) => item.id).filter(Boolean)

  return {
    ...toUserRow(userInfo),
    avatar: toStringValue(userInfo.avatar),
    remark: toStringValue(userInfo.remark),
    roleIds,
    userOrgs: userOrgs.length > 0
      ? userOrgs
      : [{ orgId: '', ownSort: 1, sort: 1, status: 1, postVos: [{ postId: '', sort: 1, status: 1 }] }]
  }
}

function toUserPageData(data: unknown): UserPageData {
  const payload = toRecord(data) as UserPageRawData
  const records = extractList(payload).map((item) => toUserRow((item || {}) as UserRawRecord))
  const total = toNumberValue(payload.totalCount ?? payload.total ?? payload.count, records.length)
  const currentPage = toNumberValue(payload.currentPage ?? payload.current ?? payload.page, 1)
  const pageSize = toNumberValue(payload.pageSize ?? payload.size, 10)

  return {
    records,
    total,
    currentPage,
    pageSize
  }
}

function toUserDetailData(data: unknown): UserDetailData {
  const payload = toRecord(data) as UserDetailRawData
  const fallbackUserInfo = (payload as unknown as UserRawRecord) || {}
  const userInfo = ((payload.userInfo || fallbackUserInfo) || {}) as UserRawRecord

  const userRoleList = extractList(payload.userRoleList).map((item) => toUserRole((item || {}) as UserRawRole))

  const corporateSource = payload.corporateUserQueryVOS ?? userInfo.corporateUserQueryVOS
  const corporateUserList = extractList(corporateSource).map((item) =>
    toCorporateUser((item || {}) as UserRawCorporateUser)
  )

  return {
    userInfo: toUserDetail(userInfo, userRoleList),
    userRoleList,
    corporateUserList
  }
}

function toOrgTree(item: OrgTreeRawNode): OrgTreeNode {
  const children = extractList(item.children).map((child) => toOrgTree((child || {}) as OrgTreeRawNode))
  return {
    id: toStringValue(item.id),
    orgName: toStringValue(item.orgName),
    orgType: toNumberValue(item.orgType, 0),
    sort: toNumberValue(item.sort, 0),
    children
  }
}

function toPositionItem(item: PositionRawItem): PositionItem {
  return {
    id: toStringValue(item.id),
    postName: toStringValue(item.postName)
  }
}

function toRoleItem(item: RoleRawItem): RoleItem {
  return {
    id: toStringValue(item.id),
    roleName: toStringValue(item.roleName)
  }
}

function toUserBrief(item: UserRawRecord): UserBriefRecord {
  return {
    id: toStringValue(item.id),
    nickName: toStringValue(item.nickName),
    phone: toStringValue(item.phone),
    userAccount: toStringValue(item.userAccount)
  }
}

function encodeQueryValue(value: string | number): string {
  return encodeURIComponent(String(value))
}

export const userApi = {
  page: (params: UserPageParams) => {
    const startDate = trimText(params.startDate)
    const endDate = trimText(params.endDate)

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
      }))
  },

  detail: (params: { id: string }) =>
    getHttpClient()
      .get<BizResponse<UserDetailData>>('/cmict/admin/user/detail', {
        params: {
          id: params.id
        }
      })
      .then((response) => ({
        ...response,
        data: toUserDetailData(response.data)
      })),

  add: (data: UserSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/user/add', { data }),

  update: (data: UserSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/user/update', { data }),

  remove: (data: { id: string }) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/user/delete', { data }),

  orgList: () =>
    getHttpClient()
      .get<BizResponse<OrgTreeNode[]>>('/cmict/admin/org/manage/list')
      .then((response) => ({
        ...response,
        data: extractList(response.data).map((item) => toOrgTree((item || {}) as OrgTreeRawNode))
      })),

  positionList: () =>
    getHttpClient()
      .get<BizResponse<PositionItem[]>>('/cmict/admin/sys-post/list')
      .then((response) => ({
        ...response,
        data: extractList(response.data).map((item) => toPositionItem((item || {}) as PositionRawItem))
      })),

  roleList: () =>
    getHttpClient()
      .get<BizResponse<RoleItem[]>>('/cmict/admin/role/list')
      .then((response) => ({
        ...response,
        data: extractList(response.data).map((item) => toRoleItem((item || {}) as RoleRawItem))
      })),

  searchUsers: (params: { nickName?: string }) =>
    getHttpClient()
      .get<BizResponse<UserBriefRecord[]>>('/cmict/admin/user/list', {
        params: {
          nickName: trimText(params.nickName)
        }
      })
      .then((response) => ({
        ...response,
        data: extractList(response.data).map((item) => toUserBrief((item || {}) as UserRawRecord))
      })),

  updateStatus: (data: UserStatusPayload) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/user/state', { data }),

  resetPwd: (data: UserResetPasswordPayload) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/user/password-reset', { data }),

  changeUserAccount: (data: UserChangeAccountPayload) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/user/change-userAccount', { data }),

  checkUnique: (data: UserUniquePayload) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/user/unique/check', { data }),

  adjustOrgSort: (data: UserSortPayload) =>
    getHttpClient().post<BizResponse<boolean>>(
      `/cmict/admin/user/adjust-org-sort?orgId=${encodeQueryValue(data.orgId)}&userId=${encodeQueryValue(data.id)}&targetSort=${encodeQueryValue(data.index)}`
    ),

  importUser: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return getHttpClient().post<BizResponse<boolean>>('/cmict/admin/user/import', {
      data: formData,
      $isUpload: true
    })
  },

  manageEditPhoto: (data: FormData) =>
    getHttpClient().post<BizResponse<{ id?: string }>>('/cmict/file/avatar/manage/upload', {
      data,
      $isUpload: true
    }),

  editPhoto: (data: FormData) =>
    getHttpClient().post<BizResponse<{ id?: string }>>('/cmict/onemsg/personal/avatar/upload/user', {
      data,
      $isUpload: true
    }),

  updateCorporateUser: (data: UserBindAccountPayload) =>
    getHttpClient().post<BizResponse<boolean>>('/cmict/admin/corporate-user/update', { data })
}

export default userApi
