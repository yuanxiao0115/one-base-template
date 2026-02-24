/**
 * 标签组件类型定义
 * 独立的类型定义，避免外部依赖，便于组件打包封装
 */

// ===== 基础类型定义 =====

/** 路由元信息类型 */
export interface TagRouteMeta {
  /** 页面标题 */
  title?: string
  /** 是否显示链接 */
  showLink?: boolean
  /** 是否保存滚动位置 */
  savedPosition?: boolean
  /** 权限码 */
  auths?: Array<string>
  /** 是否保持活跃 */
  keepAlive?: boolean
  /** 动态路由级别 */
  dynamicLevel?: number
  /** 是否为外链 */
  frameSrc?: string
  /** 重定向地址 */
  redirect?: string
  /** 是否为前台页面 */
  front?: boolean
  /** 其他扩展属性 */
  [key: string]: any
}

/** 标签页类型 */
export interface TagItem {
  /** 路由路径 */
  path: string
  /** 路由名称 */
  name?: string
  /** 路由元信息 */
  meta?: TagRouteMeta
  /** 查询参数 */
  query?: Record<string, any>
  /** 路由参数 */
  params?: Record<string, any>
  /** 子路由 */
  children?: TagItem[]
  /** 组件 */
  component?: any
  /** 路由属性 */
  props?: boolean | object | ((to: any) => object)
}

/** 标签列表类型 */
export type TagList = TagItem[]

/** 位置信息类型 */
export interface TagPosition {
  /** 开始索引 */
  startIndex?: number
  /** 长度 */
  length?: number
  /** 插入位置 */
  insertAfterTag?: TagItem | null
  /** 位置字符串 */
  position?: 'left' | 'right' | 'other'
}

// ===== 操作相关类型 =====

/** 标签操作模式常量 */
export const TAG_OPERATION_MODES = {
  PUSH: 'push',
  SPLICE: 'splice',
  UNSHIFT: 'unshift',
  CLEAR: 'clear',
  UPDATE_TITLE: 'updateTitle',
  EQUAL: 'equal',
  SLICE: 'slice',
} as const

/** 标签操作模式类型 */
export type TagOperationMode = (typeof TAG_OPERATION_MODES)[keyof typeof TAG_OPERATION_MODES]

/** 标签删除类型 */
export type TagDeleteType =
  | undefined // 关闭当前标签
  | 'left' // 关闭左侧标签
  | 'right' // 关闭右侧标签
  | 'other' // 关闭其他标签
  | 'all' // 关闭全部标签

/** 右键菜单操作类型 */
export type ContextMenuAction = 0 | 1 | 2 | 3 | 4 | 5

/** 菜单索引常量 */
export const MENU_INDICES = {
  REFRESH: 0,
  CLOSE_CURRENT: 1,
  CLOSE_LEFT: 2,
  CLOSE_RIGHT: 3,
  CLOSE_OTHER: 4,
  CLOSE_ALL: 5,
} as const

/** 菜单操作类型 */
export type MenuActionType = (typeof MENU_INDICES)[keyof typeof MENU_INDICES]

// ===== 存储相关类型 =====

/** 存储配置类型 */
export interface TagStorageConfig {
  /** 存储命名空间 */
  namespace: string
  /** 是否启用缓存 */
  enableCache: boolean
  /** 缓存键名 */
  cacheKey: string
  /** 配置键名 */
  configKey: string
}

/** 标签缓存数据类型 */
export interface TagCacheData {
  /** 标签列表 */
  tags: TagList
  /** 当前激活标签 */
  activeTag?: TagItem | null
  /** 上一个激活标签 */
  previousTag?: TagItem | null
  /** 缓存时间戳 */
  timestamp: number
}

// ===== 组件状态类型 =====

/** 标签状态类型 */
export interface TagState {
  /** 标签列表 */
  multiTags: TagList
  /** 当前激活标签 */
  currentActiveTag: TagItem | null
  /** 上一个激活标签 */
  previousActiveTag: TagItem | null
  /** 是否正在更新 */
  isUpdating: boolean
}

/** 显示模式类型 */
export type TagDisplayMode = 'smart' | 'card' | 'chrome'

// ===== 菜单相关类型 =====

/** 右键菜单项类型 */
export interface TagMenuItem {
  /** 图标 */
  icon: any
  /** 文本 */
  text: string
  /** 是否禁用 */
  disabled: boolean
  /** 是否显示 */
  show: boolean
}

/** 菜单配置类型 */
export interface TagMenuConfig {
  /** 是否显示 */
  visible: boolean
  /** 菜单位置 */
  position: {
    left: number
    top: number
  }
  /** 菜单项列表 */
  items: TagMenuItem[]
}

