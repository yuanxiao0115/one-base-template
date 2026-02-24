import type { TagItem } from '../types'
import { isValidTag, isSameTag } from '../utils/validation'
import { createHomeTag, getConfig, type RouteIgnoreRule } from '../config/configManager'

/**
 * 路由处理结果
 */
export interface RouteProcessResult {
  updatedTags: TagItem[]
  newActiveTag: TagItem
  tagAdded: boolean
  error?: string
}

/**
 * 标签路由守卫 Hook
 */
export function useTagRouteGuard() {
  /**
   * 从路由创建标签
   */
  function createTagFromRoute(route: any): TagItem {
    return {
      path: route.path,
      name: route.name,
      meta: {
        title: route.meta?.title || route.name || '未命名页面',
        icon: route.meta?.icon,
        keepAlive: route.meta?.keepAlive || false,
        ...route.meta,
      },
      query: route.query || {},
      params: route.params || {},
    }
  }

  /**
   * 检查路由是否匹配忽略规则
   */
  function isRouteIgnored(route: any, rule: RouteIgnoreRule): boolean {
    // 自定义测试函数
    if (rule.test && typeof rule.test === 'function') {
      return rule.test(route)
    }

    // 精确路径匹配
    if (rule.path !== undefined && route.path === rule.path) {
      return true
    }

    // 路径包含匹配
    if (rule.pathIncludes && route.path.includes(rule.pathIncludes)) {
      return true
    }

    // 路由名称匹配
    if (rule.name && route.name === rule.name) {
      return true
    }

    return false
  }

  /**
   * 验证路由是否应该添加为标签
   */
  function shouldAddRouteAsTag(route: any): boolean {
    // 检查路由是否有效
    if (!route || !route.path) return false

    // 检查是否明确禁用标签
    if (route.meta?.noTag === true) return false

    // 检查是否为重定向路由
    if (route.redirect) return false

    // 过滤掉重定向路由，避免创建"加载中"页签
    if (route.path.startsWith('/redirect')) {
      return false
    }

    // 检查路由是否有有效的标题信息
    // 必须有 name 或 meta.title，否则不添加为标签（避免创建"未命名页面"）
    if (!route.name && !route.meta?.title) {
      return false
    }

    // 获取配置的忽略规则
    const config = getConfig()
    const ignoredRoutes = config.ignoredRoutes || []

    // 检查是否匹配任何忽略规则
    for (const rule of ignoredRoutes) {
      if (isRouteIgnored(route, rule)) {
        return false
      }
    }

    return true
  }

  /**
   * 查找标签插入位置
   */
  function findInsertPosition(tags: TagItem[], currentActiveTag: TagItem | null): number {
    if (!currentActiveTag) return tags.length

    const activeIndex = tags.findIndex((tag) => isSameTag(tag, currentActiveTag))

    // 如果找到当前激活标签，在其后插入
    if (activeIndex !== -1) {
      return activeIndex + 1
    }

    // 否则在末尾插入
    return tags.length
  }

  /**
   * 处理路由变化
   */
  function processRouteChange(
    currentTags: TagItem[],
    route: any,
    currentActiveTag: TagItem | null,
  ): RouteProcessResult {
    try {
      // 检查是否应该添加标签
      if (!shouldAddRouteAsTag(route)) {
        return {
          updatedTags: currentTags,
          newActiveTag: currentActiveTag || createHomeTag(),
          tagAdded: false,
          error: '路由不应添加为标签',
        }
      }

      // 创建新标签
      const newTag = createTagFromRoute(route)

      // 验证标签有效性
      if (!isValidTag(newTag)) {
        return {
          updatedTags: currentTags,
          newActiveTag: currentActiveTag || createHomeTag(),
          tagAdded: false,
          error: '创建的标签无效',
        }
      }

      // 检查标签是否已存在
      const existingIndex = currentTags.findIndex((tag) => isSameTag(tag, newTag))

      if (existingIndex !== -1) {
        const existingTag = currentTags[existingIndex]
        if (!existingTag) {
          return {
            updatedTags: currentTags,
            newActiveTag: currentActiveTag || createHomeTag(),
            tagAdded: false,
          }
        }

        // 标签已存在，只需要激活
        return {
          updatedTags: currentTags,
          newActiveTag: existingTag,
          tagAdded: false,
        }
      }

      // 添加新标签
      const updatedTags = [...currentTags]
      const insertPosition = findInsertPosition(updatedTags, currentActiveTag)

      updatedTags.splice(insertPosition, 0, newTag)

      return {
        updatedTags,
        newActiveTag: newTag,
        tagAdded: true,
      }
    } catch (error) {
      console.error('处理路由变化失败:', error)

      return {
        updatedTags: currentTags,
        newActiveTag: currentActiveTag || createHomeTag(),
        tagAdded: false,
        error: `处理失败: ${error}`,
      }
    }
  }

  return {
    createTagFromRoute,
    shouldAddRouteAsTag,
    processRouteChange,
    findInsertPosition,
  }
}
