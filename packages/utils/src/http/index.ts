/**
 * HTTP请求相关工具函数
 * @description 提供HTTP请求的通用工具和类型定义
 */

/**
 * 请求方法类型
 */
export type RequestMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

/**
 * HTTP响应接口
 */
export interface HttpResponse<T = any> {
  code: number
  data: T
  message: string
  success: boolean
}

/**
 * HTTP错误接口
 */
export interface HttpError {
  code: number
  message: string
  status?: number
  statusText?: string
}

/**
 * 请求配置接口
 */
export interface RequestConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  withCredentials?: boolean
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
}

/**
 * 请求拦截器接口
 */
export interface RequestInterceptor {
  request?: (config: any) => any
  requestError?: (error: any) => any
  response?: (response: any) => any
  responseError?: (error: any) => any
}

/**
 * 创建请求实例的工厂函数
 * @param config - 请求配置
 * @param interceptors - 拦截器配置
 * @returns 请求实例
 * 
 * @example
 * ```typescript
 * const request = createRequest({
 *   baseURL: 'https://api.example.com',
 *   timeout: 10000
 * }, {
 *   request: (config) => {
 *     // 添加token
 *     config.headers.Authorization = `Bearer ${getToken()}`
 *     return config
 *   },
 *   response: (response) => {
 *     // 统一处理响应
 *     if (response.data.code !== 200) {
 *       throw new Error(response.data.message)
 *     }
 *     return response.data
 *   }
 * })
 * ```
 */
export function createRequest(
  config: RequestConfig = {},
  interceptors: RequestInterceptor = {}
) {
  const baseConfig = { ...config }

  const runRequestInterceptor = (requestConfig: any) => {
    try {
      return interceptors.request ? interceptors.request(requestConfig) : requestConfig
    } catch (error) {
      if (interceptors.requestError) {
        return interceptors.requestError(error)
      }
      throw error
    }
  }

  const runResponseErrorInterceptor = (error: unknown) => {
    if (interceptors.responseError) {
      throw interceptors.responseError(error)
    }
    throw error
  }

  const request = (method: RequestMethods, url: string, options: any = {}) => {
    const mergedConfig = runRequestInterceptor({
      ...baseConfig,
      ...options,
      method,
      url
    })

    // 当前 utils 只迁移了统一接口定义，具体请求执行需业务侧按项目基座（如 axios）二次封装。
    void mergedConfig
    runResponseErrorInterceptor(
      new Error('[http] createRequest 当前为适配占位实现，请在业务侧注入具体请求库。')
    )
  }

  return {
    get: (url: string, options?: any) => request('GET', url, options),
    post: (url: string, data?: any, options?: any) => request('POST', url, { ...options, data }),
    put: (url: string, data?: any, options?: any) => request('PUT', url, { ...options, data }),
    delete: (url: string, options?: any) => request('DELETE', url, options),
    request
  }
}

/**
 * 构建查询字符串
 * @param params - 参数对象
 * @returns 查询字符串
 * 
 * @example
 * ```typescript
 * buildQueryString({ name: 'test', age: 25 })
 * // => 'name=test&age=25'
 * ```
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)))
      } else {
        searchParams.append(key, String(value))
      }
    }
  })
  
  return searchParams.toString()
}

/**
 * 解析查询字符串
 * @param queryString - 查询字符串
 * @returns 参数对象
 * 
 * @example
 * ```typescript
 * parseQueryString('name=test&age=25')
 * // => { name: 'test', age: '25' }
 * ```
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params: Record<string, string> = {}
  const searchParams = new URLSearchParams(queryString)
  
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  
  return params
}

/**
 * 格式化请求URL
 * @param baseURL - 基础URL
 * @param path - 路径
 * @param params - 查询参数
 * @returns 完整URL
 * 
 * @example
 * ```typescript
 * formatUrl('https://api.example.com', '/users', { page: 1, size: 10 })
 * // => 'https://api.example.com/users?page=1&size=10'
 * ```
 */
export function formatUrl(
  baseURL: string,
  path: string,
  params?: Record<string, any>
): string {
  let url = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
  url += path.startsWith('/') ? path : `/${path}`
  
  if (params && Object.keys(params).length > 0) {
    const queryString = buildQueryString(params)
    url += `?${queryString}`
  }
  
  return url
}

/**
 * 检查HTTP状态码是否成功
 * @param status - HTTP状态码
 * @returns 是否成功
 * 
 * @example
 * ```typescript
 * isHttpSuccess(200) // => true
 * isHttpSuccess(404) // => false
 * ```
 */
export function isHttpSuccess(status: number): boolean {
  return status >= 200 && status < 300
}

/**
 * 获取HTTP错误信息
 * @param status - HTTP状态码
 * @returns 错误信息
 * 
 * @example
 * ```typescript
 * getHttpErrorMessage(404) // => 'Not Found'
 * getHttpErrorMessage(500) // => 'Internal Server Error'
 * ```
 */
export function getHttpErrorMessage(status: number): string {
  const errorMessages: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
  }
  
  return errorMessages[status] || `HTTP Error ${status}`
}

/**
 * 重试请求工具
 * @param requestFn - 请求函数
 * @param maxRetries - 最大重试次数
 * @param delay - 重试延迟（毫秒）
 * @returns Promise
 * 
 * @example
 * ```typescript
 * const result = await retryRequest(
 *   () => fetch('/api/data'),
 *   3,
 *   1000
 * )
 * ```
 */
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error
      
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }
  
  throw lastError
}

/**
 * 请求超时工具
 * @param requestFn - 请求函数
 * @param timeout - 超时时间（毫秒）
 * @returns Promise
 * 
 * @example
 * ```typescript
 * const result = await withTimeout(
 *   () => fetch('/api/data'),
 *   5000
 * )
 * ```
 */
export function withTimeout<T>(
  requestFn: () => Promise<T>,
  timeout: number
): Promise<T> {
  return Promise.race([
    requestFn(),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    })
  ])
}

/**
 * 并发请求控制
 * @param requests - 请求函数数组
 * @param concurrency - 并发数
 * @returns Promise<结果数组>
 * 
 * @example
 * ```typescript
 * const requests = [
 *   () => fetch('/api/data1'),
 *   () => fetch('/api/data2'),
 *   () => fetch('/api/data3')
 * ]
 * 
 * const results = await concurrentRequests(requests, 2)
 * ```
 */
export async function concurrentRequests<T>(
  requests: (() => Promise<T>)[],
  concurrency: number = 3
): Promise<T[]> {
  const results: T[] = []
  const executing: Promise<any>[] = []
  
  for (const request of requests) {
    const promise = request().then(result => {
      results.push(result)
      executing.splice(executing.indexOf(promise), 1)
      return result
    })
    
    executing.push(promise)
    
    if (executing.length >= concurrency) {
      await Promise.race(executing)
    }
  }
  
  await Promise.all(executing)
  return results
}

/**
 * 请求缓存工具
 */
export class RequestCache {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private ttl: number

  constructor(ttl: number = 5 * 60 * 1000) { // 默认5分钟
    this.ttl = ttl
  }

  /**
   * 获取缓存
   * @param key - 缓存键
   * @returns 缓存数据
   */
  get(key: string): any {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  /**
   * 设置缓存
   * @param key - 缓存键
   * @param data - 缓存数据
   */
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * 删除缓存
   * @param key - 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }
}
