import type { RouteLocationNormalized, Router } from 'vue-router';
import { getCoreOptions } from '../context';
import { useAuthStore } from '../stores/auth';
import { useMenuStore } from '../stores/menu';
import { useSystemStore } from '../stores/system';

const DEFAULT_PUBLIC_PATHS = ['/login', '/sso', '/403', '/404'] as const;
const DEFAULT_LOGIN_PATH = '/login';
const DEFAULT_FORBIDDEN_PATH = '/403';

function isPublicRoute(path: string, publicPaths: Set<string>) {
  return publicPaths.has(path);
}

function resolveMenuKey(to: { path: string; meta: Record<string, unknown> }): string {
  const raw = to.meta.activePath;
  return typeof raw === 'string' && raw.startsWith('/') ? raw : to.path;
}

function toRouteNameKey(name: RouteLocationNormalized['name']): string | null {
  if (typeof name === 'string') {
    return name;
  }
  if (typeof name === 'symbol') {
    return name.toString();
  }
  return null;
}

export interface RouterGuardOptions {
  /**
   * 每次导航开始前触发（位于鉴权/菜单守卫之前）。
   * 典型场景：中断上一页在途请求，保证路由切换响应优先级。
   */
  onNavigationStart?: (ctx: { to: RouteLocationNormalized; from: RouteLocationNormalized }) => void | Promise<void>;
  /**
   * 公开路由路径集合，命中后直接放行。
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
   * `meta.skipMenuAuth=true` 的路由白名单（按 route.name）。
   * 未配置时保持兼容：允许所有 skipMenuAuth。
   * 只要显式传入（包括空数组）就启用严格模式：不在白名单内的 skipMenuAuth 路由不会放行。
   */
  allowedSkipMenuAuthRouteNames?: string[];
}

type GuardResult = true | { path: string; query: Record<string, string> };

interface GuardRuntimeContext {
  to: RouteLocationNormalized;
  forbiddenRoutePath: string;
  strictSkipMenuAuth: boolean;
  allowedSkipMenuAuthRouteNames: Set<string>;
}

function isSsoRoute(params: { to: RouteLocationNormalized; ssoEnabled: boolean; ssoRoutePath: string }) {
  const { to, ssoEnabled, ssoRoutePath } = params;
  return ssoEnabled && to.path === ssoRoutePath;
}

function isExplicitPublicRoute(to: RouteLocationNormalized, publicRoutePaths: Set<string>) {
  return Boolean(to.meta.public) || isPublicRoute(to.path, publicRoutePaths);
}

function isSkipMenuAuthRoute(to: RouteLocationNormalized) {
  return (to.meta as Record<string, unknown>).skipMenuAuth === true;
}

function buildLoginRedirect(to: RouteLocationNormalized, loginRoutePath: string): GuardResult {
  return {
    path: loginRoutePath,
    query: { redirect: to.fullPath },
  };
}

function buildForbiddenRedirect(to: RouteLocationNormalized, forbiddenRoutePath: string): GuardResult {
  return {
    path: forbiddenRoutePath,
    query: { from: to.fullPath },
  };
}

async function syncRemoteMenusIfNeeded(params: {
  isRemoteMenuMode: boolean;
  remoteSynced: boolean;
  loaded: boolean;
  loadMenus: () => Promise<void>;
}) {
  const { isRemoteMenuMode, remoteSynced, loaded, loadMenus } = params;
  if (!(isRemoteMenuMode && !remoteSynced)) {
    return;
  }

  if (loaded) {
    // 已有缓存时采用“先放行，后同步”，避免首跳被远端慢接口明显阻塞。
    void loadMenus().catch(() => {
      // 同步失败由全局 http hooks 统一处理（如 401 跳登录），这里避免未捕获告警。
    });
    return;
  }

  // 无缓存时仍需阻塞拉取，确保首次鉴权边界可靠。
  await loadMenus();
}

function shouldLoadMenus(params: { loaded: boolean; isRemoteMenuMode: boolean; remoteSynced: boolean }) {
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
    loadMenus,
  } = params;

  const resolvedSystem = resolveSystemByMenuKey(menuKey);
  if (!resolvedSystem || resolvedSystem === currentSystemCode) {
    return;
  }

  setCurrentSystem(resolvedSystem);
  // 如果切到的新系统尚未加载（极少发生：缓存不全/系统列表变化），兜底再拉一次
  if (shouldLoadMenus({ loaded, isRemoteMenuMode, remoteSynced })) {
    await loadMenus();
  }
}

function resolveSkipMenuAuthGuardResult(params: GuardRuntimeContext): GuardResult {
  const { to, forbiddenRoutePath, strictSkipMenuAuth, allowedSkipMenuAuthRouteNames } = params;
  if (!strictSkipMenuAuth) {
    return true;
  }

  const routeName = toRouteNameKey(to.name);
  if (!routeName) {
    console.warn(`[core/router/guards] skipMenuAuth 路由缺少 name：${to.path}`);
    return buildForbiddenRedirect(to, forbiddenRoutePath);
  }

  if (allowedSkipMenuAuthRouteNames.has(routeName)) {
    return true;
  }

  console.warn(`[core/router/guards] skipMenuAuth 路由未加入白名单：name=${routeName}, path=${to.path}`);
  return buildForbiddenRedirect(to, forbiddenRoutePath);
}

