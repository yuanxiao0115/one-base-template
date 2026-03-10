import type { ObHttp } from './pureHttp';

let httpClient: ObHttp | null = null;

export function setObHttpClient(client: ObHttp) {
  httpClient = client;
}

export function getObHttpClient(): ObHttp {
  if (!httpClient) {
    throw new Error('[core] ObHttpClient 未初始化，请先在应用启动阶段调用 setObHttpClient().');
  }
  return httpClient;
}
