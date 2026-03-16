import { getInitialPath } from '@one-base-template/core';
import { AdminLayout, ForbiddenPage, NotFoundPage } from '@one-base-template/ui/shell';
import type { RouteRecordRaw } from 'vue-router';
import { appEnv } from '@/infra/env';
import LoginPage from '@/pages/login/LoginPage.vue';
import demoRoutes from '@/modules/demo/routes';
import homeRoutes from '@/modules/home/routes';
import {
  APP_FORBIDDEN_ROUTE_PATH,
  APP_LOGIN_ROUTE_PATH,
  APP_NOT_FOUND_CATCHALL_PATH,
  APP_NOT_FOUND_ROUTE_PATH,
  APP_ROOT_PATH
} from './constants';

export const templateLayoutRoutes: RouteRecordRaw[] = [...homeRoutes, ...demoRoutes];

const DEFAULT_FALLBACK_HOME = '/home/index';

function getRootRedirect(): string {
  return getInitialPath({
    defaultSystemCode: appEnv.defaultSystemCode,
    systemHomeMap: appEnv.systemHomeMap,
    storageNamespace: appEnv.storageNamespace,
    fallbackHome: DEFAULT_FALLBACK_HOME
  });
}

export const templateRoutes: RouteRecordRaw[] = [
  {
    path: APP_ROOT_PATH,
    component: AdminLayout,
    redirect: () => getRootRedirect(),
    children: templateLayoutRoutes
  },
  {
    path: APP_LOGIN_ROUTE_PATH,
    name: 'TemplateLogin',
    component: LoginPage,
    meta: {
      public: true,
      hiddenTab: true
    }
  },
  {
    path: APP_FORBIDDEN_ROUTE_PATH,
    name: 'TemplateForbidden',
    component: ForbiddenPage,
    meta: {
      public: true,
      hiddenTab: true
    }
  },
  {
    path: APP_NOT_FOUND_ROUTE_PATH,
    name: 'TemplateNotFound',
    component: NotFoundPage,
    meta: {
      public: true,
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
      public: true,
      hiddenTab: true
    }
  }
];
