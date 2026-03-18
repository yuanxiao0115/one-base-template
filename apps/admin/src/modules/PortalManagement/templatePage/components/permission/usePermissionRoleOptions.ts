import { ref } from 'vue';
import type { Ref } from 'vue';

import {
  loadPermissionRoleOptions,
  type PermissionRoleSourceApi,
  type RoleOption
} from './permission-role-source';

interface SharedRoleOptionsState {
  loaded: boolean;
  roleOptions: RoleOption[];
  loadingPromise: Promise<RoleOption[]> | null;
}

const sharedRoleOptionsByApi = new WeakMap<PermissionRoleSourceApi, SharedRoleOptionsState>();

function resolveSharedRoleOptionsState(api: PermissionRoleSourceApi): SharedRoleOptionsState {
  const cached = sharedRoleOptionsByApi.get(api);
  if (cached) {
    return cached;
  }
  const created: SharedRoleOptionsState = {
    loaded: false,
    roleOptions: [],
    loadingPromise: null
  };
  sharedRoleOptionsByApi.set(api, created);
  return created;
}

export interface PermissionRoleOptionsState {
  roleOptions: Ref<RoleOption[]>;
  roleLoading: Ref<boolean>;
  ensureRoleOptions: () => Promise<void>;
}

export function usePermissionRoleOptions(api: PermissionRoleSourceApi): PermissionRoleOptionsState {
  const roleOptions = ref<RoleOption[]>([]);
  const roleLoading = ref(false);

  async function ensureRoleOptions() {
    if (roleOptions.value.length > 0) {
      return;
    }

    const sharedState = resolveSharedRoleOptionsState(api);
    if (sharedState.loaded) {
      roleOptions.value = [...sharedState.roleOptions];
      return;
    }

    roleLoading.value = true;
    try {
      if (!sharedState.loadingPromise) {
        sharedState.loadingPromise = loadPermissionRoleOptions(api)
          .then((loadedOptions) => {
            sharedState.roleOptions = loadedOptions;
            sharedState.loaded = true;
            return loadedOptions;
          })
          .finally(() => {
            sharedState.loadingPromise = null;
          });
      }
      roleOptions.value = await sharedState.loadingPromise;
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
