import { computed, type Ref } from 'vue';
import type { OrgContactUserNode } from '../types';
import { getUserDisplay } from './org-manager-dialog-helpers';
import type { SelectedUser } from './org-manager-dialog.types';

interface UseOrgManagerSelectionOptions {
  selectedUsers: Ref<SelectedUser[]>;
  syncCurrentNodeChecked: () => void;
}

export function useOrgManagerSelection(options: UseOrgManagerSelectionOptions) {
  const selectedUserIdSet = computed(
    () => new Set(options.selectedUsers.value.map((item) => item.userId))
  );

  function addSelectedUser(node: OrgContactUserNode) {
    const exists = options.selectedUsers.value.some((item) => item.userId === node.userId);
    if (exists) {
      return;
    }
    options.selectedUsers.value.push(getUserDisplay(node));
  }

  function removeSelectedUser(node: OrgContactUserNode) {
    options.selectedUsers.value = options.selectedUsers.value.filter(
      (item) => item.userId !== node.userId
    );
  }

  function toggleUser(node: OrgContactUserNode, checked: boolean) {
    if (checked) {
      addSelectedUser(node);
    } else {
      removeSelectedUser(node);
    }
    options.syncCurrentNodeChecked();
  }

  function removeSelectedById(userId: string) {
    options.selectedUsers.value = options.selectedUsers.value.filter(
      (item) => item.userId !== userId
    );
    options.syncCurrentNodeChecked();
  }

  function clearSelected() {
    options.selectedUsers.value = [];
    options.syncCurrentNodeChecked();
  }

  return {
    selectedUserIdSet,
    toggleUser,
    removeSelectedById,
    clearSelected
  };
}
