import type { Router } from 'vue-router';

export const DYNAMIC_IMPORT_RELOAD_KEY = 'ob:route:dynamic-import-reload-target';

const DYNAMIC_IMPORT_ERROR_MARKERS = [
  'failed to fetch dynamically imported module',
  'importing a module script failed',
  'failed to load module script',
  'loading chunk'
];

export function isDynamicImportLoadError(error: unknown): boolean {
  const text = error instanceof Error ? error.message : String(error || '');
  const normalized = text.toLowerCase();
  return DYNAMIC_IMPORT_ERROR_MARKERS.some((marker) => normalized.includes(marker));
}

export function installRouteDynamicImportRecovery(router: Router) {
  if (typeof window === 'undefined') {
    return;
  }

  router.onError((error, to) => {
    if (!isDynamicImportLoadError(error)) {
      return;
    }

    const target =
      typeof to?.fullPath === 'string' && to.fullPath
        ? to.fullPath
        : `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const previousTarget = window.sessionStorage.getItem(DYNAMIC_IMPORT_RELOAD_KEY);

    if (previousTarget === target) {
      // 同一路由自动刷新后仍失败，停止自动重试，避免死循环。
      window.sessionStorage.removeItem(DYNAMIC_IMPORT_RELOAD_KEY);
      console.error('[router] 动态模块加载失败，自动刷新未恢复，请手动刷新页面。', error);
      return;
    }

    window.sessionStorage.setItem(DYNAMIC_IMPORT_RELOAD_KEY, target);
    console.warn('[router] 检测到动态模块加载失败，准备自动刷新恢复。', {
      target,
      reason: error instanceof Error ? error.message : String(error)
    });
    window.location.assign(target);
  });

  router.afterEach((to) => {
    const previousTarget = window.sessionStorage.getItem(DYNAMIC_IMPORT_RELOAD_KEY);
    if (previousTarget === to.fullPath) {
      window.sessionStorage.removeItem(DYNAMIC_IMPORT_RELOAD_KEY);
    }
  });
}
