/**
 * Tag组件工具函数
 */

export function isBoolean(val: any): val is boolean {
  return typeof val === 'boolean'
}

export function isUrl(val: string): boolean {
  try {
    new URL(val)
    return true
  } catch {
    return false
  }
}

/**
 * 深度比较两个值是否相等
 */
export function isEqual(a: any, b: any): boolean {
  if (a === b) return true

  if (a == null || b == null) return a === b

  if (typeof a !== typeof b) return false

  if (typeof a !== 'object') return a === b

  if (Array.isArray(a) !== Array.isArray(b)) return false

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false
    }
    return true
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!isEqual(a[key], b[key])) return false
  }

  return true
}

/**
 * 创建存储操作对象
 */
function createStorage(storage: Storage) {
  return {
    getItem<T = any>(key: string): T | null {
      try {
        const item = storage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch {
        return null
      }
    },

    setItem(key: string, value: any): void {
      try {
        storage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error('Storage setItem error:', error)
      }
    },

    removeItem(key: string): void {
      try {
        storage.removeItem(key)
      } catch (error) {
        console.error('Storage removeItem error:', error)
      }
    },

    clear(): void {
      try {
        storage.clear()
      } catch (error) {
        console.error('Storage clear error:', error)
      }
    },
  }
}

export function storageSession() {
  return createStorage(sessionStorage)
}

export function storageLocal() {
  return createStorage(localStorage)
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

export function delay(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
export function useTimeoutFn(
  fn: () => void,
  delay: number,
): { start: () => void; stop: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null

  const start = () => {
    stop()
    timer = setTimeout(fn, delay)
  }

  const stop = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return { start, stop }
}
export function getKeyList<T extends Record<string, any>, K extends keyof T>(
  arr: T[],
  key: K,
): T[K][] {
  return arr.map((item) => item[key])
}
export function useResizeObserver(target: any, callback: (entries: ResizeObserverEntry[]) => void) {
  if (typeof ResizeObserver === 'undefined') {
    console.warn('ResizeObserver is not supported')
    return { stop: () => {} }
  }

  const observer = new ResizeObserver(callback)

  const observe = () => {
    const el = target?.value || target
    if (el && el instanceof Element) {
      observer.observe(el)
    }
  }

  const stop = () => {
    observer.disconnect()
  }

  // 立即开始观察
  observe()

  return { stop }
}
export function createSimpleRefresh(router: any, redirectPrefix: string = '/redirect') {
  return (route: any) => {
    const { fullPath, query } = route
    router.replace({
      path: redirectPrefix + fullPath,
      query,
    })
  }
}

// ===== 配置相关工具函数 =====

import { configManager } from '../config/configManager'

/**
 * 判断是否应该显示首页标签
 * 逻辑：同时配置了 homePath 和 homeTitle 才显示首页标签
 */
export function shouldShowHomeTag(): boolean {
  return configManager.shouldShowHomeTag()
}

/**
 * 根据配置过滤首页标签
 * 如果不应该显示首页标签，则过滤掉首页标签
 */
export function filterHomeTagIfNeeded<T extends { path: string }>(tags: T[]): T[] {
  return configManager.shouldShowHomeTag()
    ? tags
    : tags.filter((tag) => tag.path !== configManager.getHomePath())
}

/**
 * 判断是否为首页标签
 */
export function isHomeTag(tag: { path: string }): boolean {
  return configManager.isHomePath(tag.path)
}
