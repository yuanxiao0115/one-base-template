import { useTagOperations } from './hooks/useTagOperations'
import { useTagStoreHook, setTagPiniaInstance } from './store'
import { tagsCache, getStoredTags } from './utils/storage'
import { TAG_CONSTANTS } from './types'
import { enableAutoTags, addTagFromRoute } from './guards/tagGuard'
import { configManager, setConfig, getConfig } from './config/configManager'
import type { TagConfig, RouteIgnoreRule } from './config/configManager'
import { emitMenuSelect, onMenuSelect, offMenuSelect } from './utils/eventEmitter'

// ===== 重新导出配置相关函数 =====
export { setConfig, getConfig, enableAutoTags, addTagFromRoute }
export type { TagConfig, RouteIgnoreRule }
export type { TagItem, TagPosition, TagStorageConfig } from './types'

/**
 * 标签页公共 API
 * 提供对外使用的核心功能接口，隐藏内部实现细节
 *
 * 使用示例：
 * ```ts
 * import { useTagAPI } from '@/layout/components/tag/api'
 *
 * const { tagOnClick, deleteMenu, refreshTag } = useTagAPI()
 * ```
 */

// ===== 常量导出 =====
/**
 * 标签页相关常量
 * 对外暴露的配置常量，避免直接引用内部配置
 */
/**
 * 首页相关配置常量
 * 主要用于获取首页路径、标题等配置信息
 */
export const HomeConfig = {
  /** 获取当前首页路径 */
  get PATH() {
    return configManager.getHomePath()
  },
  /** 获取当前首页标题 */
  get TITLE() {
    return configManager.getHomeTitle()
  },

  /** 判断是否应该显示首页标签 */
  get SHOULD_SHOW() {
    return configManager.shouldShowHomeTag()
  },
  /** 首页标签索引 */
  TAG_INDEX: TAG_CONSTANTS.HOME_TAG_INDEX,
  /** 菜单最小宽度 */
  MENU_MIN_WIDTH: TAG_CONSTANTS.MENU_MIN_WIDTH,
} as const

// ===== 事件相关类型重新导出 =====
export type { TagEvents } from './types'

/**
 * 初始化标签存储
 * 如果存储中没有标签数据，则使用默认标签初始化
 */
function initializeTagStorage(): void {
  const config = configManager.getConfig()

  const existingTags = getStoredTags()
  if (!existingTags) {
    // 使用配置的默认标签初始化存储
    tagsCache(config.defaultTags)
  }
}

/**
 * 标签页统一 API
 * 提供所有标签页相关功能的统一入口
 *
 * 使用示例：
 * ```ts
 * import { useTagAPI, setConfig } from '@one-base-template/tag'
 *
 * // 配置标签页
 * setConfig({
 *   homePath: '/dashboard',
 *   homeTitle: '控制台',
 *   defaultTags: [{ path: '/dashboard', meta: { title: '控制台' } }]
 * });
 *
 * const tagAPI = useTagAPI()
 * tagAPI.tagOnClick(item)           // 点击标签
 * tagAPI.clear()                    // 清空除首页外的标签
 * tagAPI.multiTags                  // 获取所有标签
 * tagAPI.openMenu(tag, event)       // 打开右键菜单
 * ```
 */
export function useTagAPI() {
  // 获取各个模块的功能
  const { tagOnClick, deleteDynamicTag, dynamicRouteTag, onFresh, onClickDrop } = useTagOperations()
  const store = useTagStoreHook()

  return {
    // ===== 核心操作 =====
    /**
     * 标签点击事件
     * @param item 标签项
     */
    tagOnClick,

    /**
     * 删除标签
     * @param item 要删除的标签项
     * @param position 删除位置类型 ('left' | 'right' | 'other' | undefined)
     */
    deleteMenu: deleteDynamicTag,

    /**
     * 动态路由跳转
     * @param path 路由路径
     */
    dynamicRouteTag,

    /**
     * 刷新当前页面
     */
    refreshTag: onFresh,

    // ===== 菜单操作 =====

    /**
     * 右键菜单操作
     * @param key 操作类型
     * @param item 菜单项
     * @param selectRoute 选中的路由
     */
    onClickDrop,

    // ===== 状态访问 =====
    /**
     * 获取所有标签列表
     */
    get multiTags() {
      return store.multiTags
    },

    /**
     * 获取当前选中的标签
     */
    get currentSelect() {
      return store.getCurrentSelect
    },

    /**
     * 获取当前激活的标签
     */
    activeTag: store.currentActiveTag,

    // ===== Store 操作 =====

    /**
     * 删除标签
     * @param tag 标签项
     */
    deleteTag: (tag: any) => store.handleTags('splice', tag),

    /**
     * 更新标签标题
     * @param tag 标签项
     */
    updateTagTitle: (tag: any) => store.handleTags('update', tag),

    /**
     * 清空所有标签
     */
    clearAllTags: () => store.handleTags('splice', 'all'),

    /**
     * 关闭左侧标签
     * @param tag 标签项
     */
    closeLeftTags: (tag: any) => store.handleTags('splice', tag, { position: 'left' }),

    /**
     * 关闭右侧标签
     * @param tag 标签项
     */
    closeRightTags: (tag: any) => store.handleTags('splice', tag, { position: 'right' }),

    /**
     * 关闭其他标签
     * @param tag 标签项
     */
    closeOtherTags: (tag: any) => store.handleTags('splice', tag, { position: 'other' }),

    /**
     * 清空除首页外的所有标签
     */
    clear: () => {
      const homeTag = store.multiTags[0] // 首页标签
      store.handleTags('equal', [homeTag])
    },

    /**
     * 重置标签为默认状态
     * @param defaultTags 可选的默认标签数组，不传则使用配置的默认标签
     */
    reset: (defaultTags?: any[]) => {
      const config = configManager.getConfig()
      const tagsToUse = defaultTags || config.defaultTags
      store.handleTags('equal', [...tagsToUse])
    },

    // ===== 配置方法 =====
    /**
     * 配置标签页
     * @param config 配置选项
     */
    configure: setConfig,

    /**
     * 获取当前配置
     */
    getConfig: getConfig,

    /**
     * 初始化标签存储（手动调用）
     */
    initStorage: initializeTagStorage,

    // ===== 路由守卫 =====
    /**
     * 启用自动标签管理
     * @param router Vue Router 实例
     */
    enableAutoTags: enableAutoTags,

    /**
     * 手动从路由添加标签
     * @param route 路由信息
     */
    addFromRoute: addTagFromRoute,

    // ===== Store 配置 =====
    /**
     * 设置外部Pinia实例（用于集成到现有应用）
     * @param pinia Pinia实例
     */
    setPiniaInstance: setTagPiniaInstance,

    // ===== 事件API（简洁模式）=====
    /**
     * 触发菜单选择事件（供菜单组件调用）
     * @param path 路由路径
     */
    triggerMenuSelect: emitMenuSelect,

    /**
     * 监听菜单选择事件
     * @param handler 事件处理函数
     */
    onMenuSelect,

    /**
     * 取消监听菜单选择事件
     * @param handler 事件处理函数（可选）
     */
    offMenuSelect,
  }
}

/**
 * 菜单变化监听（直接导出，语义化）
 * @param handler 事件处理函数
 */
export function onMenuChange(handler: (path: string) => void) {
  onMenuSelect(handler)
}

/**
 * 默认导出统一 API
 */
export default useTagAPI
