import type { RouteRecordRaw } from 'vue-router';
import { AdminLayout } from '@one-base-template/ui';

type RouteModule = { default?: RouteRecordRaw[]; routes?: RouteRecordRaw[] };
const modules = import.meta.glob('../modules/**/routes.ts', { eager: true }) as Record<string, RouteModule>;

const moduleRoutes: RouteRecordRaw[] = [];
for (const mod of Object.values(modules)) {
  const routes = mod.default ?? mod.routes;
  if (Array.isArray(routes)) {
    moduleRoutes.push(...routes);
  }
}

function parseSystemHomeMap(raw: unknown): Record<string, string> {
  if (typeof raw !== 'string' || !raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === 'string' && v.startsWith('/')) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function resolveRootRedirect(): string {
  // 与 core 的 systemStore 持久化 key 保持一致
  const currentSystemCode = (() => {
    try {
      return localStorage.getItem('ob_system_current') || '';
    } catch {
      return '';
    }
  })();

  const defaultSystemCode =
    (import.meta.env.VITE_DEFAULT_SYSTEM_CODE as string | undefined) ||
    (import.meta.env.VITE_SCZFW_SYSTEM_PERMISSION_CODE as string | undefined) ||
    '';

  const homeMap = parseSystemHomeMap(import.meta.env.VITE_SYSTEM_HOME_MAP);
  const code = currentSystemCode || defaultSystemCode;

  const mapped = code ? homeMap[code] : undefined;
  return typeof mapped === 'string' && mapped.startsWith('/') ? mapped : '/home/index';
}

export const routes: RouteRecordRaw[] = [
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
