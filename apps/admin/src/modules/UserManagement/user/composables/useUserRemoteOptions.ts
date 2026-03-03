import type { Ref } from 'vue'
import {
  userApi,
  type OrgTreeNode,
  type PositionItem,
  type RoleItem
} from '../api'
import {
  assertUniqueCheck,
  toUserUniqueSnapshot
} from '../../shared/unique'

type UseUserRemoteOptionsParams = {
  orgTreeData: Ref<OrgTreeNode[]>
  positionOptions: Ref<PositionItem[]>
  roleOptions: Ref<RoleItem[]>
}

function getSortedOrgTree(nodes: OrgTreeNode[]): OrgTreeNode[] {
  return [...nodes]
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
    .map((item) => ({
      ...item,
      children: Array.isArray(item.children) ? getSortedOrgTree(item.children) : []
    }))
}

export function useUserRemoteOptions(params: UseUserRemoteOptionsParams) {
  const {
    orgTreeData,
    positionOptions,
    roleOptions
  } = params

  async function loadOrgTree() {
    const response = await userApi.orgList()
    if (response.code !== 200) {
      throw new Error(response.message || '加载组织树失败')
    }

    orgTreeData.value = getSortedOrgTree(response.data || [])
  }

  async function loadPositionOptions() {
    const response = await userApi.positionList()
    if (response.code !== 200) {
      throw new Error(response.message || '加载职位列表失败')
    }

    positionOptions.value = response.data || []
  }

  async function loadRoleOptions() {
    const response = await userApi.roleList()
    if (response.code !== 200) {
      throw new Error(response.message || '加载角色列表失败')
    }

    roleOptions.value = response.data || []
  }

  async function checkFieldUnique(params: {
    userId?: string
    userAccount?: string
    phone?: string
    mail?: string
  }) {
    const payload: {
      userId?: string
      userAccount?: string
      phone?: string
      mail?: string
    } = {
      userId: params.userId
    }

    if (params.userAccount !== undefined) {
      payload.userAccount = toUserUniqueSnapshot({ userAccount: params.userAccount }).userAccount
    }

    if (params.phone !== undefined) {
      payload.phone = toUserUniqueSnapshot({ phone: params.phone }).phone
    }

    if (params.mail !== undefined) {
      payload.mail = toUserUniqueSnapshot({ mail: params.mail }).mail
    }

    const response = await userApi.checkUnique(payload)
    return assertUniqueCheck(response, '字段唯一性校验失败')
  }

  async function uploadAvatar(file: File, userId: string): Promise<boolean> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)

    const response = await userApi.manageEditPhoto(formData)
    if (response.code !== 200) {
      throw new Error(response.message || '头像上传失败')
    }

    return true
  }

  return {
    loadOrgTree,
    loadPositionOptions,
    loadRoleOptions,
    checkFieldUnique,
    uploadAvatar
  }
}
