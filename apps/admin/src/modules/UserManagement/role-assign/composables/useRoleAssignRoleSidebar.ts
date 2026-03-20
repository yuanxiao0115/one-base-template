import { ref } from 'vue';
import { message } from '@one-base-template/ui';
import { roleAssignApi } from '../api';
import type { RoleOption } from '../types';

interface UseRoleAssignRoleSidebarOptions {
  onRoleActivated: (params: { role: RoleOption; roleChanged: boolean }) => Promise<void>;
  onRolesEmpty: () => void;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useRoleAssignRoleSidebar(options: UseRoleAssignRoleSidebarOptions) {
  const roleLoading = ref(false);
  const roleKeyword = ref('');
  const roleList = ref<RoleOption[]>([]);
  const currentRole = ref<RoleOption | null>(null);

  async function selectRole(role: RoleOption) {
    if (!role.id) {
      return;
    }

    const roleChanged = currentRole.value?.id !== role.id;
    currentRole.value = role;
    await options.onRoleActivated({
      role,
      roleChanged
    });
  }

  async function loadRoleList(loadOptions?: { keepCurrent?: boolean }) {
    const keepCurrent = loadOptions?.keepCurrent !== false;
    roleLoading.value = true;

    try {
      const response = await roleAssignApi.listRoles({
        roleName: roleKeyword.value
      });
      if (response.code !== 200) {
        throw new Error(response.message || '加载角色列表失败');
      }

      const rows = Array.isArray(response.data) ? response.data : [];
      roleList.value = rows;

      if (rows.length === 0) {
        currentRole.value = null;
        options.onRolesEmpty();
        return;
      }

      const currentRoleId = keepCurrent ? currentRole.value?.id : '';
      const nextRole = (currentRoleId && rows.find((item) => item.id === currentRoleId)) || rows[0];
      if (!nextRole) {
        return;
      }

      await selectRole(nextRole);
    } catch (error) {
      message.error(getErrorMessage(error, '加载角色列表失败'));
    } finally {
      roleLoading.value = false;
    }
  }

  function onRoleKeywordUpdate(value: string) {
    roleKeyword.value = value.trim();
  }

  function onRoleKeywordSearch() {
    void loadRoleList();
  }

  function onRoleKeywordClear() {
    roleKeyword.value = '';
    void loadRoleList();
  }

  return {
    roles: {
      roleLoading,
      roleKeyword,
      roleList,
      currentRole
    },
    actions: {
      selectRole,
      loadRoleList,
      onRoleKeywordUpdate,
      onRoleKeywordSearch,
      onRoleKeywordClear
    }
  };
}
