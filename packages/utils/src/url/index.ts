/**
 * URL处理工具函数
 * @description 提供URL参数处理、解析、构建等功能
 */

/**
 * 向URL添加参数
 * @param url - 原始URL
 * @param key - 参数键名
 * @param value - 参数值
 * @param paramStr - 自定义参数字符串（可选）
 * @returns 添加参数后的URL
 * 
 * @example
 * ```typescript
 * addUrlParam('https://example.com', 'id', '123')
 * // => 'https://example.com?id=123'
 * 
 * addUrlParam('https://example.com?name=test', 'id', '123')
 * // => 'https://example.com?name=test&id=123'
 * 
 * addUrlParam('https://example.com', undefined, undefined, 'token=abc&user=123')
 * // => 'https://example.com?token=abc&user=123'
 * ```
 */
export function addUrlParam(
  url: string,
  key?: string,
  value?: string,
  paramStr?: string
): string {
  if (!url) return ''
  
  const str = paramStr || (key && value ? `${key}=${encodeURIComponent(value)}` : '')
  if (!str) return url
  
  const sign = url.includes('?') ? '&' : '?'
  return `${url}${sign}${str}`
}

/**
 * 解析URL参数为对象
 * @param url - 要解析的URL
 * @returns 参数对象
 * 
 * @example
 * ```typescript
 * parseUrlParams('https://example.com?name=test&id=123')
 * // => { name: 'test', id: '123' }
 * ```
 */
export function parseUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {}
  
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.forEach((value, key) => {
      params[key] = decodeURIComponent(value)
    })
  } catch (error) {
    // 如果URL格式不正确，尝试从查询字符串解析
    const queryString = url.includes('?') ? url.split('?')[1] : ''
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=')
        if (key) {
          params[decodeURIComponent(key)] = decodeURIComponent(value || '')
        }
      })
    }
  }
  
  return params
}

/**
 * 从URL中移除指定参数
 * @param url - 原始URL
 * @param key - 要移除的参数键名
 * @returns 移除参数后的URL
 * 
 * @example
 * ```typescript
 * removeUrlParam('https://example.com?name=test&id=123', 'id')
 * // => 'https://example.com?name=test'
 * ```
 */
export function removeUrlParam(url: string, key: string): string {
  if (!url || !key) return url
  
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.delete(key)
    return urlObj.toString()
  } catch (error) {
    // 降级处理
    const [baseUrl, queryString] = url.split('?')
    if (!queryString) return url
    
    const params = queryString
      .split('&')
      .filter(param => !param.startsWith(`${key}=`))
    
    return params.length > 0 ? `${baseUrl}?${params.join('&')}` : baseUrl
  }
}

/**
 * 更新URL参数
 * @param url - 原始URL
 * @param key - 参数键名
 * @param value - 新的参数值
 * @returns 更新参数后的URL
 * 
 * @example
 * ```typescript
 * updateUrlParam('https://example.com?id=123', 'id', '456')
 * // => 'https://example.com?id=456'
 * ```
 */
export function updateUrlParam(url: string, key: string, value: string): string {
  if (!url || !key) return url
  
  const urlWithoutParam = removeUrlParam(url, key)
  return addUrlParam(urlWithoutParam, key, value)
}

/**
 * 构建查询字符串
 * @param params - 参数对象
 * @returns 查询字符串
 * 
 * @example
 * ```typescript
 * buildQueryString({ name: 'test', id: '123' })
 * // => 'name=test&id=123'
 * ```
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  
  return searchParams.toString()
}

/**
 * 判断是否为有效的URL
 * @param url - 要验证的URL字符串
 * @returns 是否为有效URL
 * 
 * @example
 * ```typescript
 * isValidUrl('https://example.com') // => true
 * isValidUrl('not-a-url') // => false
 * ```
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 获取URL的域名
 * @param url - URL字符串
 * @returns 域名
 * 
 * @example
 * ```typescript
 * getDomain('https://www.example.com/path?query=1')
 * // => 'www.example.com'
 * ```
 */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

/**
 * 获取URL的路径部分
 * @param url - URL字符串
 * @returns 路径
 * 
 * @example
 * ```typescript
 * getPath('https://example.com/path/to/page?query=1')
 * // => '/path/to/page'
 * ```
 */
export function getPath(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return ''
  }
}