/** 菜单配置上下文 */
export interface MenuContext {
  currentPath: string
  query: Record<string, any>
  currentIndex: number
  routeLength: number
  tagsViews: TagMenuItem[]
}

/** 菜单策略接口 */
export interface MenuStrategy {
  configure(context: MenuContext): void
}

// ===== 菜单组件相关类型 =====

/** 右键菜单组件 Props */
export interface ContextMenuProps {
  /** 是否显示菜单 */
  visible: boolean
  /** 菜单位置 */
  position: {
    left: number
    top: number
  }
  /** 菜单项列表 */
  menuItems: TagMenuItem[]
  /** 容器 DOM 引用 */
  containerRef?: HTMLElement | null
}

/** 右键菜单组件 Emits */
export interface ContextMenuEmits {
  /** 关闭菜单事件 */
  close: []
  /** 菜单项点击事件 */
  'item-click': [key: number, item: TagMenuItem]
}

/** 下拉菜单组件 Props */
export interface DropdownMenuProps {
  /** 菜单项列表 */
  menuItems: TagMenuItem[]
  /** 触发方式 */
  trigger?: 'hover' | 'click' | 'focus' | 'contextmenu'
  /** 弹出位置 */
  placement?:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end'
}

/** 下拉菜单组件 Emits */
export interface DropdownMenuEmits {
  /** 命令事件 */
  command: [command: { key: number; item: TagMenuItem }]
  /** 可见性变化事件 */
  'visible-change': [visible: boolean]
}

// ===== 事件相关类型 =====

/** 事件类型定义 */
export interface TagEvents extends Record<string | symbol, any> {
  /** 菜单选择事件 */
  menuSelect: string
  /** 标签变化事件 */
  tagChange: any
  /** 标签关闭事件 */
  tagClose: any
}

// ===== 处理器结果类型 =====

/** 标签处理结果类型 */
export interface TagHandlerResult<T = any> {
  /** 更新后的标签列表 */
  updatedTags: TagList
  /** 是否需要缓存 */
  shouldCache: boolean
  /** 返回结果 */
  result?: T
}

/** 路由处理结果类型 */
export interface RouteProcessResult {
  /** 更新后的标签列表 */
  updatedTags: TagList
  /** 新的激活标签 */
  newActiveTag: TagItem
  /** 是否添加了标签 */
  tagAdded: boolean
  /** 错误信息 */
  error?: string
}

// ===== 验证相关类型 =====

/** 标签验证结果类型 */
export interface TagValidationResult {
  /** 是否有效 */
  isValid: boolean
  /** 错误信息 */
  error?: string
  /** 处理后的标签 */
  processedTag?: TagItem
}

/** 标签存在性检查结果 */
export interface TagExistenceResult {
  /** 是否存在 */
  exists: boolean
  /** 标签索引 */
  index: number
  /** 找到的标签 */
  tag?: TagItem
}

// ===== 工具类型 =====

/** 标签比较函数类型 */
export type TagCompareFn = (tag1: TagItem, tag2: TagItem) => boolean

/** 标签过滤函数类型 */
export type TagFilterFn = (tag: TagItem) => boolean

/** 标签映射函数类型 */
export type TagMapFn<T> = (tag: TagItem, index: number) => T

// ===== 常量定义 =====

/** 标签常量 */
export const TAG_CONSTANTS = {
  /** 首页标签索引 */
  HOME_TAG_INDEX: 0,
  /** 菜单最小宽度 */
  MENU_MIN_WIDTH: 140,
  /** 滚动步长 */
  SCROLL_STEP: 200,
  /** 动画延迟 */
  ANIMATION_DELAY: 100,
} as const

// ===== 错误处理类型 =====

/** 标签错误类 */
export class TagError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any,
  ) {
    super(message)
    this.name = 'TagError'
  }
}

/** 标签操作结果 */
export interface TagOperationResult {
  /** 操作是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
  /** 操作后的标签 */
  tag?: TagItem
}

// ===== Hook 返回类型 =====

/** useTagMenu Hook 返回类型 */
export interface UseTagMenuReturn {
  visible: any // Ref<boolean>
  buttonTop: any // Ref<number>
  buttonLeft: any // Ref<number>
  tagsViews: TagMenuItem[]
  containerDom: any // Ref<HTMLElement | undefined>
  getContextMenuStyle: any // ComputedRef<{ left: string; top: string }>
  closeMenu: () => void
  showMenus: (value: boolean) => void
  disabledMenus: (value: boolean) => void
  showMenuModel: (currentPath: string, query?: Record<string, any>) => void
  openMenu: (tag: TagItem, e: MouseEvent, currentSelect: any) => void
  onDropdownVisibleChange: (visible: boolean) => void
}

// ===== 兼容性类型别名 =====
export type multiType = TagItem
export type positionType = TagPosition
