import type { RouteRecordRaw } from 'vue-router';
import { AdminLayout } from '@one-base-template/ui';

import { appEnv } from '../infra/env';

type RouteModule = { default?: RouteRecordRaw[]; routes?: RouteRecordRaw[] };
const modules = import.meta.glob('../modules/**/routes.ts', { eager: true }) as Record<string, RouteModule>;

const moduleRoutes: RouteRecordRaw[] = [];
for (const mod of Object.values(modules)) {
  const routes = mod.default ?? mod.routes;
  if (Array.isArray(routes)) {
    moduleRoutes.push(...routes);
  }
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

function readFromStorages(key: string): string | null {
  try {
    const v = localStorage.getItem(key);
    if (v) return v;
  } catch {
    // 忽略
  }
  try {
    const v = sessionStorage.getItem(key);
    if (v) return v;
  } catch {
    // 忽略
  }
  return null;
}

type StoredMenuItem = {
  path?: unknown;
  external?: unknown;
  children?: unknown;
};

function isHttpUrl(path: string): boolean {
  return /^https?:\/\//i.test(path);
}

function readStoredMenuTree(systemCode: string): unknown[] | null {
  const raw = readFromStorages(`ob_menu_tree:${systemCode}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function findFirstLeafPathFromStoredTree(list: unknown[]): string | undefined {
  const walk = (items: unknown[]): string | undefined => {
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const node = item as StoredMenuItem;

      const rawPath = node.path;
      const path = isNonEmptyString(rawPath) ? rawPath : '';
      const external = typeof node.external === 'boolean' ? node.external : isHttpUrl(path);

      const rawChildren = node.children;
      const children = Array.isArray(rawChildren) ? rawChildren : [];
      if (children.length) {
        const leaf = walk(children);
        if (leaf) return leaf;
        continue;
      }

      // 仅叶子节点作为首页兜底（避免跳到“分组父节点”）
      if (!external && path.startsWith('/')) return path;
    }
    return undefined;
  };

  return walk(list);
}

function resolveRootRedirect(): string {
  // 与 core 的 systemStore 持久化 key 保持一致
  const currentSystemCode = (() => {
    const raw = readFromStorages('ob_system_current');
    return isNonEmptyString(raw) ? raw : '';
  })();

  const code = currentSystemCode || (appEnv.defaultSystemCode ?? '');

  const mapped = code ? appEnv.systemHomeMap[code] : undefined;
  if (typeof mapped === 'string' && mapped.startsWith('/')) return mapped;

  // 当业务未配置 systemHomeMap 时，尽量从“当前系统”的缓存菜单树推断一个可访问的叶子节点作为首页兜底，
  // 避免刷新时落回默认系统首页（/home/index）导致 ob_system_current 被守卫切回。
  if (code) {
    const cachedTree = readStoredMenuTree(code);
    if (cachedTree?.length) {
      const leaf = findFirstLeafPathFromStoredTree(cachedTree);
      if (leaf) return leaf;
    }
  }

  return '/home/index';
}

export const routes: RouteRecordRaw[] = [
  {
    // 门户预览页：必须是顶层路由，避免被 AdminLayout（侧栏/顶栏）包裹
    path: '/portal/preview/:tabId?',
    name: 'PortalPreview',
    component: () => import('../modules/portal/pages/PortalPreviewRenderPage.vue'),
    meta: { public: true, hiddenTab: true }
  },
  {
    // 门户设计器：全局全屏页，必须是顶层路由，避免被 AdminLayout（侧栏/顶栏）包裹
    path: '/portal/designer',
    name: 'PortalDesigner',
    component: () => import('../modules/portal/pages/PortalTemplateSettingPage.vue'),
    meta: {
      title: '门户配置',
      fullScreen: true,
      hideTabsBar: true,
      hiddenTab: true,
      activePath: '/portal/setting',
      skipMenuAuth: true
    }
  },
  {
    // 门户页面编辑器：全局全屏页
    path: '/portal/layout',
    name: 'PortalPageEditor',
    component: () => import('../modules/portal/pages/PortalPageEditPage.vue'),
    meta: {
      title: '页面编辑',
      fullScreen: true,
      hideTabsBar: true,
      hiddenTab: true,
      activePath: '/portal/setting',
      skipMenuAuth: true
    }
  },
  {
    path: '/',
    component: AdminLayout,
    redirect: () => resolveRootRedirect(),
    children: moduleRoutes
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/login/LoginPage.vue'),
    meta: { public: true, hiddenTab: true }
  },
  {
    path: '/sso',
    name: 'Sso',
    component: () => import('../pages/sso/SsoCallbackPage.vue'),
    meta: { public: true, hiddenTab: true }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../pages/error/ForbiddenPage.vue'),
    meta: { public: true, hiddenTab: true }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('../pages/error/NotFoundPage.vue'),
    meta: { public: true, hiddenTab: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: { public: true, hiddenTab: true }
  }
];
