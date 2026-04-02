import { getInitialPath } from '@one-base-template/core';
import { ForbiddenPage, NotFoundPage } from '@one-base-template/ui/shell';
import type { RouteRecordRaw } from 'vue-router';
import { appEnv } from '@/config/env';
import PortalRenderPage from '@/modules/portal/pages/PortalRenderPage.vue';
import LoginPage from '@/pages/login/LoginPage.vue';
import {
  APP_FORBIDDEN_ROUTE_PATH,
  APP_LOGIN_ROUTE_PATH,
  APP_NOT_FOUND_CATCHALL_PATH,
  APP_NOT_FOUND_ROUTE_PATH,
  APP_PORTAL_INDEX_ROUTE_PATH,
  APP_PORTAL_PREVIEW_ROUTE_PATH,
  APP_ROOT_PATH,
  APP_SSO_ROUTE_PATH
} from './constants';

const DEFAULT_FALLBACK_HOME = '/portal/index';

function getRootRedirect(): string {
  return getInitialPath({
    defaultSystemCode: appEnv.defaultSystemCode,
    systemHomeMap: appEnv.systemHomeMap,
    storageNamespace: appEnv.storageNamespace,
    fallbackHome: DEFAULT_FALLBACK_HOME
  });
}

export const portalRoutes: RouteRecordRaw[] = [
  {
    path: APP_ROOT_PATH,
    redirect: () => getRootRedirect(),
    meta: {
      access: 'open',
      hiddenTab: true
    }
  },
  {
    path: APP_PORTAL_INDEX_ROUTE_PATH,
    name: 'PortalIndex',
    component: PortalRenderPage,
    meta: {
      title: '门户首页',
      access: 'auth',
      hiddenTab: true,
      skipMenuAuth: true
    }
  },
  {
    path: APP_PORTAL_PREVIEW_ROUTE_PATH,
    name: 'PortalPreview',
    component: PortalRenderPage,
    meta: {
      access: 'auth',
      hiddenTab: true
    }
  },
  {
    path: APP_LOGIN_ROUTE_PATH,
    name: 'PortalLogin',
    component: LoginPage,
    meta: {
      access: 'open',
      hiddenTab: true
    }
  },
  {
    path: APP_SSO_ROUTE_PATH,
    name: 'PortalSsoCallback',
    component: async () => import('@/pages/sso/SsoCallbackPage.vue'),
    meta: {
      access: 'open',
      hiddenTab: true
    }
  },
  {
    path: APP_FORBIDDEN_ROUTE_PATH,
    name: 'PortalForbidden',
    component: ForbiddenPage,
    meta: {
      access: 'open',
      hiddenTab: true
    }
  },
  {
    path: APP_NOT_FOUND_ROUTE_PATH,
    name: 'PortalNotFound',
    component: NotFoundPage,
    meta: {
      access: 'open',
      hiddenTab: true
    }
  },
  {
    path: APP_NOT_FOUND_CATCHALL_PATH,
    redirect: () => ({
      path: APP_NOT_FOUND_ROUTE_PATH,
      replace: true
    }),
    meta: {
      access: 'open',
      hiddenTab: true
    }
  }
];