async function resolveMenuGuardResult(params: {
  guardContext: GuardRuntimeContext;
  isSkipMenuAuth: boolean;
  isRemoteMenuMode: boolean;
}): Promise<GuardResult> {
  const { guardContext, isSkipMenuAuth, isRemoteMenuMode } = params;
  const { to, forbiddenRoutePath } = guardContext;
  const menuStore = useMenuStore();
  const systemStore = useSystemStore();

  // remote 菜单模式下，即使命中本地缓存也要在当前会话至少同步一次远端菜单，
  // 避免系统列表/菜单结构长期停留在历史缓存（例如新增系统后看不到）。
  await syncRemoteMenusIfNeeded({
    isRemoteMenuMode,
    remoteSynced: menuStore.remoteSynced,
    loaded: menuStore.loaded,
    loadMenus: () => menuStore.loadMenus(),
  });

  // 详情/编辑等“非菜单路由”通过 meta.activePath 归属到某个菜单入口：
  // - 归属系统：用 activePath 反查 systemCode
  // - 权限校验：以 activePath 为准（只要有菜单权限即可访问详情页）
  const menuKey = resolveMenuKey({ path: to.path, meta: to.meta as Record<string, unknown> });

  // 若当前系统的菜单缓存已就绪，且该路由在当前系统的白名单内，则保持当前系统不变。
  // 这能避免：
  // 1) 多系统存在相同 path 时，根据 pathIndex 猜系统导致“刷新后切回默认系统”
  // 2) 业务未配置 systemHomeMap 时，根路径兜底跳到某个公共首页再被错误切系统
  if (menuStore.loaded && menuStore.isAllowed(menuKey)) {
    return true;
  }

  // 若当前系统菜单未加载，先加载（remote 模式通常一次拉取所有系统菜单）
  if (shouldLoadMenus({ loaded: menuStore.loaded, isRemoteMenuMode, remoteSynced: menuStore.remoteSynced })) {
    await menuStore.loadMenus();
  }

  // 菜单加载后如果当前系统已允许访问该路由，则无需再做“按路径切系统”。
  // 这对“多系统存在相同 path”或“业务未配置 systemHomeMap”场景尤为重要：应以用户当前系统为准，避免刷新时被覆盖。
  if (menuStore.isAllowed(menuKey)) {
    return true;
  }

  // 当前系统不允许访问该路由时，再尝试根据 menuKey 解析目标系统并切换
  await switchSystemByMenuKeyIfNeeded({
    menuKey,
    currentSystemCode: systemStore.currentSystemCode,
    resolveSystemByMenuKey: (nextMenuKey) => menuStore.resolveSystemByMenuKey(nextMenuKey),
    setCurrentSystem: (systemCode) => systemStore.setCurrentSystem(systemCode),
    loaded: menuStore.loaded,
    isRemoteMenuMode,
    remoteSynced: menuStore.remoteSynced,
    loadMenus: () => menuStore.loadMenus(),
  });

  // 菜单树决定可访问路由：不在 allowedPaths 的一律 403（详情页以 menuKey=activePath 判定）
  if (!menuStore.isAllowed(menuKey)) {
    // 某些“本地维护但暂未接入菜单”的页面，允许在已登录的前提下跳过菜单权限校验
    // 注意：这会放宽前端路由层面的权限控制，应谨慎使用（优先用 activePath 归属到某个菜单入口）。
    if (isSkipMenuAuth) {
      return resolveSkipMenuAuthGuardResult(guardContext);
    }
    return buildForbiddenRedirect(to, forbiddenRoutePath);
  }

  return true;
}

export function setupRouterGuards(router: Router, options: RouterGuardOptions = {}) {
  const publicRoutePaths = new Set<string>(options.publicRoutePaths ?? [...DEFAULT_PUBLIC_PATHS]);
  const loginRoutePath = options.loginRoutePath ?? DEFAULT_LOGIN_PATH;
  const forbiddenRoutePath = options.forbiddenRoutePath ?? DEFAULT_FORBIDDEN_PATH;
  const hasSkipMenuAuthAllowList = Array.isArray(options.allowedSkipMenuAuthRouteNames);
  const allowedSkipMenuAuthRouteNames = new Set(options.allowedSkipMenuAuthRouteNames ?? []);
  const strictSkipMenuAuth = hasSkipMenuAuthAllowList;

  router.beforeEach(async (to, from) => {
    await options.onNavigationStart?.({ to, from });

    const coreOptions = getCoreOptions();

    // SSO 回调路由默认视为公开
    if (isSsoRoute({ to, ssoEnabled: coreOptions.sso.enabled, ssoRoutePath: coreOptions.sso.routePath })) {
      return true;
    }

    if (isExplicitPublicRoute(to, publicRoutePaths)) {
      return true;
    }

    const skipMenuAuth = isSkipMenuAuthRoute(to);

    const authStore = useAuthStore();
    const authed = await authStore.ensureAuthed();
    if (!authed) {
      return buildLoginRedirect(to, loginRoutePath);
    }

    return resolveMenuGuardResult({
      guardContext: {
        to,
        forbiddenRoutePath,
        strictSkipMenuAuth,
        allowedSkipMenuAuthRouteNames,
      },
      isSkipMenuAuth: skipMenuAuth,
      isRemoteMenuMode: coreOptions.menuMode === 'remote',
    });
  });
}
