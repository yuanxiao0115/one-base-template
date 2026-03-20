import { reactive, ref, type Ref } from 'vue';
import type { CrudFormLike } from '@one-base-template/ui';
import { message } from '@one-base-template/ui';
import {
  fetchPersonnelTreeByLegacyApi,
  searchPersonnelUsersByStructure
} from '@/components/PersonnelSelector/contactDataSource';
import type {
  PersonnelFetchNodes,
  PersonnelSearchNodes,
  PersonnelSelectedUser
} from '@/components/PersonnelSelector/types';
import { roleAssignApi } from '../api';
import type { RoleMemberRecord, RoleOption } from '../types';
import {
  canTriggerKeywordSearch,
  DEFAULT_MIN_KEYWORD_LENGTH,
  normalizeKeyword
} from '../../shared/keywordSearch';

interface RoleAssignMemberForm {
  userIds: string[];
}

interface UseRoleAssignMemberDialogOptions {
  currentRole: Ref<RoleOption | null>;
  memberFormRef: Ref<CrudFormLike | undefined>;
  rootParentId: Ref<string>;
  onSaved: () => Promise<void>;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function toRoleAssignSelectedUsers(records: RoleMemberRecord[]): PersonnelSelectedUser[] {
  return records.map((item) => {
    const nickName = item.nickName || item.userAccount || item.id;
    const userAccount = item.userAccount || item.id;

    return {
      id: item.id,
      nodeType: 'user',
      title: nickName,
      subTitle: userAccount || '--',
      nickName,
      userAccount,
      phone: ''
    };
  });
}

export function useRoleAssignMemberDialog(options: UseRoleAssignMemberDialogOptions) {
  const { currentRole, memberFormRef, rootParentId, onSaved } = options;

  const memberDialogVisible = ref(false);
  const memberDialogLoading = ref(false);
  const memberDialogSubmitting = ref(false);
  const originalMembers = ref<RoleMemberRecord[]>([]);
  const memberDialogSelectedUsers = ref<PersonnelSelectedUser[]>([]);
  const memberForm = reactive<RoleAssignMemberForm>({
    userIds: []
  });
  let memberDialogRequestToken = 0;

  function resetMemberForm() {
    memberForm.userIds = [];
    originalMembers.value = [];
    memberDialogSelectedUsers.value = [];
  }

  const fetchNodes: PersonnelFetchNodes = async ({ parentId }) => {
    const normalizedParentId = parentId?.trim() ? parentId : rootParentId.value;
    const response = await fetchPersonnelTreeByLegacyApi({
      parentId: normalizedParentId
    });
    if (response.code !== 200) {
      throw new Error(response.message || '加载组织通讯录失败');
    }

    return Array.isArray(response.data) ? response.data : [];
  };

  const searchNodes: PersonnelSearchNodes = async ({ keyword }) => {
    const normalizedKeyword = normalizeKeyword(keyword);
    if (!canTriggerKeywordSearch(normalizedKeyword, DEFAULT_MIN_KEYWORD_LENGTH)) {
      return [];
    }

    const response = await searchPersonnelUsersByStructure({
      search: normalizedKeyword
    });
    if (response.code !== 200) {
      throw new Error(response.message || '搜索人员失败');
    }

    return Array.isArray(response.data) ? response.data : [];
  };

  async function openAddMembersDialog() {
    const role = currentRole.value;
    if (!role?.id) {
      message.warning('请先选择角色');
      return;
    }

    const requestToken = ++memberDialogRequestToken;
    memberDialogVisible.value = true;
    memberDialogLoading.value = true;
    resetMemberForm();

    try {
      const response = await roleAssignApi.listMembers({ roleId: role.id });
      if (
        requestToken !== memberDialogRequestToken ||
        !memberDialogVisible.value ||
        currentRole.value?.id !== role.id
      ) {
        return;
      }
      if (response.code !== 200) {
        throw new Error(response.message || '加载角色成员失败');
      }

      const rows = Array.isArray(response.data) ? response.data : [];
      originalMembers.value = rows;
      memberDialogSelectedUsers.value = toRoleAssignSelectedUsers(rows);
      memberForm.userIds = memberDialogSelectedUsers.value.map((item) => item.id).filter(Boolean);
    } catch (error) {
      if (requestToken !== memberDialogRequestToken) {
        return;
      }
      message.error(getErrorMessage(error, '加载角色成员失败'));
    } finally {
      if (requestToken === memberDialogRequestToken) {
        memberDialogLoading.value = false;
      }
    }
  }

  function closeAddMembersDialog() {
    memberDialogRequestToken += 1;
    resetMemberForm();
    memberDialogLoading.value = false;
    memberDialogVisible.value = false;
  }

  async function submitAddMembersDialog() {
    if (memberDialogSubmitting.value) {
      return;
    }

    const role = currentRole.value;
    if (!role?.id) {
      message.warning('请先选择角色');
      return;
    }

    const isValid = await memberFormRef.value?.validate?.();
    if (isValid === false) {
      return;
    }

    memberDialogSubmitting.value = true;
    try {
      const selectedIds = Array.from(new Set(memberForm.userIds.filter(Boolean)));
      const originalIds = Array.from(
        new Set(originalMembers.value.map((item) => item.id).filter(Boolean))
      );

      const originalSet = new Set(originalIds);
      const selectedSet = new Set(selectedIds);

      const addIds = selectedIds.filter((id) => !originalSet.has(id));
      const removeIds = originalIds.filter((id) => !selectedSet.has(id));

      if (addIds.length === 0 && removeIds.length === 0) {
        message.info('角色成员未发生变化');
        closeAddMembersDialog();
        return;
      }

      if (removeIds.length > 0) {
        const removeResponse = await roleAssignApi.removeMembers({
          roleId: role.id,
          userIdList: removeIds
        });
        if (removeResponse.code !== 200) {
          throw new Error(removeResponse.message || '移除角色成员失败');
        }
      }

      if (addIds.length > 0) {
        const addResponse = await roleAssignApi.addMembers({
          roleId: role.id,
          userIdList: addIds
        });
        if (addResponse.code !== 200) {
          throw new Error(addResponse.message || '添加角色成员失败');
        }
      }

      message.success('角色成员保存成功');
      closeAddMembersDialog();
      await onSaved();
    } catch (error) {
      message.error(getErrorMessage(error, '角色成员保存失败'));
    } finally {
      memberDialogSubmitting.value = false;
    }
  }

  return {
    dialogs: {
      memberDialogVisible,
      memberDialogLoading,
      memberDialogSubmitting,
      memberDialogSelectedUsers,
      memberForm
    },
    actions: {
      fetchNodes,
      searchNodes,
      openAddMembersDialog,
      closeAddMembersDialog,
      submitAddMembersDialog
    }
  };
}
