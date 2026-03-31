function trimEdgeSlash(value: string) {
  return value.replace(/^\/+|\/+$/g, '');
}

/**
 * 统一规范 Vite base，确保：
 * 1) 前后端配置使用同一前缀语义；
 * 2) router 与静态资源路径保持一致；
 * 3) 输入 `admin`、`/admin`、`/admin/` 都收敛为 `/admin/`。
 */
export function normalizeAppBase(rawBase: string | undefined) {
  const fallbackBase = '/';
  const source = (rawBase ?? fallbackBase).trim();

  if (!source || source === '/') {
    return fallbackBase;
  }

  const body = trimEdgeSlash(source);
  if (!body) {
    return fallbackBase;
  }

  return `/${body}/`;
}
