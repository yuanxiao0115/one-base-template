import type { TagItem, TagPosition, TagHandlerResult } from '../types'
import { TAG_OPERATION_MODES } from '../types'
import { isSameTag, isValidTag } from './validation'
import { isEqual } from './index'
import { isHomeTag, ensureHomeTagExists } from '../config/configManager'

/**
 * 查找标签索引
 */
export function findTagIndex(tags: TagItem[], target: TagItem): number {
  return tags.findIndex((tag) => isSameTag(tag, target))
}

/**
 * 根据路径查找标签索引
 */
export function findTagIndexByPath(tags: TagItem[], path: string): number {
  return tags.findIndex((tag) => tag.path === path)
}

/**
 * 关闭左侧标签
 */
export function closeLeftTags(tags: TagItem[], targetIndex: number): TagItem[] {
  const result = [...tags]
  for (let i = targetIndex - 1; i >= 1; i--) {
    const item = result[i]
    if (item && !isHomeTag(item)) {
      result.splice(i, 1)
      targetIndex--
    }
  }
  return result
}

/**
 * 关闭右侧标签
 */
export function closeRightTags(tags: TagItem[], targetIndex: number): TagItem[] {
  const result = [...tags]
  for (let i = result.length - 1; i > targetIndex; i--) {
    const item = result[i]
    if (item && !isHomeTag(item)) {
      result.splice(i, 1)
    }
  }
  return result
}

/**
 * 关闭其他标签（保留首页和目标标签）
 */
export function closeOtherTags(tags: TagItem[], targetTag: TagItem): TagItem[] {
  const result = tags.filter((tag) => isHomeTag(tag) || isSameTag(tag, targetTag))
  return ensureHomeTagExists(result)
}

/**
 * 处理 push 操作
 */
function handlePushOperation<T>(tags: TagItem[], value?: T | TagItem): TagHandlerResult<T> {
  if (!value || typeof value !== 'object') {
    return { updatedTags: tags, shouldCache: false }
  }

  const newTag = value as TagItem
  if (!isValidTag(newTag)) {
    console.warn('尝试添加无效标签:', newTag)
    return { updatedTags: tags, shouldCache: false }
  }

  // 检查是否已存在相同标签
  const existingIndex = findTagIndex(tags, newTag)
  if (existingIndex !== -1) {
    return { updatedTags: tags, shouldCache: false, result: tags as T }
  }

  const updatedTags = ensureHomeTagExists([...tags, newTag])
  return {
    updatedTags,
    shouldCache: true,
    result: updatedTags as T,
  }
}

/**
 * 处理 splice 操作
 */
function handleSpliceOperation<T>(
  tags: TagItem[],
  value?: T | TagItem,
  position?: TagPosition,
): TagHandlerResult<T> {
  if (!value || typeof value !== 'object') {
    return { updatedTags: tags, shouldCache: false }
  }

  const targetTag = value as TagItem
  const targetIndex = findTagIndex(tags, targetTag)

  if (targetIndex === -1) {
    return { updatedTags: tags, shouldCache: false }
  }

  let updatedTags = [...tags]

  if (position && typeof position === 'object' && 'position' in position) {
    // 批量删除操作
    switch (position.position) {
      case 'left':
        updatedTags = closeLeftTags(updatedTags, targetIndex)
        break
      case 'right':
        updatedTags = closeRightTags(updatedTags, targetIndex)
        break
      case 'other':
        updatedTags = closeOtherTags(updatedTags, targetTag)
        break
      default:
        console.warn('未知的位置参数:', position.position)
        return { updatedTags: tags, shouldCache: false }
    }
  } else {
    // 单个删除操作
    if (isHomeTag(targetTag)) {
      console.warn('不能删除首页标签')
      return { updatedTags: tags, shouldCache: false }
    }
    updatedTags.splice(targetIndex, 1)
  }

  return {
    updatedTags: ensureHomeTagExists(updatedTags),
    shouldCache: true,
    result: updatedTags as T,
  }
}

/**
 * 处理 unshift 操作
 */
function handleUnshiftOperation<T>(tags: TagItem[], value?: T | TagItem): TagHandlerResult<T> {
  if (!value || typeof value !== 'object') {
    return { updatedTags: tags, shouldCache: false }
  }

  const newTag = value as TagItem
  if (!isValidTag(newTag)) {
    console.warn('尝试添加无效标签:', newTag)
    return { updatedTags: tags, shouldCache: false }
  }

  // 检查是否已存在相同标签
  const existingIndex = findTagIndex(tags, newTag)
  if (existingIndex !== -1) {
    return { updatedTags: tags, shouldCache: false, result: tags as T }
  }

  const updatedTags = ensureHomeTagExists([newTag, ...tags])
  return {
    updatedTags,
    shouldCache: true,
    result: updatedTags as T,
  }
}

