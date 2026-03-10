import { resolveAppRedirectTarget } from "@one-base-template/core";

/**
 * admin 侧统一复用 core 的 redirect 解析：
 * - 仅允许站内跳转
 * - 自动剥离 baseUrl（子路径部署）
 * - 保留 query/hash
 */
export function getAppRedirectTarget(
  raw: unknown,
  options: {
    fallback: string;
    baseUrl: string;
  }
): string {
  return resolveAppRedirectTarget(raw, options);
}
