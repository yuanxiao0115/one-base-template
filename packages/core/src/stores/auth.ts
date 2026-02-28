import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AppUser, LoginPayload } from '../adapter/types';
import { getCoreOptions } from '../context';
import { removeByPrefixes, safeSetToStorage } from '../utils/storage';
import { getWithLegacy, clearByPrefixes, removeWithLegacy, getNamespacedKey } from '../storage/namespace';

const AUTH_USER_STORAGE_BASE_KEY = 'ob_auth_user';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function normalizeStringList(input: unknown): string[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const out = input.map(v => (typeof v === 'string' ? v.trim() : '')).filter(Boolean);
  return out.length ? out : undefined;
}

function normalizeUser(input: AppUser): AppUser {
  // 对齐老项目 store/modules/user.ts：缓存里同时保留新字段与兼容别名，避免迁移期页面读取断档。
  const id = isNonEmptyString(input.id) ? input.id.trim() : 'unknown';

  const nickName = isNonEmptyString(input.nickName) ? input.nickName.trim() : undefined;
  const name = isNonEmptyString(input.name) ? input.name.trim() : nickName || '未命名用户';

  const avatarUrl = isNonEmptyString(input.avatarUrl) ? input.avatarUrl.trim() : undefined;
  const avatar = isNonEmptyString(input.avatar) ? input.avatar.trim() : avatarUrl;

  const roles = normalizeStringList(input.roles ?? input.roleCodes);
  const permissions = normalizeStringList(input.permissions ?? input.permissionCodes);

  return {
    ...input,
    id,
    name,
    nickName: nickName || name,
    avatarUrl: avatarUrl || avatar,
    avatar: avatar || avatarUrl,
    roles,
    roleCodes: roles,
    permissions,
    permissionCodes: permissions
  };
}

function readStoredUser(): AppUser | null {
  const hit = getWithLegacy(AUTH_USER_STORAGE_BASE_KEY, ['local', 'session']);
  if (!hit?.value) return null;

  try {
    return normalizeUser(JSON.parse(hit.value) as AppUser);
  } catch {
    // localStorage 不可用或 JSON 解析失败时，直接清理缓存，避免后续反复报错
    removeWithLegacy(AUTH_USER_STORAGE_BASE_KEY, ['local', 'session']);
    return null;
  }
}

function writeStoredUser(user: AppUser) {
  const key = getNamespacedKey(AUTH_USER_STORAGE_BASE_KEY);
  safeSetToStorage(key, JSON.stringify(user), {
    primary: 'local',
    fallback: 'session',
    onPrimaryQuotaExceeded: () => {
      // 用户态优先级高于菜单缓存，localStorage 满额时先清菜单分片缓存腾挪空间。
      clearByPrefixes(['ob_menu_tree:', 'ob_menu_tree', 'ob_menu_path_index'], 'local');
    }
  });

  // 向命名空间迁移时清理旧 key，避免读优先级导致状态抖动。
  if (key !== AUTH_USER_STORAGE_BASE_KEY) {
    removeByPrefixes([AUTH_USER_STORAGE_BASE_KEY], 'local');
    removeByPrefixes([AUTH_USER_STORAGE_BASE_KEY], 'session');
  }
}

function clearStoredUser() {
  removeWithLegacy(AUTH_USER_STORAGE_BASE_KEY, ['local', 'session']);
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
    const me = normalizeUser(await adapter.auth.fetchMe());
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
