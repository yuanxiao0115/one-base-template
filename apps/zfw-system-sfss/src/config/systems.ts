import type { SystemOptions } from '@one-base-template/core';

/**
 * 多系统配置：每个系统固定一个首页路径。
 *
 * 说明：
 * - 业务项目可直接替换本文件，接入更复杂的系统跳转/首页策略
 * - fallbackHome 建议保持与路由存在的路径一致
 *
 * 维护建议：
 * - 单系统项目通常只需确认 `DEFAULT_FALLBACK_HOME`；
 * - 多系统项目再维护 `homeMap` 与 `defaultCode`。
 */
export const DEFAULT_FALLBACK_HOME = '/home/index';

export function createSystemsOptions(params: {
  defaultCode?: string;
  homeMap: Record<string, string>;
}): SystemOptions {
  return {
    defaultCode: params.defaultCode,
    homeMap: params.homeMap,
    fallbackHome: DEFAULT_FALLBACK_HOME
  };
}
