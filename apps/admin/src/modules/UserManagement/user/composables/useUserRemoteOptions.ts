import type { Ref } from 'vue';
import { userApi } from '../api';
import type { OrgTreeNode, PositionItem, RoleItem } from '../types';
import { assertUniqueCheck, toUserUniqueSnapshot } from '../../shared/unique';
import { createCachedAsyncLoader } from '../../shared/cachedAsyncLoader';

interface UseUserRemoteOptionsParams {
  orgTreeData: Ref<OrgTreeNode[]>;
  positionOptions: Ref<PositionItem[]>;
  roleOptions: Ref<RoleItem[]>;
}

const REMOTE_OPTIONS_CACHE_TTL_MS = 5 * 60 * 1000;

function getSortedOrgTree(nodes: OrgTreeNode[]): OrgTreeNode[] {
  return [...nodes]
    .sort((a, b) => a.sort - b.sort)
    .map((item) => ({
      ...item,
      children: Array.isArray(item.children) ? getSortedOrgTree(item.children) : []
    }));
}

export function useUserRemoteOptions(params: UseUserRemoteOptionsParams) {
  const { orgTreeData, positionOptions, roleOptions } = params;

  const orgTreeLoader = createCachedAsyncLoader<OrgTreeNode[]>(
    async () => {
      const response = await userApi.listOrgs();
      if (response.code !== 200) {
        throw new Error(response.message || '加载组织树失败');
      }

      return getSortedOrgTree(Array.isArray(response.data) ? response.data : []);
    },
    { ttlMs: REMOTE_OPTIONS_CACHE_TTL_MS }
  );

  const positionOptionsLoader = createCachedAsyncLoader<PositionItem[]>(
    async () => {
      const response = await userApi.listPositions();
      if (response.code !== 200) {
        throw new Error(response.message || '加载职位列表失败');
      }

      return Array.isArray(response.data) ? response.data : [];
    },
    { ttlMs: REMOTE_OPTIONS_CACHE_TTL_MS }
  );

  const roleOptionsLoader = createCachedAsyncLoader<RoleItem[]>(
    async () => {
      const response = await userApi.listRoles();
      if (response.code !== 200) {
        throw new Error(response.message || '加载角色列表失败');
      }

      return Array.isArray(response.data) ? response.data : [];
    },
    { ttlMs: REMOTE_OPTIONS_CACHE_TTL_MS }
  );

  async function loadOrgTree(forceRefresh = false) {
    orgTreeData.value = await orgTreeLoader.load({ force: forceRefresh });
  }

  async function loadPositionOptions(forceRefresh = false) {
    positionOptions.value = await positionOptionsLoader.load({ force: forceRefresh });
  }

  async function loadRoleOptions(forceRefresh = false) {
    roleOptions.value = await roleOptionsLoader.load({ force: forceRefresh });
  }

  async function checkFieldUnique(params: {
    userId?: string;
    userAccount?: string;
    phone?: string;
    mail?: string;
  }) {
    const payload: {
      userId?: string;
      userAccount?: string;
      phone?: string;
      mail?: string;
    } = {
      userId: params.userId
    };

    if (params.userAccount !== undefined) {
      payload.userAccount = toUserUniqueSnapshot({
        userAccount: params.userAccount
      }).userAccount;
    }

    if (params.phone !== undefined) {
      payload.phone = toUserUniqueSnapshot({ phone: params.phone }).phone;
    }

    if (params.mail !== undefined) {
      payload.mail = toUserUniqueSnapshot({ mail: params.mail }).mail;
    }

    const response = await userApi.checkUnique(payload);
    return assertUniqueCheck(response, '字段唯一性校验失败');
  }

  async function uploadAvatar(file: File, userId: string): Promise<boolean> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    const response = await userApi.manageEditPhoto(formData);
    if (response.code !== 200) {
      throw new Error(response.message || '头像上传失败');
    }

    return true;
  }

  return {
    loadOrgTree,
    loadPositionOptions,
    loadRoleOptions,
    checkFieldUnique,
    uploadAvatar
  };
}
