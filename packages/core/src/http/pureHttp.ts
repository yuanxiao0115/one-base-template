import Axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { stringify } from 'qs';

import type { CreateObHttpOptions, ObBizCode, ObHttpError, ObHttpRequestConfig, RequestMethods } from './types';

export interface ObHttp {
  axios: AxiosInstance;

  request<T = unknown>(
    method: RequestMethods,
    url: string,
    param?: ObHttpRequestConfig,
    axiosConfig?: ObHttpRequestConfig
  ): Promise<T>;

  get<T = unknown>(url: string, config?: ObHttpRequestConfig): Promise<T>;
  post<T = unknown>(url: string, config?: ObHttpRequestConfig): Promise<T>;
  put<T = unknown>(url: string, config?: ObHttpRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: ObHttpRequestConfig): Promise<T>;
}

class ObBizError extends Error {
  code?: ObBizCode;
  data?: unknown;

  constructor(message: string, options: { code?: ObBizCode; data?: unknown } = {}) {
    super(message);
    this.name = 'ObBizError';
    this.code = options.code;
    this.data = options.data;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isBizCode(value: unknown): value is ObBizCode {
  return typeof value === 'number' || typeof value === 'string';
}

function normalizeHeaders(input: ObHttpRequestConfig['headers']): Record<string, string> {
  if (!input) return {};
  if (typeof input === 'object' && input !== null) {
    return input as unknown as Record<string, string>;
  }
  return {};
}

function setHeader(config: ObHttpRequestConfig, key: string, value: string) {
  const headers = normalizeHeaders(config.headers);
  headers[key] = value;
  config.headers = headers;
}

function getHeader(headers: unknown, key: string): string | undefined {
  if (!headers) return undefined;
  if (!isRecord(headers)) return undefined;

  // AxiosHeaders: get(name) -> string
  const getter = (headers as { get?: unknown }).get;
  if (typeof getter === 'function') {
    const v = (getter as (name: string) => unknown)(key);
    return typeof v === 'string' ? v : undefined;
  }

  const direct = headers[key] ?? headers[key.toLowerCase()];
  return typeof direct === 'string' ? direct : undefined;
}

function parseContentDispositionFileName(headerValue: string | undefined): string | undefined {
  if (!headerValue) return undefined;

  // RFC5987: filename*=UTF-8''xxxx
  const m1 = /filename\*\s*=\s*([^']*)''([^;]+)/i.exec(headerValue);
  if (m1) {
    const encoding = (m1[1] || '').toLowerCase();
    const raw = m1[2];
    if (!raw) return undefined;
    try {
      const decoded = decodeURIComponent(raw);
      return encoding && encoding !== 'utf-8' ? decoded : decoded;
    } catch {
      return raw;
    }
  }

  // filename="xxx"
  const m2 = /filename\s*=\s*"([^"]+)"/i.exec(headerValue);
  const v2 = m2?.[1];
  if (v2) return v2;

  // filename=xxx
  const m3 = /filename\s*=\s*([^;]+)/i.exec(headerValue);
  const v3 = m3?.[1];
  if (v3) return v3.trim();

  return undefined;
}

function defaultDownloadFileName(url: string, fallback: string): string {
  try {
    const u = new URL(url, window.location.origin);
    const last = u.pathname.split('/').filter(Boolean).pop();
    return last || fallback;
  } catch {
    return fallback;
  }
}

function defaultAutoDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function tryParseBlobJson(
  blob: Blob,
  response: AxiosResponse,
  options: { maxJsonProbeSize: number }
): Promise<{ json: true; data: unknown } | { json: false }> {
  const contentType = getHeader(response.headers, 'content-type') ?? blob.type;
  const mayBeJson =
    contentType.includes('application/json') ||
    contentType.includes('text/json') ||
    contentType.includes('application/problem+json');

  // 有些后端会返回 application/octet-stream 但内容其实是 JSON 错误；这里做有限探测
  const shouldProbe = mayBeJson || blob.size <= options.maxJsonProbeSize;
  if (!shouldProbe) return { json: false };

  try {
    const text = await blob.text();
    const parsed = JSON.parse(text) as unknown;
    return { json: true, data: parsed };
  } catch {
    return { json: false };
  }
}

export function createObHttp(options: CreateObHttpOptions = {}): ObHttp {
  const instance = Axios.create({
    timeout: 30_000,
    withCredentials: true,
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    paramsSerializer: {
      // 兼容旧项目：数组参数序列化由 qs 处理
      serialize: params => stringify(params)
    },
    ...(options.axios ?? {})
  });

  const hooks = options.hooks ?? {};

  const authMode = options.auth?.mode ?? 'cookie';
  const tokenHeader = options.auth?.tokenHeader ?? 'Authorization';
  const tokenPrefix = options.auth?.tokenPrefix ?? '';
  const getToken = options.auth?.getToken;

  const biz = options.biz ?? {};
  const isBizResponse =
    biz.isBizResponse ??
    ((data: unknown) => isRecord(data) && 'code' in data);

  const getCode =
    biz.getCode ??
    ((data: unknown) => {
      if (!isRecord(data)) return undefined;
      const code = data.code;
      return isBizCode(code) ? code : undefined;
    });

  const getMessage =
    biz.getMessage ??
    ((data: unknown) => {
      if (!isRecord(data)) return undefined;
      const msg = data.message;
      return typeof msg === 'string' ? msg : undefined;
    });

  const successCodes = biz.successCodes ?? [200];
  const logoutCodes = biz.logoutCodes ?? [-401, -402, 401, 1000, 1003, 1020];

  const download = {
    autoDownload: options.download?.autoDownload ?? true,
    maxJsonProbeSize: options.download?.maxJsonProbeSize ?? 1024 * 1024,
    defaultFileName: options.download?.defaultFileName ?? 'download'
  };

  async function requestInternal<T>(config: ObHttpRequestConfig): Promise<T> {
    hooks.onRequestStart?.(config);

    // token / cookie 混合模式：根据配置决定是否附加 Authorization
    if (authMode === 'token' || authMode === 'mixed') {
      const token = config.$isAuth ? config.token : getToken?.();
      if (token) {
        setHeader(config, tokenHeader, `${tokenPrefix}${token}`);
      }
    }

    if (config.$isUpload) {
      // FormData 场景不建议手动拼 boundary，这里仅声明 multipart 类型
      setHeader(config, 'Content-Type', 'multipart/form-data');
    } else if (!getHeader(config.headers, 'content-type') && !getHeader(config.headers, 'Content-Type')) {
      setHeader(config, 'Content-Type', 'application/json');
    }

    if (config.$isDownload) {
      config.responseType = 'blob';
    }

    // 单次请求回调优先
    if (typeof config.beforeRequestCallback === 'function') {
      config.beforeRequestCallback(config);
    } else if (typeof options.beforeRequestCallback === 'function') {
      options.beforeRequestCallback(config);
    }

    try {
      const response = await instance.request(config);

      // 单次响应回调优先
      if (typeof config.beforeResponseCallback === 'function') {
        config.beforeResponseCallback(response);
      } else if (typeof options.beforeResponseCallback === 'function') {
        options.beforeResponseCallback(response);
      }

      if (config.$rawResponse) return response as unknown as T;

      let data: unknown = response.data;

      // 下载：Blob 可能实际是 JSON 错误，需要先探测
      if (config.$isDownload && data instanceof Blob) {
        const parsed = await tryParseBlobJson(data, response, {
          maxJsonProbeSize: download.maxJsonProbeSize
        });

        if (parsed.json) {
          data = parsed.data;
        } else if (download.autoDownload) {
          const fileName =
            config.$downloadFileName ||
            parseContentDispositionFileName(getHeader(response.headers, 'content-disposition')) ||
            defaultDownloadFileName(config.url || '', download.defaultFileName);

          if (hooks.onAutoDownload) {
            hooks.onAutoDownload({ blob: data, fileName, config, response });
          } else {
            defaultAutoDownload(data, fileName);
          }
        }
      }

      // 业务码：默认不抛异常，保持旧项目习惯；允许按配置/单次请求强制抛出
      if (isBizResponse(data, response)) {
        const code = getCode(data);
        const ok = code !== undefined && successCodes.includes(code);
        if (!ok) {
          const msg = getMessage(data) || '请求失败';

          if (!config.$noErrorAlert) {
            hooks.onBizError?.({ code, message: msg, data, config, response });
          }

          if (code !== undefined && logoutCodes.includes(code)) {
            hooks.onUnauthorized?.({ by: 'biz-code', code });
          }

          const shouldThrow = config.$throwOnBizError ?? biz.throwOnBizError ?? false;
          if (shouldThrow) {
            throw new ObBizError(msg, { code, data });
          }
        }
      }

      return data as T;
    } catch (error: unknown) {
      const obError = error as ObHttpError;
      obError.isCancelRequest = Axios.isCancel(obError);

      const status = obError.response?.status;
      if (status === 401) {
        hooks.onUnauthorized?.({ by: 'http-status', code: 401 });
      }

      hooks.onNetworkError?.(obError);
      throw obError;
    } finally {
      hooks.onRequestEnd?.(config);
    }
  }

  const http: ObHttp = {
    axios: instance,
    request<T = unknown>(
      method: RequestMethods,
      url: string,
      param?: ObHttpRequestConfig,
      axiosConfig?: ObHttpRequestConfig
    ): Promise<T> {
      const config = {
        method,
        url,
        ...(param ?? {}),
        ...(axiosConfig ?? {})
      } as ObHttpRequestConfig;

      return requestInternal<T>(config);
    },
    get<T = unknown>(url: string, config?: ObHttpRequestConfig): Promise<T> {
      return http.request<T>('get', url, config);
    },
    post<T = unknown>(url: string, config?: ObHttpRequestConfig): Promise<T> {
      return http.request<T>('post', url, config);
    },
    put<T = unknown>(url: string, config?: ObHttpRequestConfig): Promise<T> {
      return http.request<T>('put', url, config);
    },
    delete<T = unknown>(url: string, config?: ObHttpRequestConfig): Promise<T> {
      return http.request<T>('delete', url, config);
    }
  };

  return http;
}
