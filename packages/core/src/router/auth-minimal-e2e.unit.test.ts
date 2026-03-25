import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import type { RouteLocationNormalized, Router } from 'vue-router';

const mocks = vi.hoisted(() => {
  return {
    getCoreOptions: vi.fn(),
    useAuthStore: vi.fn(),
    useMenuStore: vi.fn(),
    useSystemStore: vi.fn()
  };
});

vi.mock('../context', () => ({
  getCoreOptions: mocks.getCoreOptions
}));

vi.mock('../stores/auth', () => ({
  useAuthStore: mocks.useAuthStore
}));

vi.mock('../stores/menu', () => ({
  useMenuStore: mocks.useMenuStore
}));

vi.mock('../stores/system', () => ({
  useSystemStore: mocks.useSystemStore
}));

import { setupRouterGuards } from './guards';

interface MockAuthStore {
  ensureAuthed: ReturnType<typeof vi.fn<() => Promise<boolean>>>;
}

interface MockMenuStore {
  remoteSynced: boolean;
  loaded: boolean;
  loadMenus: ReturnType<typeof vi.fn<() => Promise<void>>>;
  isAllowed: ReturnType<typeof vi.fn<(key: string) => boolean>>;
  resolveSystemByMenuKey: ReturnType<typeof vi.fn<(key: string) => string | null>>;
}

interface MockSystemStore {
  currentSystemCode: string;
  setCurrentSystem: ReturnType<typeof vi.fn<(code: string) => void>>;
}

function createRoute(partial: Partial<RouteLocationNormalized>): RouteLocationNormalized {
  return {
    path: '/',
    fullPath: '/',
    meta: {},
    name: undefined,
    query: {},
    ...partial
  } as RouteLocationNormalized;
}

function createGuardRunner() {
  let guard:
    | ((to: RouteLocationNormalized, from: RouteLocationNormalized) => Promise<unknown> | unknown)
    | undefined;

  const router = {
    beforeEach(
      handler: (
        to: RouteLocationNormalized,
        from: RouteLocationNormalized
      ) => Promise<unknown> | unknown
    ) {
      guard = handler;
    }
  } as unknown as Router;

  setupRouterGuards(router, {
    loginRoutePath: '/login'
  });

  if (!guard) {
    throw new Error('beforeEach 未注册');
  }

  return async (to: Partial<RouteLocationNormalized>) => {
    return guard!(createRoute(to), createRoute({}));
  };
}

describe('router/auth-minimal-e2e', () => {
  let authStore: MockAuthStore;
  let menuStore: MockMenuStore;
  let systemStore: MockSystemStore;

  beforeEach(() => {
    authStore = {
      ensureAuthed: vi.fn(async () => true)
    };

    menuStore = {
      remoteSynced: true,
      loaded: true,
      loadMenus: vi.fn(async () => {}),
      isAllowed: vi.fn(() => true),
      resolveSystemByMenuKey: vi.fn(() => null)
    };

    systemStore = {
      currentSystemCode: 'admin_server',
      setCurrentSystem: vi.fn()
    };

    mocks.getCoreOptions.mockReturnValue({
      sso: {
        enabled: true,
        routePath: '/sso'
      },
      menuMode: 'remote'
    });
    mocks.useAuthStore.mockReturnValue(authStore);
    mocks.useMenuStore.mockReturnValue(menuStore);
    mocks.useSystemStore.mockReturnValue(systemStore);
  });

  it('未登录访问受保护页应回跳登录页并携带 redirect', async () => {
    authStore.ensureAuthed.mockResolvedValue(false);
    const runGuard = createGuardRunner();

    await expect(
      runGuard({
        path: '/system/user',
        fullPath: '/system/user?tab=list'
      })
    ).resolves.toEqual({
      path: '/login',
      query: {
        redirect: '/system/user?tab=list'
      }
    });
  });

  it('已登录访问 /login 应回跳到站内地址', async () => {
    const runGuard = createGuardRunner();

    await expect(
      runGuard({
        path: '/login',
        fullPath: '/login?redirect=/system/user',
        query: {
          redirect: '/system/user'
        }
      })
    ).resolves.toEqual({
      path: '/system/user',
      query: {}
    });
  });
});
