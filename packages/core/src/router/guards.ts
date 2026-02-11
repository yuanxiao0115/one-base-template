import type { Router } from 'vue-router';
import { getCoreOptions } from '../context';
import { useAuthStore } from '../stores/auth';
import { useMenuStore } from '../stores/menu';
import { useTabsStore } from '../stores/tabs';

const PUBLIC_PATHS = new Set<string>(['/login', '/sso', '/403', '/404']);

function isPublicRoute(path: string) {
  return PUBLIC_PATHS.has(path);
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

    const authStore = useAuthStore();
    const authed = await authStore.ensureAuthed();
    if (!authed) {
      return {
        path: '/login',
        query: { redirect: to.fullPath }
      };
    }

    const menuStore = useMenuStore();
    if (!menuStore.loaded) {
      await menuStore.loadMenus();
    }

    // 菜单树决定可访问路由：不在 allowedPaths 的一律 403
    if (!menuStore.isAllowed(to.path)) {
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