/**
 * 处理 clear 操作
 */
function handleClearOperation<T>(): TagHandlerResult<T> {
  const updatedTags = ensureHomeTagExists([])
  return {
    updatedTags,
    shouldCache: true,
    result: updatedTags as T,
  }
}

/**
 * 处理 equal 操作（直接设置标签列表）
 */
function handleEqualOperation<T>(value?: T | TagItem[]): TagHandlerResult<T> {
  if (!Array.isArray(value)) {
    console.warn('equal 操作需要数组参数')
    return { updatedTags: [], shouldCache: false }
  }

  const newTags = value as TagItem[]
  const validTags = newTags.filter(isValidTag)
  const updatedTags = ensureHomeTagExists(validTags)

  return {
    updatedTags,
    shouldCache: true,
    result: updatedTags as T,
  }
}

/**
 * 处理更新标题操作
 */
function handleUpdateTitleOperation<T>(tags: TagItem[], value?: T | TagItem): TagHandlerResult<T> {
  if (!value || typeof value !== 'object') {
    return { updatedTags: tags, shouldCache: false }
  }

  const updateInfo = value as any
  if (!updateInfo.path || !updateInfo.title) {
    console.warn('更新标题需要 path 和 title 参数')
    return { updatedTags: tags, shouldCache: false }
  }

  const updatedTags = tags.map((tag) => {
    const pathMatch = tag.path === updateInfo.path
    const queryMatch = isEqual(tag.query || {}, updateInfo.query || {})
    const paramsMatch = isEqual(tag.params || {}, updateInfo.params || {})

    if (pathMatch && queryMatch && paramsMatch) {
      return {
        ...tag,
        meta: {
          ...tag.meta,
          title: updateInfo.title,
        },
      }
    }
    return tag
  })

  return {
    updatedTags,
    shouldCache: true,
    result: updatedTags as T,
  }
}

/**
 * 主要的标签处理函数
 */
export function handleTags<T>(
  tags: TagItem[],
  mode: string,
  value?: T | TagItem,
  position?: TagPosition,
): TagHandlerResult<T> {
  let updatedTags = [...tags]
  let shouldCache = false
  let result: T | undefined

  try {
    switch (mode) {
      case TAG_OPERATION_MODES.PUSH: {
        const pushResult = handlePushOperation(updatedTags, value)
        updatedTags = pushResult.updatedTags
        shouldCache = pushResult.shouldCache
        result = pushResult.result as T
        break
      }

      case TAG_OPERATION_MODES.SPLICE: {
        const spliceResult = handleSpliceOperation(updatedTags, value, position)
        updatedTags = spliceResult.updatedTags
        shouldCache = spliceResult.shouldCache
        result = spliceResult.result as T
        break
      }

      case TAG_OPERATION_MODES.UNSHIFT: {
        const unshiftResult = handleUnshiftOperation(updatedTags, value)
        updatedTags = unshiftResult.updatedTags
        shouldCache = unshiftResult.shouldCache
        result = unshiftResult.result as T
        break
      }

      case TAG_OPERATION_MODES.CLEAR: {
        const clearResult = handleClearOperation<T>()
        updatedTags = clearResult.updatedTags
        shouldCache = clearResult.shouldCache
        result = clearResult.result as T
        break
      }

      case TAG_OPERATION_MODES.EQUAL: {
        const equalResult = handleEqualOperation<T>(value as T | TagItem[])
        updatedTags = equalResult.updatedTags
        shouldCache = equalResult.shouldCache
        result = equalResult.result as T
        break
      }

      case TAG_OPERATION_MODES.UPDATE_TITLE: {
        const updateResult = handleUpdateTitleOperation(updatedTags, value)
        updatedTags = updateResult.updatedTags
        shouldCache = updateResult.shouldCache
        result = updateResult.result as T
        break
      }

      default:
        console.warn(`未知的操作模式: ${mode}`)
        result = updatedTags as T
        break
    }
  } catch (error) {
    console.error(`标签操作失败 (${mode}):`, error)
    updatedTags = ensureHomeTagExists(tags)
    shouldCache = false
    result = updatedTags as T
  }

  return {
    updatedTags,
    shouldCache,
    result: result !== undefined ? result : (updatedTags as T),
  }
}
