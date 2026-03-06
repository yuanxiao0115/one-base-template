import type { ObHttp } from "@one-base-template/core";

let httpClient: ObHttp | null = null;

/**
 * 在应用启动阶段注入全局 http 实例，业务模块统一从这里获取。
 */
export function setObHttpClient(client: ObHttp) {
  httpClient = client;
}

export function getObHttpClient(): ObHttp {
  if (!httpClient) {
    throw new Error("[portal] ObHttpClient 未初始化，请先在启动阶段调用 setObHttpClient().");
  }
  return httpClient;
}
