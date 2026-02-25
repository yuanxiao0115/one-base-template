/**
 * 加载状态管理 Hook
 * @description 提供通用的加载状态管理功能，支持全局和局部loading状态
 */

import { ref, type Ref } from 'vue'

/**
 * 加载状态管理选项
 */
export interface UseLoadingOptions {
  /** 初始加载状态 */
  initialValue?: boolean
  /** 是否为全局loading */
  global?: boolean
}

/**
 * 加载状态管理返回值
 */
export interface UseLoadingReturn {
  /** 加载状态 */
  loading: Ref<boolean>
  /** 设置加载状态 */
  setLoading: (value: boolean) => void
  /** 切换加载状态 */
  toggle: () => void
  /** 开始加载 */
  start: () => void
  /** 结束加载 */
  end: () => void
  /** 异步操作包装器 */
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>
}

// 全局loading状态
const globalLoading: Ref<boolean> = ref(false)

/**
 * 加载状态管理 Hook
 * @param options - 配置选项
 * @returns 加载状态管理对象
 * 
 * @example
 * ```typescript
 * // 基础用法
 * const { loading, setLoading, toggle } = useLoading()
 * 
 * // 全局loading
 * const { loading, start, end } = useLoading({ global: true })
 * 
 * // 异步操作包装
 * const { withLoading } = useLoading()
 * await withLoading(async () => {
 *   await api.getData()
 * })
 * ```
 */
export function useLoading(options: UseLoadingOptions = {}): UseLoadingReturn {
  const { initialValue = false, global = false } = options
  
  // 使用全局loading或创建新的loading状态
  const loading = global ? globalLoading : ref(initialValue)
  
  /**
   * 设置加载状态
   * @param value - 加载状态值
   */
  const setLoading = (value: boolean): void => {
    loading.value = value
  }
  
  /**
   * 切换加载状态
   */
  const toggle = (): void => {
    loading.value = !loading.value
  }
  
  /**
   * 开始加载
   */
  const start = (): void => {
    loading.value = true
  }
  
  /**
   * 结束加载
   */
  const end = (): void => {
    loading.value = false
  }
  
  /**
   * 异步操作包装器
   * @param fn - 异步函数
   * @returns Promise结果
   */
  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      start()
      return await fn()
    } finally {
      end()
    }
  }
  
  return {
    loading,
    setLoading,
    toggle,
    start,
    end,
    withLoading
  }
}

/**
 * 获取全局loading状态
 * @returns 全局loading状态
 */
export function getGlobalLoading(): Ref<boolean> {
  return globalLoading
}

/**
 * 设置全局loading状态
 * @param value - 加载状态值
 */
export function setGlobalLoading(value: boolean): void {
  globalLoading.value = value
}

export default useLoading
