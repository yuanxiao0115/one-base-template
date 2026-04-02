import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const mocks = vi.hoisted(() => {
  const app = {
    use: vi.fn()
  };
  const router = {
    beforeEach: vi.fn()
  };

  return {
    app,
    router,
    appUseRouter: vi.fn(),
    registerMessageUtils: vi.fn(),
    createPinia: vi.fn(() => ({ __pinia: true })),
    setActivePinia: vi.fn(),
    createRouter: vi.fn(() => router),
    createWebHistory: vi.fn(() => ({ __history: true })),
    setObHttpClient: vi.fn(),
    setupRouterGuards: vi.fn(),
    resolveAuthRedirectTargetFromQuery: vi.fn(() => '/'),
    installRouteDynamicImportRecovery: vi.fn(),
    buildAppRoutes: vi.fn(async () => ({
      routes: [{ path: '/' }],
      diagnostics: {
        routeCount: 1,
        signature: 'route-signature'
      }
    })),
    getAppEnv: vi.fn(() => ({
      baseUrl: '/',
      menuMode: 'remote',
      enabledModules: ['home'],
      defaultSystemCode: 'admin_server',
      systemHomeMap: {
        admin_server: '/home/index'
      },
      storageNamespace: 'one-base-template-zfw-system-sfss',
      backend: 'basic',
      isProd: false,
      apiBaseUrl: undefined,
      authMode: 'token',
      tokenKey: 'token',
      idTokenKey: 'idToken',
      basicHeaders: undefined,
      clientSignatureSalt: undefined,
      clientSignatureClientId: undefined,
      basicSystemPermissionCode: 'admin_server'
    })),
    createAppHttp: vi.fn(() => ({ cancelRouteRequests: vi.fn() })),
    createAppAdapter: vi.fn(() => ({ __adapter: true })),
    installCore: vi.fn(),
    installAppShellPlugins: vi.fn(),
    createStartupProfiler: vi.fn(() => ({
      runStage: async (_name: string, task: () => unknown) => await task(),
      complete: vi.fn(),
      fail: vi.fn()
    }))
  };
});

vi.mock('vue', () => ({
  createApp: vi.fn(() => mocks.app)
}));

vi.mock('pinia', () => ({
  createPinia: mocks.createPinia,
  setActivePinia: mocks.setActivePinia
}));

vi.mock('vue-router', () => ({
  createRouter: mocks.createRouter,
  createWebHistory: mocks.createWebHistory
}));

vi.mock('@one-base-template/core', () => ({
  installRouteDynamicImportRecovery: mocks.installRouteDynamicImportRecovery,
  resolveAuthRedirectTargetFromQuery: mocks.resolveAuthRedirectTargetFromQuery,
  setObHttpClient: mocks.setObHttpClient,
  setupRouterGuards: mocks.setupRouterGuards
}));

vi.mock('@one-base-template/ui', () => ({
  registerMessageUtils: mocks.registerMessageUtils
}));

vi.mock('@/App.vue', () => ({
  default: {}
}));

vi.mock('@/router/assemble-routes', () => ({
  buildAppRoutes: mocks.buildAppRoutes
}));

vi.mock('@/config/env', () => ({
  getAppEnv: mocks.getAppEnv
}));

vi.mock('@/config', () => ({
  appAuthSsoApiConfig: {
    ticketSsoEndpoint: '/cmict/auth/ticket/sso'
  },
  appLayoutMode: 'side',
  appSidebarCollapsedWidth: 64,
  appSidebarWidth: 220,
  appSystemSwitchStyle: 'tabs',
  appTopbarHeight: 56
}));

vi.mock('@/router/constants', () => ({
  routePaths: {
    root: '/',
    login: '/login',
    forbidden: '/403'
  }
}));

vi.mock('@/router/public-routes', () => ({
  guardOpenRoutePaths: ['/login', '/sso']
}));

vi.mock('@/bootstrap/http', () => ({
  createAppHttp: mocks.createAppHttp
}));

vi.mock('@/bootstrap/adapter', () => ({
  createAppAdapter: mocks.createAppAdapter
}));

vi.mock('@/bootstrap/core', () => ({
  installCore: mocks.installCore
}));

vi.mock('@/bootstrap/plugins', () => ({
  installAppShellPlugins: mocks.installAppShellPlugins
}));

vi.mock('@/bootstrap/startup-profiler', () => ({
  createStartupProfiler: mocks.createStartupProfiler
}));

import { bootstrapZfwSystemSfssApp } from '@/bootstrap/index';

describe('bootstrap/index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.app.use.mockImplementation((plugin: unknown) => {
      if (plugin === mocks.router) {
        mocks.appUseRouter();
      }
      return mocks.app;
    });
  });

  it('应先注册路由守卫，再安装 router 以拦住首屏导航', async () => {
    await bootstrapZfwSystemSfssApp();

    expect(mocks.setupRouterGuards).toHaveBeenCalledTimes(1);
    expect(mocks.appUseRouter).toHaveBeenCalledTimes(1);
    expect(mocks.setupRouterGuards.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.appUseRouter.mock.invocationCallOrder[0]
    );
  });

  it('应为已登录访问 /login 注入可扩展的回跳解析器', async () => {
    await bootstrapZfwSystemSfssApp();

    const guardOptions = mocks.setupRouterGuards.mock.calls[0]?.[1] as
      | { resolveAuthedLoginRedirect?: (ctx: { to: { query: Record<string, unknown> } }) => string }
      | undefined;
    expect(typeof guardOptions?.resolveAuthedLoginRedirect).toBe('function');

    const resolved = guardOptions?.resolveAuthedLoginRedirect?.({
      to: {
        query: {
          redirect: '/admin/system/user'
        }
      }
    });

    expect(mocks.resolveAuthRedirectTargetFromQuery).toHaveBeenCalledWith(
      { redirect: '/admin/system/user' },
      {
        fallback: '/',
        baseUrl: '/'
      }
    );
    expect(resolved).toBe('/');
  });
});
