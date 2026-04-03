import type { RequestConfig } from '@one-base-template/core';

/** HTTP 请求策略配置 */
export const request: RequestConfig = {
  /** 不同后端的默认超时时间 */
  timeout: {
    /** basic 后端超时（毫秒） */
    basic: 100_000,
    /** default 后端超时（毫秒） */
    default: 30_000
  },
  /** 鉴权请求头配置 */
  auth: {
    /** token 请求头名称 */
    tokenHeader: 'Authorization',
    /** token 前缀 */
    tokenPrefix: ''
  },
  /** 业务成功码集合（兼容 zfw legacy code=1） */
  successCodes: [0, 1, 200],
  /** 网络错误提示文案 */
  networkMsg: {
    /** 未知错误提示 */
    unknown: '网络异常，请稍后重试',
    /** 超时错误提示 */
    timeout: '请求超时，请稍后重试',
    /** 离线错误提示 */
    offline: '网络连接异常，请检查网络后重试',
    /** 服务端错误提示 */
    serverError: '服务异常，请稍后重试',
    /** 兜底错误提示 */
    fallback: '请求失败，请稍后重试'
  }
};
