import type { ObHttp } from '@one-base-template/core';

let httpClient: ObHttp | null = null;

/**
 * 在应用启动时注入全局 http 实例。
 *
 * 说明：
 * - 避免在各业务模块里重复 createObHttp()
 * - 允许在页面/模块里直接复用 http（例如下载、上传等通用能力）
 */
export function setObHttpClient(client: ObHttp) {
  httpClient = client;
}

export function getObHttpClient(): ObHttp {
  if (!httpClient) {
    throw new Error('[admin] ObHttpClient 未初始化，请先在应用启动阶段调用 setObHttpClient().');
  }
  return httpClient;
}
