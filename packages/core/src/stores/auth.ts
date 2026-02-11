import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AppUser, LoginPayload } from '../adapter/types';
import { getCoreOptions } from '../context';

const AUTH_USER_STORAGE_KEY = 'ob_auth_user';

function readStoredUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppUser;
  } catch {
    // localStorage 不可用或 JSON 解析失败时，直接清理缓存，避免后续反复报错
    try {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    } catch {
      // ignore
    }
    return null;
  }
}

function writeStoredUser(user: AppUser) {
  try {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

function clearStoredUser() {
  try {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const useAuthStore = defineStore('ob-auth', () => {
  const user = ref<AppUser | null>(null);
  const initialized = ref(false);

  // 参考老项目：把用户信息持久化到 localStorage，刷新后可快速恢复 UI 状态
  const stored = readStoredUser();
  if (stored) {
    user.value = stored;
  }

  const isAuthed = computed(() => !!user.value);

  async function fetchMe() {
    const { adapter } = getCoreOptions();
    const me = await adapter.auth.fetchMe();
    user.value = me;
    initialized.value = true;
    writeStoredUser(me);
    return me;
  }

  async function ensureAuthed(): Promise<boolean> {
    if (user.value) return true;
    try {
      await fetchMe();
      return true;
    } catch {
      clearStoredUser();
      initialized.value = true;
      return false;
    }
  }

  async function login(payload: LoginPayload) {
    const { adapter } = getCoreOptions();
    await adapter.auth.login(payload);
    await fetchMe();
  }

  async function logout() {
    const { adapter } = getCoreOptions();
    try {
      await adapter.auth.logout();
    } finally {
      user.value = null;
      initialized.value = true;
      clearStoredUser();
    }
  }

  function reset() {
    user.value = null;
    initialized.value = false;
    clearStoredUser();
  }

  return {
    user,
    initialized,
    isAuthed,
    fetchMe,
    ensureAuthed,
    login,
    logout,
    reset
  };
});
