import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import type { RouteLocationNormalized, Router } from 'vue-router';
import type { RouterGuardOptions } from './guards';

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
  hasTokenSession: ReturnType<typeof vi.fn<() => boolean>>;
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
    ...partial
  } as RouteLocationNormalized;
}

function createGuardRunner(options?: RouterGuardOptions) {
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

  setupRouterGuards(router, options);

  if (!guard) {
    throw new Error('beforeEach 未注册');
  }

  return async (
    to: Partial<RouteLocationNormalized>,
    from: Partial<RouteLocationNormalized> = {}
  ) => {
    return guard!(createRoute(to), createRoute(from));
  };
}

describe('setupRouterGuards', () => {
  let authStore: MockAuthStore;
  let menuStore: MockMenuStore;
  let systemStore: MockSystemStore;

  beforeEach(() => {
    authStore = {
      ensureAuthed: vi.fn(async () => true),
      hasTokenSession: vi.fn(() => true)
    };

    menuStore = {
      remoteSynced: true,
      loaded: true,
      loadMenus: vi.fn(async () => {}),
      isAllowed: vi.fn(() => false),
      resolveSystemByMenuKey: vi.fn(() => null)
    };

    systemStore = {
      currentSystemCode: 'system-a',
      setCurrentSystem: vi.fn()
    };

    mocks.getCoreOptions.mockReturnValue({
      auth: {
        mode: 'token',
        tokenKey: 'token'
      },
      sso: {
        enabled: false,
        routePath: '/sso'
      },
      menuMode: 'static'
    });
    mocks.useAuthStore.mockReturnValue(authStore);
    mocks.useMenuStore.mockReturnValue(menuStore);
    mocks.useSystemStore.mockReturnValue(systemStore);
  });

  it('public/sso 路由应放行', async () => {
    const runGuard = createGuardRunner();

    mocks.getCoreOptions.mockReturnValue({
      sso: {
        enabled: true,
        routePath: '/sso'
      },
      menuMode: 'static'
    });
    await expect(runGuard({ path: '/sso', fullPath: '/sso' })).resolves.toBe(true);

    await expect(
      runGuard({ path: '/public-page', fullPath: '/public-page', meta: { public: true } })
    ).resolves.toBe(true);
  });

  it('已登录访问 /login 时应跳转到安全站内地址', async () => {
    const runGuard = createGuardRunner({
      loginRoutePath: '/login'
    });

    await expect(
      runGuard({
        path: '/login',
        fullPath: '/login?redirect=/system/user',
        query: { redirect: '/system/user' }
      })
    ).resolves.toEqual({
      path: '/system/user',
      query: {}
    });

    await expect(
      runGuard({
        path: '/login',
        fullPath: '/login?redirect=//evil.example',
        query: { redirect: '//evil.example' }
      })
    ).resolves.toEqual({
      path: '/',
      query: {}
    });
  });

  it('未登录访问 /login 时应允许进入登录页', async () => {
    authStore.ensureAuthed.mockResolvedValue(false);
    const runGuard = createGuardRunner({
      loginRoutePath: '/login'
    });

    await expect(
      runGuard({
        path: '/login',
        fullPath: '/login'
      })
    ).resolves.toBe(true);
  });

  it('token 模式下无 token 访问 /login 时应直接进入登录页且不触发登录态校验', async () => {
    authStore.hasTokenSession.mockReturnValue(false);
    const runGuard = createGuardRunner({
      loginRoutePath: '/login'
    });

    await expect(
      runGuard({
        path: '/login',
        fullPath: '/login'
      })
    ).resolves.toBe(true);
    expect(authStore.ensureAuthed).not.toHaveBeenCalled();
  });

  it('已登录访问 /login 时应支持自定义回跳解析器', async () => {
    const resolveAuthedLoginRedirect = vi.fn(() => '/system/custom-home');
    const runGuard = createGuardRunner({
      loginRoutePath: '/login',
      resolveAuthedLoginRedirect
    });

    await expect(
      runGuard({
        path: '/login',
        fullPath: '/login?redirect=/admin/system/user',
        query: { redirect: '/admin/system/user' }
      })
    ).resolves.toEqual({
      path: '/system/custom-home',
      query: {}
    });

    expect(resolveAuthedLoginRedirect).toHaveBeenCalledTimes(1);
  });

  it('未登录应跳转登录页', async () => {
    authStore.ensureAuthed.mockResolvedValue(false);
    const runGuard = createGuardRunner({
      loginRoutePath: '/login'
    });

    const result = await runGuard({
      path: '/system/user',
      fullPath: '/system/user?tab=list'
    });

    expect(result).toEqual({
      path: '/login',
      query: { redirect: '/system/user?tab=list' }
    });
  });

  it('菜单已允许时应直接通过', async () => {
    menuStore.loaded = true;
    menuStore.isAllowed.mockReturnValue(true);
    const runGuard = createGuardRunner();

    await expect(
      runGuard({
        path: '/system/user',
        fullPath: '/system/user'
      })
    ).resolves.toBe(true);
  });

  it('skipMenuAuth 严格白名单命中时应放行', async () => {
    menuStore.loaded = true;
    menuStore.isAllowed.mockReturnValue(false);
    const runGuard = createGuardRunner({
      allowedSkipMenuAuthRouteNames: ['MaintainToolPage']
    });

    await expect(
      runGuard({
        path: '/maintain/tool',
        fullPath: '/maintain/tool',
        name: 'MaintainToolPage',
        meta: { skipMenuAuth: true }
      })
    ).resolves.toBe(true);
  });

  it('严格模式下 skipMenuAuth 未命中白名单应拦截到 403', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    menuStore.loaded = true;
    menuStore.isAllowed.mockReturnValue(false);
    const runGuard = createGuardRunner({
      forbiddenRoutePath: '/403',
      allowedSkipMenuAuthRouteNames: ['MaintainToolPage']
    });

    const result = await runGuard({
      path: '/maintain/other',
      fullPath: '/maintain/other?id=1',
      name: 'OtherMaintainPage',
      meta: { skipMenuAuth: true }
    });

    expect(result).toEqual({
      path: '/403',
      query: { from: '/maintain/other?id=1' }
    });

    warnSpy.mockRestore();
  });

  it('remote 模式下 remoteSynced=false 且 loaded=true 时应后台触发一次 loadMenus 且按 isAllowed 继续判定', async () => {
    let resolveLoadMenus!: () => void;
    const loadMenusDeferred = new Promise<void>((resolve) => {
      resolveLoadMenus = () => resolve();
    });

    mocks.getCoreOptions.mockReturnValue({
      sso: {
        enabled: false,
        routePath: '/sso'
      },
      menuMode: 'remote'
    });
    menuStore.remoteSynced = false;
    menuStore.loaded = true;
    menuStore.loadMenus.mockReturnValue(loadMenusDeferred);
    menuStore.isAllowed.mockReturnValue(true);

    const runGuard = createGuardRunner();

    await expect(
      runGuard({
        path: '/system/remote-cache-hit',
        fullPath: '/system/remote-cache-hit'
      })
    ).resolves.toBe(true);

    expect(menuStore.loadMenus).toHaveBeenCalledTimes(1);
    expect(menuStore.isAllowed).toHaveBeenCalledTimes(1);

    resolveLoadMenus();
    await loadMenusDeferred;
  });

  it('remote 模式下后台同步失败后不应在每次路由重复触发 loadMenus', async () => {
    mocks.getCoreOptions.mockReturnValue({
      sso: {
        enabled: false,
        routePath: '/sso'
      },
      menuMode: 'remote'
    });
    menuStore.remoteSynced = false;
    menuStore.loaded = true;
    menuStore.loadMenus.mockRejectedValue(new Error('sync failed'));
    menuStore.isAllowed.mockReturnValue(true);

    const runGuard = createGuardRunner();

    await expect(
      runGuard({
        path: '/system/remote-first',
        fullPath: '/system/remote-first'
      })
    ).resolves.toBe(true);

    await expect(
      runGuard({
        path: '/system/remote-second',
        fullPath: '/system/remote-second'
      })
    ).resolves.toBe(true);

    expect(menuStore.loadMenus).toHaveBeenCalledTimes(1);
  });

  it('remote 模式下 remoteSynced=false 且 loaded=false 时应先 loadMenus 再继续权限判定', async () => {
    const events: string[] = [];

    mocks.getCoreOptions.mockReturnValue({
      sso: {
        enabled: false,
        routePath: '/sso'
      },
      menuMode: 'remote'
    });
    menuStore.remoteSynced = false;
    menuStore.loaded = false;
    menuStore.loadMenus.mockImplementation(async () => {
      events.push('loadMenus');
      menuStore.loaded = true;
    });
    menuStore.isAllowed.mockImplementation(() => {
      events.push('isAllowed');
      return true;
    });

    const runGuard = createGuardRunner();

    await expect(
      runGuard({
        path: '/system/remote-first-load',
        fullPath: '/system/remote-first-load'
      })
    ).resolves.toBe(true);

    expect(menuStore.loadMenus).toHaveBeenCalledTimes(1);
    expect(events).toEqual(['loadMenus', 'isAllowed']);
  });
});
