import { isEqual, isBoolean, isUrl, shouldShowHomeTag, filterHomeTagIfNeeded } from './index'
import type { TagItem } from '../types'
import { ensureHomeTagExists, configManager } from '../config/configManager'

/**
 * 验证标签是否有效
 */
export function isValidTag(tag: any): tag is TagItem {
  if (!tag || typeof tag !== 'object') return false

  // 必须有 path
  if (!tag.path || typeof tag.path !== 'string') return false

  // 必须有 meta 对象
  if (!tag.meta || typeof tag.meta !== 'object') return false

  // meta 必须有 title
  if (!tag.meta.title || typeof tag.meta.title !== 'string') return false

  return true
}

/**
 * 验证标签列表
 */
export function validateTagList(tags: any[]): TagItem[] {
  if (!Array.isArray(tags)) return []

  return tags.filter(isValidTag)
}

/**
 * 过滤有效标签
 */
export function filterValidTags(tags: any[]): TagItem[] {
  return validateTagList(tags)
}

/**
 * 确保首页标签存在（根据 hideHome 配置）
 */
export function ensureHomeTag(tags: TagItem[]): TagItem[] {
  // 如果配置了隐藏首页，则不添加首页标签
  if (!shouldShowHomeTag()) {
    return tags.filter((tag) => tag.path !== configManager.getHomePath())
  }

  // 否则确保首页标签存在
  return ensureHomeTagExists(tags)
}

/**
 * 根据 hideHome 配置过滤首页标签
 */
export function filterHomeTagByConfig(tags: TagItem[]): TagItem[] {
  return filterHomeTagIfNeeded(tags)
}

/**
 * 检查两个标签是否相同
 */
export function isSameTag(tag1: TagItem | null, tag2: TagItem | null): boolean {
  if (!tag1 || !tag2) return false

  return (
    tag1.path === tag2.path &&
    isEqual(tag1.query || {}, tag2.query || {}) &&
    isEqual(tag1.params || {}, tag2.params || {})
  )
}

/**
 * 验证标签路径
 */
export function validateTagPath(path: string): boolean {
  if (!path || typeof path !== 'string') return false

  // 检查是否为有效路径格式
  if (!path.startsWith('/')) return false

  // 检查是否为URL（不允许外部链接作为标签）
  if (isUrl(path)) return false

  return true
}

/**
 * 验证标签配置
 */
export function validateTagConfig(config: any): boolean {
  if (!config || typeof config !== 'object') return false

  // 验证必需字段
  if (!config.path || !validateTagPath(config.path)) return false
  if (!config.meta || typeof config.meta !== 'object') return false
  if (!config.meta.title || typeof config.meta.title !== 'string') return false

  return true
}

/**
 * 清理无效标签
 */
export function cleanInvalidTags(tags: any[]): TagItem[] {
  if (!Array.isArray(tags)) return []

  return tags.filter(isValidTag).filter((tag) => validateTagPath(tag.path))
}

/**
 * 验证标签是否可关闭
 */
export function isClosableTag(tag: TagItem): boolean {
  if (!tag) return false

  // 首页不可关闭
  if (tag.path === configManager.getHomePath()) return false

  // 检查 meta 中的 closable 属性
  if (isBoolean(tag.meta?.closable)) {
    return tag.meta.closable
  }

  // 默认可关闭
  return true
}

/**
 * 验证标签是否可缓存
 */
export function isCacheableTag(tag: TagItem): boolean {
  if (!tag) return false

  // 检查 meta 中的 keepAlive 属性
  if (isBoolean(tag.meta?.keepAlive)) {
    return tag.meta.keepAlive
  }

  // 默认不缓存
  return false
}
