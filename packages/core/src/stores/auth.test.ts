import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { createPinia, setActivePinia } from 'pinia';

import type { AppUser } from '../adapter/types';

const mocks = vi.hoisted(() => ({
  getCoreOptions: vi.fn(),
  tryGetCoreOptions: vi.fn()
}));

vi.mock('../context', () => ({
  getCoreOptions: mocks.getCoreOptions,
  tryGetCoreOptions: mocks.tryGetCoreOptions
}));

import { useAuthStore } from './auth';

function createUser(): AppUser {
  return {
    id: 'u-1',
    name: '测试用户'
  };
}

function createStorageMock() {
  const map = new Map<string, string>();

  return {
    clear: () => map.clear(),
    getItem: (key: string) => (map.has(key) ? map.get(key)! : null),
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, String(value));
    },
    get length() {
      return map.size;
    }
  } as Storage;
}

describe('core/stores/auth', () => {
  const authUserKey = 'unit-test:ob_auth_user';

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('localStorage', createStorageMock());
    vi.stubGlobal('sessionStorage', createStorageMock());

    mocks.getCoreOptions.mockReturnValue({
      storageNamespace: 'unit-test',
      auth: {
        mode: 'token',
        tokenKey: 'token'
      },
      adapter: {
        auth: {
          fetchMe: vi.fn(async () => createUser()),
          login: vi.fn(),
          logout: vi.fn()
        }
      }
    });
    mocks.tryGetCoreOptions.mockReturnValue({
      storageNamespace: 'unit-test'
    });
  });

  it('token 模式下缺少 token 时不应信任缓存用户', async () => {
    globalThis.localStorage.setItem(authUserKey, JSON.stringify(createUser()));

    const store = useAuthStore();

    await expect(store.ensureAuthed()).resolves.toBe(false);
    expect(store.user).toBeNull();
    expect(globalThis.localStorage.getItem(authUserKey)).toBeNull();
  });
});
