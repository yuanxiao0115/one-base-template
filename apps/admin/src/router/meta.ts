import type { RouteMeta } from 'vue-router';

export interface AdminRouteMeta extends RouteMeta {
  title?: string;
  icon?: string;
  order?: number;
  rank?: number;
  keepAlive?: boolean;
  affix?: boolean;
  public?: boolean;
  hideInMenu?: boolean;
  activePath?: string;
  skipMenuAuth?: boolean;
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
 * 公开路由：默认隐藏标签页，避免污染 tabs。
 */
export function createPublicRouteMeta(meta: Omit<AdminRouteMeta, 'public' | 'hiddenTab'> = {}) {
  return defineRouteMeta({
    public: true,
    hiddenTab: true,
    ...meta
  });
}

/**
 * 本地维护路由：仍需登录，但跳过菜单权限判定。
 */
export function createSkipMenuAuthRouteMeta(meta: Omit<AdminRouteMeta, 'skipMenuAuth'>) {
  return defineRouteMeta({
    skipMenuAuth: true,
    ...meta
  });
}

/**
 * 全屏工作区路由：统一收敛全屏与标签页隐藏策略，并要求 skipMenuAuth。
 */
export function createFullscreenSkipMenuAuthRouteMeta(
  meta: Omit<AdminRouteMeta, 'fullScreen' | 'hideTabsBar' | 'hiddenTab' | 'skipMenuAuth'>
) {
  return defineRouteMeta({
    fullScreen: true,
    hideTabsBar: true,
    hiddenTab: true,
    skipMenuAuth: true,
    ...meta
  });
}
