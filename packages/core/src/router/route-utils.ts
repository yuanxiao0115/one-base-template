import type { RouteRecordName } from 'vue-router';

/**
 * 把路由 name 统一成可比较的字符串键。
 * - string 直接返回
 * - symbol 转为 Symbol(desc) 字符串
 * - 其余值返回 null（用于守卫/白名单判空）
 */
export function toRouteNameKey(name: RouteRecordName | null | undefined): string | null {
  if (typeof name === 'string') {
    return name;
  }
  if (typeof name === 'symbol') {
    return name.toString();
  }
  return null;
}

/**
 * 归一化路由 path：
 * - 空值回退 rootPath（默认 /）
 * - 自动补齐前导 /
 * - 合并重复斜杠
 */
export function normalizeRoutePath(path: string, rootPath = '/'): string {
  if (!path) {
    return rootPath;
  }
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  return withLeadingSlash.replace(/\/{2,}/g, '/');
}

/**
 * 根据父路径与当前 path 计算完整路径。
 * - 绝对路径优先（以 / 开头）
 * - 相对路径与 parentPath 拼接
 * - 空路径回退 parentPath（再归一化）
 */
export function buildRouteFullPath(parentPath: string, currentPath: string, rootPath = '/'): string {
  if (!currentPath) {
    return normalizeRoutePath(parentPath || rootPath, rootPath);
  }
  if (currentPath.startsWith('/')) {
    return normalizeRoutePath(currentPath, rootPath);
  }
  if (!parentPath || parentPath === rootPath) {
    return normalizeRoutePath(currentPath, rootPath);
  }
  return normalizeRoutePath(`${parentPath}/${currentPath}`, rootPath);
}
