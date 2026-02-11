import type { AxiosError, AxiosRequestConfig, AxiosResponse, Method } from 'axios';

export type RequestMethods = Extract<
  Method,
  'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'
>;

export type ObAuthMode = 'cookie' | 'token' | 'mixed';

export type ObBizCode = number | string;

export interface ObBizResultShape {
  code?: ObBizCode;
  message?: string;
  data?: unknown;
}

export interface ObHttpError extends AxiosError {
  isCancelRequest?: boolean;
}

export interface ObHttpRequestConfig extends AxiosRequestConfig {
  /** 上传接口：自动切换 multipart/form-data */
  $isUpload?: boolean;
  /** 下载接口：自动切换 responseType=blob，并按需自动触发下载 */
  $isDownload?: boolean;
  /** token 模式下：使用本次请求显式传入的 token（见 token 字段） */
  $isAuth?: boolean;
  /** 业务错误时不弹错（交由业务自行处理） */
  $noErrorAlert?: boolean;
  /** 返回原始 AxiosResponse（默认返回 response.data） */
  $rawResponse?: boolean;
  /** 强制业务码错误抛异常（默认不抛，保持旧项目习惯） */
  $throwOnBizError?: boolean;

  /** $isAuth=true 时使用的 token */
  token?: string;

  /** 仅在 $isDownload=true 且 autoDownload=true 时使用 */
  $downloadFileName?: string;

  /** 请求前回调（优先级：单次请求 > 全局） */
  beforeRequestCallback?: (config: ObHttpRequestConfig) => void;
  /** 响应后回调（优先级：单次请求 > 全局） */
  beforeResponseCallback?: (response: AxiosResponse) => void;
}

export interface ObHttpHooks {
  /** 请求开始（可接入 NProgress/全局 loading 等） */
  onRequestStart?: (config: ObHttpRequestConfig) => void;
  /** 请求结束（无论成功/失败都会触发） */
  onRequestEnd?: (config: ObHttpRequestConfig) => void;

  /** HTTP 401（或业务码触发登出） */
  onUnauthorized?: (ctx: { by: 'http-status' | 'biz-code'; code?: ObBizCode }) => void;

  /** 业务错误（code != successCodes） */
  onBizError?: (ctx: {
    code: ObBizCode | undefined;
    message: string;
    data: unknown;
    config: ObHttpRequestConfig;
    response?: AxiosResponse;
  }) => void;

  /** 网络/请求层错误（timeout、断网、5xx 等） */
  onNetworkError?: (error: ObHttpError) => void;

  /** 自动下载触发点（可自定义下载方式） */
  onAutoDownload?: (ctx: {
    blob: Blob;
    fileName: string;
    config: ObHttpRequestConfig;
    response: AxiosResponse;
  }) => void;
}

export interface ObHttpAuthOptions {
  mode?: ObAuthMode;
  /** token header 名称，默认 Authorization */
  tokenHeader?: string;
  /** token 前缀（如 Bearer），默认空字符串 */
  tokenPrefix?: string;
  /** 获取 token 的方法（用于 token/mixed 模式） */
  getToken?: () => string | undefined;
}

export interface ObHttpBizOptions {
  /** 判断是否是“业务码响应” */
  isBizResponse?: (data: unknown, response: AxiosResponse) => boolean;
  /** 读取业务 code */
  getCode?: (data: unknown) => ObBizCode | undefined;
  /** 读取业务 message */
  getMessage?: (data: unknown) => string | undefined;
  /** 成功码集合，默认 [0, 200]（兼容不同后端） */
  successCodes?: ObBizCode[];
  /** 需要触发登出/跳登录的业务码集合 */
  logoutCodes?: ObBizCode[];
  /** 业务码错误是否抛异常（默认 false，保持旧项目习惯） */
  throwOnBizError?: boolean;
}

export interface ObHttpDownloadOptions {
  /** 是否自动触发下载（用户已确认默认 true） */
  autoDownload?: boolean;
  /**
   * 当 responseType=blob 且疑似返回 JSON 错误时，允许探测并解析的最大体积（字节）。
   * 默认 1MB，避免误把大文件读入内存。
   */
  maxJsonProbeSize?: number;
  /** 未指定文件名时的兜底名称 */
  defaultFileName?: string;
}

export interface CreateObHttpOptions {
  axios?: AxiosRequestConfig;
  auth?: ObHttpAuthOptions;
  biz?: ObHttpBizOptions;
  download?: ObHttpDownloadOptions;
  hooks?: ObHttpHooks;

  /** 全局回调（保持与旧项目 PureHttp.initConfig 类似的能力） */
  beforeRequestCallback?: (config: ObHttpRequestConfig) => void;
  beforeResponseCallback?: (response: AxiosResponse) => void;
}
