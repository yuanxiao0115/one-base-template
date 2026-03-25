import type { RouteAccess } from '@one-base-template/core';
import type { RouteMeta } from 'vue-router';

export interface AdminRouteMeta extends RouteMeta {
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

/**
 * 统一路由 meta 定义入口，确保模块路由写法一致。
 */
export function defineRouteMeta<TMeta extends AdminRouteMeta>(meta: TMeta): TMeta {
  return meta;
}

/**
 * 开放路由：未登录也可访问，默认隐藏标签页。
 */
export function createOpenRouteMeta(meta: Omit<AdminRouteMeta, 'access' | 'hiddenTab'> = {}) {
  return defineRouteMeta({
    access: 'open',
    hiddenTab: true,
    ...meta
  });
}

/**
 * 登录后可访问但不依赖菜单权限的路由。
 */
export function createAuthRouteMeta(meta: Omit<AdminRouteMeta, 'access'>) {
  return defineRouteMeta({
    access: 'auth',
    ...meta
  });
}

/**
 * 全屏工作区路由：统一收敛全屏与标签页隐藏策略，但不走菜单权限。
 */
export function createFullscreenAuthRouteMeta(
  meta: Omit<AdminRouteMeta, 'access' | 'fullScreen' | 'hideTabsBar' | 'hiddenTab'>
) {
  return defineRouteMeta({
    access: 'auth',
    fullScreen: true,
    hideTabsBar: true,
    hiddenTab: true,
    ...meta
  });
}
