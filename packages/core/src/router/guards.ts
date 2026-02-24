import type { Router } from 'vue-router';
import { getCoreOptions } from '../context';
import { useAuthStore } from '../stores/auth';
import { useMenuStore } from '../stores/menu';
import { useSystemStore } from '../stores/system';
import { useTabsStore } from '../stores/tabs';

const PUBLIC_PATHS = new Set<string>(['/login', '/sso', '/403', '/404']);

function isPublicRoute(path: string) {
  return PUBLIC_PATHS.has(path);
}

function resolveMenuKey(to: { path: string; meta: Record<string, unknown> }): string {
  const raw = to.meta.activePath;
  return typeof raw === 'string' && raw.startsWith('/') ? raw : to.path;
}

export function setupRouterGuards(router: Router) {
  router.beforeEach(async to => {
    const options = getCoreOptions();

    // SSO 回调路由默认视为公开
    if (options.sso.enabled && to.path === options.sso.routePath) {
      return true;
    }

    if (to.meta.public || isPublicRoute(to.path)) {
      return true;
    }

    const skipMenuAuth = (to.meta as Record<string, unknown>).skipMenuAuth === true;

    const authStore = useAuthStore();
    const authed = await authStore.ensureAuthed();
    if (!authed) {
      return {
        path: '/login',
        query: { redirect: to.fullPath }
      };
    }

    const menuStore = useMenuStore();
    const systemStore = useSystemStore();

    // 详情/编辑等“非菜单路由”通过 meta.activePath 归属到某个菜单入口：
    // - 归属系统：用 activePath 反查 systemCode
    // - 权限校验：以 activePath 为准（只要有菜单权限即可访问详情页）
    const menuKey = resolveMenuKey({ path: to.path, meta: to.meta as Record<string, unknown> });

    // 若本地缓存了 path->systemCode 索引，可在菜单未加载前先“预判”系统，减少首次进入跨系统 URL 的跳转抖动
    const guessedSystem = menuStore.resolveSystemByMenuKey(menuKey);
    if (guessedSystem && guessedSystem !== systemStore.currentSystemCode) {
      systemStore.setCurrentSystem(guessedSystem);
    }

    if (!menuStore.loaded) {
      await menuStore.loadMenus();
    }

    // 菜单加载后再做一次“精确系统匹配”（首次进入/缓存缺失时 guessedSystem 可能为空）
    const resolvedSystem = menuStore.resolveSystemByMenuKey(menuKey);
    if (resolvedSystem && resolvedSystem !== systemStore.currentSystemCode) {
      systemStore.setCurrentSystem(resolvedSystem);
    }
    // 如果切到的新系统尚未加载（极少发生：缓存不全/系统列表变化），兜底再拉一次
    if (!menuStore.loaded) {
      await menuStore.loadMenus();
    }

    // 菜单树决定可访问路由：不在 allowedPaths 的一律 403（详情页以 menuKey=activePath 判定）
    if (!menuStore.isAllowed(menuKey)) {
      // 某些“本地维护但暂未接入菜单”的页面，允许在已登录的前提下跳过菜单权限校验
      // 注意：这会放宽前端路由层面的权限控制，应谨慎使用（优先用 activePath 归属到某个菜单入口）。
      if (skipMenuAuth) {
        return true;
      }
      return {
        path: '/403',
        query: { from: to.fullPath }
      };
    }

    return true;
  });

  router.afterEach(to => {
    if (to.meta.public || isPublicRoute(to.path)) return;
    useTabsStore().openByRoute(to);
  });
}
