/**
 * Base64 字符集
 */
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/**
 * Base64 编码（兼容浏览器和Node.js环境）
 * @param str 要编码的字符串
 * @returns 编码后的字符串
 */
export function encode(str: string): string {
  // 优先使用原生方法（浏览器环境）
  if (typeof window !== 'undefined' && window.btoa) {
    return window.btoa(encodeURIComponent(str))
  }

  // Node.js环境或不支持btoa的环境
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(encodeURIComponent(str), 'utf8').toString('base64')
  }

  // 纯JavaScript实现（兼容性最好）
  const utf8Str = encodeURIComponent(str)
  let result = ''
  let i = 0

  while (i < utf8Str.length) {
    const a = utf8Str.charCodeAt(i++)
    const b = i < utf8Str.length ? utf8Str.charCodeAt(i++) : 0
    const c = i < utf8Str.length ? utf8Str.charCodeAt(i++) : 0

    const bitmap = (a << 16) | (b << 8) | c

    result += BASE64_CHARS.charAt((bitmap >> 18) & 63)
    result += BASE64_CHARS.charAt((bitmap >> 12) & 63)
    result += i - 2 < utf8Str.length ? BASE64_CHARS.charAt((bitmap >> 6) & 63) : '='
    result += i - 1 < utf8Str.length ? BASE64_CHARS.charAt(bitmap & 63) : '='
  }

  return result
}

/**
 * Base64 解码（兼容浏览器和Node.js环境）
 * @param str 要解码的字符串
 * @returns 解码后的字符串
 */
export function decode(str: string): string {
  // 优先使用原生方法（浏览器环境）
  if (typeof window !== 'undefined' && window.atob) {
    return decodeURIComponent(window.atob(str))
  }

  // Node.js环境
  if (typeof Buffer !== 'undefined') {
    return decodeURIComponent(Buffer.from(str, 'base64').toString('utf8'))
  }

  // 纯JavaScript实现（兼容性最好）
  let result = ''
  let i = 0

  // 移除非base64字符
  const cleanStr = str.replace(/[^A-Za-z0-9+/]/g, '')

  while (i < cleanStr.length) {
    const encoded1 = BASE64_CHARS.indexOf(cleanStr.charAt(i++))
    const encoded2 = BASE64_CHARS.indexOf(cleanStr.charAt(i++))
    const encoded3 = BASE64_CHARS.indexOf(cleanStr.charAt(i++))
    const encoded4 = BASE64_CHARS.indexOf(cleanStr.charAt(i++))

    const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4

    result += String.fromCharCode((bitmap >> 16) & 255)
    if (encoded3 !== 64) result += String.fromCharCode((bitmap >> 8) & 255)
    if (encoded4 !== 64) result += String.fromCharCode(bitmap & 255)
  }

  return decodeURIComponent(result)
}
