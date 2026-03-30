import { computed, onMounted, ref } from 'vue';
import type { CrudFormLike } from '@one-base-template/ui';
import { useAuthStore } from '@one-base-template/core';
import { resolvePersonnelRootParentId } from '@/components/PersonnelSelector/contactDataSource';
import { useRoleAssignMemberDialog } from './useRoleAssignMemberDialog';
import { useRoleAssignMemberTable } from './useRoleAssignMemberTable';
import { useRoleAssignRoleSidebar } from './useRoleAssignRoleSidebar';

type MemberSelectFormExpose = CrudFormLike;

export function useRoleAssignPageState() {
  const authStore = useAuthStore();

  const tableRef = ref<unknown>(null);
  const memberFormRef = ref<MemberSelectFormExpose>();
  const rootParentId = computed(() => resolvePersonnelRootParentId(authStore.user));

  const roleSidebar = useRoleAssignRoleSidebar({
    onRoleActivated: async ({ roleChanged }) => {
      await memberTable.actions.applyRoleChange(roleChanged);
    },
    onRolesEmpty: () => {
      memberTable.actions.clearForNoRole();
    }
  });

  const memberTable = useRoleAssignMemberTable({
    currentRole: roleSidebar.roles.currentRole,
    tableRef,
    onRemoved: async () => {
      await roleSidebar.actions.loadRoleList();
    }
  });

  const memberDialog = useRoleAssignMemberDialog({
    currentRole: roleSidebar.roles.currentRole,
    memberFormRef,
    rootParentId,
    onSaved: async () => {
      memberTable.actions.clearSelection();
      await roleSidebar.actions.loadRoleList();
    }
  });

  onMounted(() => {
    void roleSidebar.actions.loadRoleList({ keepCurrent: false });
  });

  return {
    refs: {
      tableRef,
      memberFormRef
    },
    table: memberTable.table,
    roles: roleSidebar.roles,
    dialogs: memberDialog.dialogs,
    actions: {
      ...roleSidebar.actions,
      ...memberTable.actions,
      ...memberDialog.actions
    }
  };
}
