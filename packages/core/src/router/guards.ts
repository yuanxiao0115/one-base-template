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
      // 关键要求：退出/换用户后，不能保留旧用户的标签页。
      // 这里处理“鉴权失效 -> 跳转登录”的场景（例如 Cookie 过期），避免登录后复活旧 tabs。
      useTabsStore().reset();
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

    // 若当前系统的菜单缓存已就绪，且该路由在当前系统的白名单内，则保持当前系统不变。
    // 这能避免：
    // 1) 多系统存在相同 path 时，根据 pathIndex 猜系统导致“刷新后切回默认系统”
    // 2) 业务未配置 systemHomeMap 时，根路径兜底跳到某个公共首页再被错误切系统
    if (menuStore.loaded && menuStore.isAllowed(menuKey)) {
      return true;
    }

    // 若当前系统菜单未加载，先加载（remote 模式通常一次拉取所有系统菜单）
    if (!menuStore.loaded) {
      await menuStore.loadMenus();
    }

    // 菜单加载后如果当前系统已允许访问该路由，则无需再做“按路径切系统”。
    // 这对“多系统存在相同 path”或“业务未配置 systemHomeMap”场景尤为重要：应以用户当前系统为准，避免刷新时被覆盖。
    if (menuStore.isAllowed(menuKey)) {
      return true;
    }

    // 当前系统不允许访问该路由时，再尝试根据 menuKey 解析目标系统并切换
    const resolvedSystem = menuStore.resolveSystemByMenuKey(menuKey);
    if (resolvedSystem && resolvedSystem !== systemStore.currentSystemCode) {
      systemStore.setCurrentSystem(resolvedSystem);
      // 如果切到的新系统尚未加载（极少发生：缓存不全/系统列表变化），兜底再拉一次
      if (!menuStore.loaded) {
        await menuStore.loadMenus();
      }
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
