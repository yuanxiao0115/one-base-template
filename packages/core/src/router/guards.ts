import type { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router';
import { getCoreOptions } from '../context';
import { useAuthStore } from '../stores/auth';
import { useMenuStore } from '../stores/menu';
import { useSystemStore } from '../stores/system';
import { buildLoginRedirectLocation } from './redirect';
import { getRouteAccess } from './route-access';

// `/login`、`/sso` 默认都属于认证入口：未登录可进入，已登录由守卫回跳。
const DEFAULT_OPEN_PATHS = ['/login', '/sso'] as const;
const DEFAULT_LOGIN_PATH = '/login';
const DEFAULT_FORBIDDEN_PATH = '/403';

type GuardResult = true | RouteLocationRaw;

function resolveMenuKey(to: { path: string; meta: Record<string, unknown> }): string {
  const raw = to.meta.activePath;
  return typeof raw === 'string' && raw.startsWith('/') ? raw : to.path;
}

export interface RouterGuardOptions {
  /**
   * 每次导航开始前触发（位于鉴权与菜单判断之前）。
   */
  onNavigationStart?: (ctx: {
    to: RouteLocationNormalized;
    from: RouteLocationNormalized;
  }) => void | Promise<void>;
  /**
   * 额外匿名可访问路由路径。
   * 兼容 template / portal 这类尚未完全迁到 meta.access 的场景。
   */
  publicRoutePaths?: string[];
  /**
   * 未登录时跳转登录页路径。
   */
  loginRoutePath?: string;
  /**
   * 无菜单权限时跳转 403 页路径。
   */
  forbiddenRoutePath?: string;
  /**
   * 已登录访问登录页时的回跳解析器。
   */
  resolveAuthedLoginRedirect?: (ctx: { to: RouteLocationNormalized }) => string;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function shouldAllowTokenlessAuthEntryRoute(params: {
  authMode: unknown;
  tokenKey: unknown;
  authStore: Record<string, unknown>;
}) {
  const { authMode, tokenKey, authStore } = params;
  if (authMode !== 'token' && authMode !== 'mixed') {
    return false;
  }

  const hasTokenSession = authStore.hasTokenSession;
  if (typeof hasTokenSession === 'function') {
    try {
      return !(hasTokenSession as () => unknown)();
    } catch {
      return true;
    }
  }

  if (!isNonEmptyString(tokenKey)) {
    return false;
  }

  try {
    return !isNonEmptyString(globalThis.localStorage?.getItem(tokenKey));
  } catch {
    return true;
  }
}

function isAuthEntryRoute(params: {
  toPath: string;
  loginRoutePath: string;
  ssoRoutePath?: string;
}) {
  const { toPath, loginRoutePath, ssoRoutePath } = params;
  return toPath === loginRoutePath || (typeof ssoRoutePath === 'string' && toPath === ssoRoutePath);
}

function buildAuthedLoginRedirect(to: RouteLocationNormalized): GuardResult {
  const rawRedirect = to.query.redirect ?? to.query.redirectUrl;
  const fallback = '/';
  if (
    typeof rawRedirect !== 'string' ||
    !rawRedirect.startsWith('/') ||
    rawRedirect.startsWith('//')
  ) {
    return {
      path: fallback,
      query: {}
    };
  }

  return {
    path: rawRedirect,
    query: {}
  };
}

function buildAuthedLoginRedirectWithResolver(params: {
  to: RouteLocationNormalized;
  resolveAuthedLoginRedirect?: (ctx: { to: RouteLocationNormalized }) => string;
}): GuardResult {
  const { to, resolveAuthedLoginRedirect } = params;
  if (!resolveAuthedLoginRedirect) {
    return buildAuthedLoginRedirect(to);
  }

  try {
    const path = resolveAuthedLoginRedirect({ to });
    if (typeof path === 'string' && path) {
      return {
        path,
        query: {}
      };
    }
  } catch {
    // 解析器异常时回退到默认站内跳转。
  }

  return buildAuthedLoginRedirect(to);
}

function buildForbiddenRedirect(
  to: RouteLocationNormalized,
  forbiddenRoutePath: string
): GuardResult {
  return {
    path: forbiddenRoutePath,
    query: {
      from: to.fullPath
    }
  };
}

function getDefaultAccess(params: {
  to: RouteLocationNormalized;
  loginRoutePath: string;
  openRoutePaths: Set<string>;
}) {
  const { to, loginRoutePath, openRoutePaths } = params;
  if (to.path === loginRoutePath || openRoutePaths.has(to.path)) {
    return 'open' as const;
  }
  return 'menu' as const;
}

async function syncRemoteMenusIfNeeded(params: {
  isRemoteMenuMode: boolean;
  remoteSynced: boolean;
  loadMenus: () => Promise<void>;
}): Promise<boolean> {
  const { isRemoteMenuMode, remoteSynced, loadMenus } = params;
  if (!(isRemoteMenuMode && !remoteSynced)) {
    return true;
  }

  // remote 模式下未完成同步时，不允许仅凭缓存菜单做权限判定，避免切账号后命中旧权限。
  try {
    await loadMenus();
    return true;
  } catch {
    return false;
  }
}

function shouldLoadMenus(params: {
  loaded: boolean;
  isRemoteMenuMode: boolean;
  remoteSynced: boolean;
}) {
  const { loaded, isRemoteMenuMode, remoteSynced } = params;
  return !(loaded || (isRemoteMenuMode && remoteSynced));
}

async function switchSystemByMenuKeyIfNeeded(params: {
  menuKey: string;
  currentSystemCode: string;
  resolveSystemByMenuKey: (menuKey: string) => string | null | undefined;
  setCurrentSystem: (systemCode: string) => void;
  loaded: boolean;
  isRemoteMenuMode: boolean;
  remoteSynced: boolean;
  loadMenus: () => Promise<void>;
}) {
  const {
    menuKey,
    currentSystemCode,
    resolveSystemByMenuKey,
    setCurrentSystem,
    loaded,
    isRemoteMenuMode,
    remoteSynced,
    loadMenus
  } = params;

  const nextSystemCode = resolveSystemByMenuKey(menuKey);
  if (!nextSystemCode || nextSystemCode === currentSystemCode) {
    return;
  }

  setCurrentSystem(nextSystemCode);
  if (shouldLoadMenus({ loaded, isRemoteMenuMode, remoteSynced })) {
    await loadMenus();
  }
}

async function checkMenuAccess(params: {
  to: RouteLocationNormalized;
  forbiddenRoutePath: string;
  isRemoteMenuMode: boolean;
}): Promise<GuardResult> {
  const { to, forbiddenRoutePath, isRemoteMenuMode } = params;
  const menuStore = useMenuStore();
  const systemStore = useSystemStore();
  const menuKey = resolveMenuKey({ path: to.path, meta: to.meta as Record<string, unknown> });

  if (menuStore.loaded && menuStore.isAllowed(menuKey)) {
    return true;
  }

  const shouldLoad = shouldLoadMenus({
    loaded: menuStore.loaded,
    isRemoteMenuMode,
    remoteSynced: menuStore.remoteSynced
  });
  if (shouldLoad) {
    try {
      await menuStore.loadMenus();
    } catch {
      return buildForbiddenRedirect(to, forbiddenRoutePath);
    }
  }

  if (menuStore.isAllowed(menuKey)) {
    return true;
  }

  try {
    await switchSystemByMenuKeyIfNeeded({
      menuKey,
      currentSystemCode: systemStore.currentSystemCode,
      resolveSystemByMenuKey: (nextMenuKey) => menuStore.resolveSystemByMenuKey(nextMenuKey),
      setCurrentSystem: (systemCode) => systemStore.setCurrentSystem(systemCode),
      loaded: menuStore.loaded,
      isRemoteMenuMode,
      remoteSynced: menuStore.remoteSynced,
      loadMenus: () => menuStore.loadMenus()
    });
  } catch {
    return buildForbiddenRedirect(to, forbiddenRoutePath);
  }

  return menuStore.isAllowed(menuKey) ? true : buildForbiddenRedirect(to, forbiddenRoutePath);
}

export function setupRouterGuards(router: Router, options: RouterGuardOptions = {}) {
  const openRoutePaths = new Set<string>(options.publicRoutePaths ?? [...DEFAULT_OPEN_PATHS]);
  const loginRoutePath = options.loginRoutePath ?? DEFAULT_LOGIN_PATH;
  const forbiddenRoutePath = options.forbiddenRoutePath ?? DEFAULT_FORBIDDEN_PATH;

  router.beforeEach(async (to, from) => {
    await options.onNavigationStart?.({ to, from });

    const coreOptions = getCoreOptions();
    const authStore = useAuthStore();
    const ssoRoutePath =
      typeof coreOptions.sso?.routePath === 'string' ? coreOptions.sso.routePath : undefined;

    // 认证入口单独收口，避免“已登录还能进 login/sso”与普通开放页逻辑混在一起。
    if (isAuthEntryRoute({ toPath: to.path, loginRoutePath, ssoRoutePath })) {
      if (
        shouldAllowTokenlessAuthEntryRoute({
          authMode: coreOptions.auth?.mode,
          tokenKey: coreOptions.auth?.tokenKey,
          authStore: authStore as unknown as Record<string, unknown>
        })
      ) {
        return true;
      }

      const authed = await authStore.ensureAuthed();
      return authed
        ? buildAuthedLoginRedirectWithResolver({
            to,
            resolveAuthedLoginRedirect: options.resolveAuthedLoginRedirect
          })
        : true;
    }

    const access = getRouteAccess(
      to.meta,
      getDefaultAccess({
        to,
        loginRoutePath,
        openRoutePaths
      })
    );

    if (access === 'open') {
      return true;
    }

    const authed = await authStore.ensureAuthed();
    if (!authed) {
      return buildLoginRedirectLocation({
        to,
        loginRoutePath
      });
    }

    if (access === 'auth') {
      return true;
    }

    const menuStore = useMenuStore();
    const remoteMenusReady = await syncRemoteMenusIfNeeded({
      isRemoteMenuMode: coreOptions.menuMode === 'remote',
      remoteSynced: menuStore.remoteSynced,
      loadMenus: () => menuStore.loadMenus()
    });
    if (!remoteMenusReady) {
      return buildForbiddenRedirect(to, forbiddenRoutePath);
    }

    return checkMenuAccess({
      to,
      forbiddenRoutePath,
      isRemoteMenuMode: coreOptions.menuMode === 'remote'
    });
  });
}
