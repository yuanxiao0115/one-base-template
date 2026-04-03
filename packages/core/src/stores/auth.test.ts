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

  it('token 模式下缺少 token 时应首次探测服务端会话（无缓存用户）', async () => {
    const fetchMe = vi.fn(async () => createUser());
    mocks.getCoreOptions.mockReturnValue({
      storageNamespace: 'unit-test',
      auth: {
        mode: 'token',
        tokenKey: 'token'
      },
      adapter: {
        auth: {
          fetchMe,
          login: vi.fn(),
          logout: vi.fn()
        }
      }
    });

    const store = useAuthStore();

    await expect(store.ensureAuthed()).resolves.toBe(true);
    expect(fetchMe).toHaveBeenCalledTimes(1);
    expect(store.user?.id).toBe('u-1');
  });

  it('token 模式下缺少 token 时应首次探测服务端会话（有缓存用户）', async () => {
    globalThis.localStorage.setItem(authUserKey, JSON.stringify(createUser()));
    const fetchMe = vi.fn(async () => createUser());
    mocks.getCoreOptions.mockReturnValue({
      storageNamespace: 'unit-test',
      auth: {
        mode: 'token',
        tokenKey: 'token'
      },
      adapter: {
        auth: {
          fetchMe,
          login: vi.fn(),
          logout: vi.fn()
        }
      }
    });

    const store = useAuthStore();

    await expect(store.ensureAuthed()).resolves.toBe(true);
    expect(fetchMe).toHaveBeenCalledTimes(1);
    expect(store.user?.id).toBe('u-1');
  });

  it('token 模式下存在 token 且命中缓存用户时，首次守卫仍应强校验服务端会话', async () => {
    globalThis.localStorage.setItem(authUserKey, JSON.stringify(createUser()));
    globalThis.localStorage.setItem('token', 'mock-token');

    const fetchMe = vi.fn(async () => ({
      id: 'u-2',
      name: '切换后的用户'
    }));
    mocks.getCoreOptions.mockReturnValue({
      storageNamespace: 'unit-test',
      auth: {
        mode: 'token',
        tokenKey: 'token'
      },
      adapter: {
        auth: {
          fetchMe,
          login: vi.fn(),
          logout: vi.fn()
        }
      }
    });

    const store = useAuthStore();

    await expect(store.ensureAuthed()).resolves.toBe(true);
    expect(fetchMe).toHaveBeenCalledTimes(1);
    expect(store.user?.id).toBe('u-2');
  });

  it('token 模式下缺少 token 且服务端会话失效时应清空缓存并判定未登录（无缓存用户）', async () => {
    const fetchMe = vi.fn(async () => {
      throw new Error('session expired');
    });
    mocks.getCoreOptions.mockReturnValue({
      storageNamespace: 'unit-test',
      auth: {
        mode: 'token',
        tokenKey: 'token'
      },
      adapter: {
        auth: {
          fetchMe,
          login: vi.fn(),
          logout: vi.fn()
        }
      }
    });

    const store = useAuthStore();

    await expect(store.ensureAuthed()).resolves.toBe(false);
    expect(fetchMe).toHaveBeenCalledTimes(1);
    expect(store.user).toBeNull();
    expect(globalThis.localStorage.getItem(authUserKey)).toBeNull();
  });

  it('token 模式下缺少 token 且服务端会话失效时应清空缓存并判定未登录（有缓存用户）', async () => {
    globalThis.localStorage.setItem(authUserKey, JSON.stringify(createUser()));
    const fetchMe = vi.fn(async () => {
      throw new Error('session expired');
    });
    mocks.getCoreOptions.mockReturnValue({
      storageNamespace: 'unit-test',
      auth: {
        mode: 'token',
        tokenKey: 'token'
      },
      adapter: {
        auth: {
          fetchMe,
          login: vi.fn(),
          logout: vi.fn()
        }
      }
    });

    const store = useAuthStore();

    await expect(store.ensureAuthed()).resolves.toBe(false);
    expect(fetchMe).toHaveBeenCalledTimes(1);
    expect(store.user).toBeNull();
    expect(globalThis.localStorage.getItem(authUserKey)).toBeNull();
  });

  it('cookie 模式下首次守卫应校验服务端会话，失败时清空缓存用户', async () => {
    globalThis.localStorage.setItem(authUserKey, JSON.stringify(createUser()));

    const fetchMe = vi.fn(async () => {
      throw new Error('session expired');
    });
    mocks.getCoreOptions.mockReturnValue({
      storageNamespace: 'unit-test',
      auth: {
        mode: 'cookie',
        tokenKey: 'token'
      },
      adapter: {
        auth: {
          fetchMe,
          login: vi.fn(),
          logout: vi.fn()
        }
      }
    });

    const store = useAuthStore();

    await expect(store.ensureAuthed()).resolves.toBe(false);
    expect(fetchMe).toHaveBeenCalledTimes(1);
    expect(store.user).toBeNull();
    expect(globalThis.localStorage.getItem(authUserKey)).toBeNull();
  });

  it('cookie 模式可关闭严格会话校验以兼容缓存快速恢复', async () => {
    globalThis.localStorage.setItem(authUserKey, JSON.stringify(createUser()));

    const fetchMe = vi.fn(async () => createUser());
    mocks.getCoreOptions.mockReturnValue({
      storageNamespace: 'unit-test',
      auth: {
        mode: 'cookie',
        tokenKey: 'token',
        strictCookieSession: false
      },
      adapter: {
        auth: {
          fetchMe,
          login: vi.fn(),
          logout: vi.fn()
        }
      }
    });

    const store = useAuthStore();

    await expect(store.ensureAuthed()).resolves.toBe(true);
    expect(fetchMe).not.toHaveBeenCalled();
    expect(store.user?.id).toBe('u-1');
  });
});
