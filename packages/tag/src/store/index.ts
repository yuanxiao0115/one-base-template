import { defineStore, createPinia } from 'pinia'
import type { TagItem, TagPosition } from '../types'
import { tagsCache, getStoredTags } from '../utils/storage'
import { ensureHomeTag, filterValidTags, isSameTag } from '../utils/validation'
import { useTagRouteGuard } from '../hooks/useTagRouteGuard'
import { handleTags } from '../utils/tagHandlers'
import { createHomeTag, getConfig } from '../config/configManager'
import { shouldShowHomeTag } from '../utils'

/**
 * 标签页 Store
 * 简化版本，复杂逻辑已移至 hooks 中
 */
export const useTagStore = defineStore('tag-store', {
  state: () => {
    // 获取存储的标签
    const savedTags = getStoredTags()

    // 获取配置的默认标签
    const config = getConfig()

    // 根据 hideHome 配置决定是否包含首页标签
    let defaultTags: TagItem[] = []
    if (config.defaultTags.length > 0) {
      defaultTags = [...config.defaultTags]
    } else if (shouldShowHomeTag()) {
      // 只有在不隐藏首页时才添加首页标签
      defaultTags = [createHomeTag()]
    }

    let initialTags = defaultTags
    if (savedTags && Array.isArray(savedTags)) {
      // 过滤有效标签并根据配置处理首页标签
      const validTags = filterValidTags(savedTags)
      initialTags = ensureHomeTag(validTags)
    }

    return {
      multiTags: initialTags,
      currentActiveTag: null as TagItem | null,
      previousActiveTag: null as TagItem | null,
      isUpdating: false,
      // 从 useTagState 移过来的状态
      activeIndex: -1,
      currentSelect: null as TagItem | null,
    }
  },

  getters: {
    getCurrentActiveTag(state) {
      return state.currentActiveTag
    },

    getPreviousActiveTag(state) {
      return state.previousActiveTag
    },

    // 从 useTagState 移过来的 getters
    getActiveIndex(state) {
      return state.activeIndex
    },

    getCurrentSelect(state) {
      return state.currentSelect
    },
  },

  actions: {
    // ===== 简化缓存管理 =====

    /**
     * 缓存标签页数据到sessionStorage
     */
    tagsCache(multiTags?: TagItem[]) {
      const tags = multiTags || this.multiTags
      tagsCache(tags)
    },

    // ===== 激活标签管理 =====

    /**
     * 设置当前激活标签
     */
    setActiveTag(tag: TagItem) {
      // 防止递归更新
      if (this.isUpdating) return

      // 检查是否真的需要更新
      if (isSameTag(this.currentActiveTag, tag)) return

      this.isUpdating = true
      try {
        this.previousActiveTag = this.currentActiveTag
        this.currentActiveTag = tag
      } finally {
        // 同步重置标记，避免测试中的异步问题
        this.isUpdating = false
      }
    },

    // ===== 标签操作 =====

    /**
     * 从路由信息添加标签
     */
    addTagFromRoute(route: any) {
      const { processRouteChange } = useTagRouteGuard()

      try {
        const result = processRouteChange(this.multiTags, route, this.currentActiveTag)

        // 更新标签列表
        if (result.tagAdded) {
          this.multiTags = result.updatedTags
          this.tagsCache()
        }

        // 更新激活标签
        this.setActiveTag(result.newActiveTag)

        if (result.error) {
          console.warn('添加标签时出现警告:', result.error)
        }
      } catch (error) {
        console.error('添加标签失败:', error)
      }
    },

    /**
     * 基础标签操作（保持与原 API 兼容）
     * 现在使用 tagHandlers 处理复杂逻辑
     */
    handleTags<T>(mode: string, value?: T | TagItem, position?: TagPosition): T {
      // 使用新的处理器处理操作
      const result = handleTags(this.multiTags, mode, value, position)

      // 更新状态
      this.multiTags = result.updatedTags

      // 如果需要缓存则缓存
      if (result.shouldCache) {
        this.tagsCache()
      }

      // 返回结果
      return result.result !== undefined ? result.result : (this.multiTags as T)
    },

    /**
     * 更新标签页标题
     */
    updateTagTitle(
      path: string,
      title: string,
      query?: Record<string, any>,
      params?: Record<string, any>,
    ) {
      this.handleTags('updateTitle', { path, title, query, params })
    },

    // ===== 从 useTagState 移过来的 actions =====

    /**
     * 设置激活索引
     */
    setActiveIndex(index: number) {
      this.activeIndex = index
    },

    /**
     * 设置当前选中的标签
     */
    setCurrentSelect(tag: TagItem | null) {
      this.currentSelect = tag
    },
  },
})

// ===== Store 实例管理 =====

/**
 * Tag组件的独立Pinia实例
 * 用于npm组件打包时的独立store管理
 */
let tagPiniaInstance: any = null

/**
 * 获取或创建Tag组件的Pinia实例
 */
function getTagPiniaInstance() {
  if (!tagPiniaInstance) {
    // 创建独立的Pinia实例
    tagPiniaInstance = createPinia()
  }
  return tagPiniaInstance
}

/**
 * 设置外部Pinia实例（用于集成到现有应用）
 */
export function setTagPiniaInstance(pinia: any) {
  tagPiniaInstance = pinia
}

/**
 * 在 setup 外使用
 */
export function useTagStoreHook() {
  return useTagStore(getTagPiniaInstance())
}
