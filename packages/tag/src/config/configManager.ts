import type { TagItem } from '../types'

/**
 * 路由忽略规则配置
 */
export interface RouteIgnoreRule {
  /** 路径匹配 */
  path?: string
  /** 路径包含匹配 */
  pathIncludes?: string
  /** 路由名称匹配 */
  name?: string
  /** 自定义判断函数 */
  test?: (route: any) => boolean
}

/**
 * 标签页配置选项
 */
export interface TagConfig {
  /** 首页路径 - 为空则不显示首页标签 */
  homePath?: string
  /** 首页标题 - 为空则不显示首页标签 */
  homeTitle?: string
  /** 默认标签列表 */
  defaultTags?: any[]
  /** 存储类型 */
  storageType?: 'session' | 'local'
  /** 存储键名 */
  storageKey?: string
  /** 需要忽略的路由规则 */
  ignoredRoutes?: RouteIgnoreRule[]
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<TagConfig> = {
  homePath: '/home/index',
  homeTitle: '首页',
  defaultTags: [],
  storageType: 'session' as const,
  storageKey: 'tags',
  ignoredRoutes: [
    // 默认忽略的路由
    { path: '/login' },
    { path: '/frontLogin' },
    { pathIncludes: '/error' },
    { pathIncludes: '/404' },
    { pathIncludes: '/redirect' }, // 忽略重定向路由
    { path: '/' },
    { path: '/sso' },
    { path: '' },
    { name: 'Login' },
  ],
}

/**
 * 配置变更监听器类型
 */
type ConfigChangeListener = (config: Required<TagConfig>) => void

/**
 * 统一配置管理器
 * 负责管理所有标签页相关的配置，提供统一的配置获取和更新接口
 */
class ConfigManager {
  private config: Required<TagConfig>
  private listeners: Set<ConfigChangeListener> = new Set()

  constructor() {
    this.config = { ...DEFAULT_CONFIG }
  }

  /**
   * 获取当前完整配置
   */
  getConfig(): Required<TagConfig> {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<TagConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // 通知所有监听器
    this.listeners.forEach((listener) => {
      try {
        listener(this.getConfig())
      } catch (error) {
        console.warn('配置变更监听器执行失败:', error)
      }
    })
  }

  /**
   * 重置为默认配置
   */
  resetConfig(): void {
    this.updateConfig(DEFAULT_CONFIG)
  }

  /**
   * 添加配置变更监听器
   */
  addChangeListener(listener: ConfigChangeListener): () => void {
    this.listeners.add(listener)

    // 返回取消监听的函数
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * 移除所有监听器
   */
  clearListeners(): void {
    this.listeners.clear()
  }

  // ===== 便捷的配置获取方法 =====

  /**
   * 获取首页路径
   */
  getHomePath(): string {
    return this.config.homePath
  }

  /**
   * 获取首页标题
   */
  getHomeTitle(): string {
    return this.config.homeTitle
  }

  /**
   * 获取默认标签列表
   */
  getDefaultTags(): any[] {
    return [...this.config.defaultTags]
  }

  /**
   * 获取存储类型
   */
  getStorageType(): 'session' | 'local' {
    return this.config.storageType
  }

  /**
   * 获取存储键名
   */
  getStorageKey(): string {
    return this.config.storageKey
  }

  /**
   * 获取忽略路由规则
   */
  getIgnoredRoutes(): RouteIgnoreRule[] {
    return [...this.config.ignoredRoutes]
  }

  /**
   * 判断是否应该显示首页标签
   * 逻辑：同时配置了 homePath 和 homeTitle 才显示首页标签
   */
  shouldShowHomeTag(): boolean {
    return !!(this.config.homePath && this.config.homeTitle)
  }

  /**
   * 创建首页标签（动态配置）
   */
  createHomeTag(): TagItem {
    return {
      path: this.config.homePath,
      // name 字段应该是路由名称，不是标题，这里不设置 name
      // 让 tagOnClick 使用 path 进行路由跳转
      meta: {
        title: this.config.homeTitle,
      },
      query: {},
      params: {},
    }
  }

  /**
   * 判断是否为首页路径
   */
  isHomePath(path: string): boolean {
    return path === this.config.homePath
  }

  /**
   * 判断是否为首页标签
   */
  isHomeTag(tag: TagItem): boolean {
    return tag?.path === this.config.homePath
  }

  /**
   * 验证标签是否为首页
   */
  validateHomeTag(tag: any): boolean {
    return (
      tag &&
      typeof tag === 'object' &&
      tag.path === this.config.homePath &&
      tag.meta?.title === this.config.homeTitle
    )
  }
}

// ===== 全局配置管理器实例 =====

/**
 * 全局配置管理器实例
 */
export const configManager = new ConfigManager()

// ===== 主要API导出 =====

/**
 * 设置标签页配置
 * @param config 配置选项
 */
export function setConfig(config: TagConfig): void {
  configManager.updateConfig(config)
}

/**
 * 获取当前配置
 */
export function getConfig(): Required<TagConfig> {
  return configManager.getConfig()
}

// ===== 工具函数导出 =====

/**
 * 创建首页标签
 */
export function createHomeTag(): TagItem {
  return configManager.createHomeTag()
}

/**
 * 判断是否为首页路径
 */
export function isHomePath(path: string): boolean {
  return configManager.isHomePath(path)
}

/**
 * 判断是否为首页标签
 */
export function isHomeTag(tag: TagItem): boolean {
  return configManager.isHomeTag(tag)
}

/**
 * 获取首页路径
 */
export function getHomePath(): string {
  return configManager.getHomePath()
}

/**
 * 获取首页标题
 */
export function getHomeTitle(): string {
  return configManager.getHomeTitle()
}

/**
 * 验证标签是否为首页
 */
export function validateHomeTag(tag: any): boolean {
  return configManager.validateHomeTag(tag)
}

/**
 * 判断是否应该显示首页标签
 */
export function shouldShowHomeTag(): boolean {
  return configManager.shouldShowHomeTag()
}

/**
 * 确保标签列表包含首页
 */
export function ensureHomeTagExists(tags: TagItem[]): TagItem[] {
  const hasHome = tags.some((tag) => configManager.isHomeTag(tag))
  if (!hasHome) {
    return [configManager.createHomeTag(), ...tags]
  }
  return tags
}

/**
 * 过滤掉首页标签
 */
export function filterOutHomeTag(tags: TagItem[]): TagItem[] {
  return tags.filter((tag) => !configManager.isHomeTag(tag))
}

/**
 * 获取非首页标签数量
 */
export function getNonHomeTagCount(tags: TagItem[]): number {
  return filterOutHomeTag(tags).length
}

/**
 * 根据配置过滤首页标签
 * 如果不应该显示首页标签，则过滤掉首页标签
 */
export function filterHomeTagIfNeeded<T extends { path: string }>(tags: T[]): T[] {
  if (configManager.shouldShowHomeTag()) {
    return tags
  }

  // 过滤掉首页标签
  return tags.filter((tag) => tag.path !== configManager.getHomePath())
}
