import { ref } from 'vue';
import type { Ref } from 'vue';

import {
  loadPermissionRoleOptions,
  type PermissionRoleSourceApi,
  type RoleOption
} from './permission-role-source';

export interface PermissionRoleOptionsState {
  roleOptions: Ref<RoleOption[]>;
  roleLoading: Ref<boolean>;
  ensureRoleOptions: () => Promise<void>;
}

export function usePermissionRoleOptions(api: PermissionRoleSourceApi): PermissionRoleOptionsState {
  const roleOptions = ref<RoleOption[]>([]);
  const roleLoading = ref(false);

  async function ensureRoleOptions() {
    if (roleOptions.value.length > 0 || roleLoading.value) {
      return;
    }

    roleLoading.value = true;
    try {
      roleOptions.value = await loadPermissionRoleOptions(api);
    } finally {
      roleLoading.value = false;
    }
  }

  return {
    roleOptions,
    roleLoading,
    ensureRoleOptions
  };
}
