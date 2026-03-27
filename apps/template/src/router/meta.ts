import type { RouteAccess } from '@one-base-template/core';
import type { RouteMeta } from 'vue-router';

export interface TemplateRouteMeta extends RouteMeta {
  title?: string;
  icon?: string;
  order?: number;
  rank?: number;
  keepAlive?: boolean;
  affix?: boolean;
  access?: RouteAccess;
  hideInMenu?: boolean;
  activePath?: string;
  hiddenTab?: boolean;
  noTag?: boolean;
  fullScreen?: boolean;
  hideTabsBar?: boolean;
}

export function defineRouteMeta<TMeta extends TemplateRouteMeta>(meta: TMeta): TMeta {
  return meta;
}

export function createOpenRouteMeta(meta: Omit<TemplateRouteMeta, 'access' | 'hiddenTab'> = {}) {
  return defineRouteMeta({
    access: 'open',
    hiddenTab: true,
    ...meta
  });
}

export function createAuthRouteMeta(meta: Omit<TemplateRouteMeta, 'access'>) {
  return defineRouteMeta({
    access: 'auth',
    ...meta
  });
}
