import type { RouteMeta, RouteRecordRaw } from 'vue-router';
import type { AppMenuItem } from '../adapter/types';
import { isHttpUrl } from '../utils/url';

export interface CreateStaticMenusOptions {
  /**
   * 用于从某个“壳路由”开始生成菜单（典型值：'/'）。
   * 如果找不到该路由，则会从全部路由记录开始生成（并自动过滤 public 路由）。
   */
  rootPath?: string;
  /**
   * 是否按 `meta.order` 升序排序（默认 true）。
   */
  sort?: boolean;
}

function readMetaString(meta: RouteMeta, key: string): string | undefined {
  const v = meta[key];
  return typeof v === 'string' ? v : undefined;
}

function readMetaNumber(meta: RouteMeta, key: string): number | undefined {
  const v = meta[key];
  return typeof v === 'number' ? v : undefined;
}

function joinPath(parent: string, child: string): string {
  if (!parent || parent === '/') {
    return child.startsWith('/') ? child : `/${child}`;
  }
  if (child.startsWith('/')) return child;
  return `${parent.replace(/\/$/, '')}/${child}`;
}

function buildMenus(records: RouteRecordRaw[], parentPath: string, options: Required<CreateStaticMenusOptions>): AppMenuItem[] {
  const out: AppMenuItem[] = [];

  for (const record of records) {
    const meta = (record.meta ?? {}) as RouteMeta;
    const fullPath = joinPath(parentPath, record.path);

    // 约定：public 路由不进菜单（例如 /login、/sso、/404 等）
    if (meta.public === true) continue;
    if (meta.hideInMenu === true) continue;

    const children = record.children?.length ? buildMenus(record.children, fullPath, options) : [];

    const title = readMetaString(meta, 'title');
    if (!title) {
      // 没有 title 的路由默认不显示在菜单，但允许其子路由提升到当前层级
      out.push(...children);
      continue;
    }

    const icon = readMetaString(meta, 'icon');
    const order = readMetaNumber(meta, 'order');

    out.push({
      path: fullPath,
      title,
      icon,
      order,
      keepAlive: meta.keepAlive === true,
      external: isHttpUrl(fullPath) ? true : undefined,
      children: children.length ? children : undefined
    });
  }

  if (options.sort) {
    out.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  return out;
}

/**
 * 从静态路由表生成菜单树（适合“简单项目”直接复用）。
 *
 * 约定：
 * - 以 `meta.title` 作为菜单标题；没有 title 的路由默认不显示（但会提升其子路由）
 * - `meta.public === true` 的路由会被过滤
 * - `meta.keepAlive === true` 会映射到菜单项的 `keepAlive`
 */
export function createStaticMenusFromRoutes(
  routes: RouteRecordRaw[],
  options: CreateStaticMenusOptions = {}
): AppMenuItem[] {
  const resolved: Required<CreateStaticMenusOptions> = {
    rootPath: options.rootPath ?? '/',
    sort: options.sort ?? true
  };

  const root = routes.find(r => r.path === resolved.rootPath);
  const start = root?.children?.length ? root.children : routes;
  const parentPath = root ? root.path : '';
  return buildMenus(start, parentPath, resolved);
}
