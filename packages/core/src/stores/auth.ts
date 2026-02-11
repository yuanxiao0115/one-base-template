import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AppUser } from '../adapter/types';
import { getCoreOptions } from '../context';

export const useAuthStore = defineStore('sb-auth', () => {
  const user = ref<AppUser | null>(null);
  const initialized = ref(false);

  const isAuthed = computed(() => !!user.value);

  async function fetchMe() {
    const { adapter } = getCoreOptions();
    const me = await adapter.auth.fetchMe();
    user.value = me;
    initialized.value = true;
    return me;
  }

  async function ensureAuthed(): Promise<boolean> {
    if (user.value) return true;
    try {
      await fetchMe();
      return true;
    } catch {
      initialized.value = true;
      return false;
    }
  }

  async function login(payload: { username: string; password: string }) {
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
    }
  }

  function reset() {
    user.value = null;
    initialized.value = false;
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
