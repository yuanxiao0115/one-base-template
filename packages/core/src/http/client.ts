import axios, { type AxiosError, type AxiosInstance } from 'axios';

export interface HttpClientOptions {
  baseURL?: string;
  withCredentials?: boolean;
  timeoutMs?: number;
  /** 401 时回调（例如跳转登录/清状态） */
  onUnauthorized?: () => void;
}

/**
 * 创建一个默认的 Axios 实例。
 *
 * - 默认 `withCredentials=true` 以支持 Cookie(HttpOnly) 模式
 * - 默认直接返回 `response.data`
 */
export function createHttpClient(options: HttpClientOptions = {}): AxiosInstance {
  const instance = axios.create({
    baseURL: options.baseURL,
    withCredentials: options.withCredentials ?? true,
    timeout: options.timeoutMs ?? 30_000,
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    }
  });

  instance.interceptors.response.use(
    response => response.data,
    (error: AxiosError) => {
      const status = error.response?.status;
      if (status === 401) {
        options.onUnauthorized?.();
      }
      return Promise.reject(error);
    }
  );

  return instance;
}
