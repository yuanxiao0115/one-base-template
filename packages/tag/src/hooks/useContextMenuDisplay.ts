import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import type { TagMenuItem } from '../types'
import { MENU_INDICES } from '../types'
import { useTagStoreHook } from '../store'
import { configManager } from '../config/configManager'
import { isEqual } from '../utils'

// 使用字符串格式的图标，与 DropdownMenu 保持一致

/**
 * 标签菜单显示管理 Hook
 * 完整管理菜单项的显示逻辑，包括右键菜单和下拉菜单
 * 在 Hook 中声明完整的 tagsViews，组件直接使用即可
 *
 * ===== 完整的页签菜单显示逻辑 =====
 *
 * 基于浏览器页签标准行为，首页常驻不可关闭
 *
 * 【菜单项说明】
 * - 重新加载：刷新当前页面内容
 * - 关闭当前标签页：关闭被操作的标签
 * - 关闭左侧标签页：关闭当前标签左侧的所有可关闭标签
 * - 关闭右侧标签页：关闭当前标签右侧的所有标签
 * - 关闭其他标签页：关闭除首页和当前标签外的所有标签
 * - 关闭全部标签页：关闭除首页外的所有标签
 *
 * 【详细显示规则】
 *
 * 1. 重新加载
 *    ✅ 右键激活页：显示
 *    ❌ 右键非激活页：隐藏（浏览器标准行为）
 *    ✅ 下拉菜单：显示（始终操作激活页）
 *
 * 2. 关闭当前标签页
 *    ❌ 首页（索引0）：隐藏（常驻保护）
 *    ✅ 其他页面：显示
 *
 * 3. 关闭左侧标签页
 *    ❌ 首页（索引0）：隐藏（左侧没有标签）
 *    ❌ 首页右侧第一个（索引1）：隐藏（左侧只有首页，首页不可关闭）
 *    ✅ 中间标签（索引≥2）：显示（左侧有可关闭的标签）
 *
 * 4. 关闭右侧标签页
 *    ❌ 最右侧标签：隐藏（右侧没有标签）
 *    ✅ 其他标签：显示（右侧有标签）
 *
 * 5. 关闭其他标签页
 *    ❌ 只有首页：隐藏（没有其他标签）
 *    ✅ 有其他标签：显示（关闭除首页和当前标签外的所有标签）
 *
 * 6. 关闭全部标签页
 *    ❌ 只有首页：隐藏（没有可关闭的标签）
 *    ✅ 有其他标签：显示（关闭除首页外的所有标签，保留首页）
 *
 * 【特殊场景处理】
 *
 * • 只有首页一个标签：
 *   - 显示：重新加载
 *   - 隐藏：所有关闭操作
 *
 * • 首页 + 一个普通页面：
 *   - 普通页面：显示重新加载、关闭当前、关闭其他、关闭全部
 *   - 普通页面：隐藏关闭左侧、关闭右侧
 *
 * • 多个标签的中间位置：
 *   - 显示：所有菜单项（除非是首页或最右侧）
 *   - 左右关闭按钮根据位置动态显示
 *
 * 【右键菜单 vs 下拉菜单】
 *
 * • 右键菜单：
 *   - 操作被右键点击的标签
 *   - 需要区分激活页和操作页
 *   - 非激活页不显示"重新加载"
 *
 * • 下拉菜单：
 *   - 始终操作当前激活页
 *   - 总是显示"重新加载"
 */
export function useContextMenuDisplay() {
  const route = useRoute()

  // ===== 菜单配置声明 =====
  /** 完整的菜单项配置 */
  const tagsViews = reactive<Array<TagMenuItem>>([
    {
      icon: 'ep:refresh-right',
      text: '重新加载',
      disabled: false,
      show: true,
    },
    {
      icon: 'ep:close',
      text: '关闭当前标签页',
      disabled: false,
      show: true,
    },
    {
      icon: 'ri:text-direction-r',
      text: '关闭左侧标签页',
      disabled: false,
      show: true,
    },
    {
      icon: 'ri:text-direction-l',
      text: '关闭右侧标签页',
      disabled: false,
      show: true,
    },
    {
      icon: 'ri:text-spacing',
      text: '关闭其他标签页',
      disabled: false,
      show: true,
    },
    {
      icon: 'ri:subtract-line',
      text: '关闭全部标签页',
      disabled: false,
      show: true,
    },
  ])

  // ===== 计算属性 =====
  /** 多标签数据 */
  const multiTags = computed(() => {
    return useTagStoreHook().multiTags
  })

  /** 首页路径 */
  const homePath = computed(() => {
    return configManager.getHomePath()
  })

  // ===== 核心菜单显示逻辑 =====

  /**
   * 判断是否为首页
   * @param path 路径
   */
  function isHomePage(path: string): boolean {
    return path === homePath.value
  }

  /**
   * 重置菜单状态到默认状态
   */
  function resetMenuState(): void {
    tagsViews.forEach((item) => {
      item.show = true
      item.disabled = false
    })
  }

  /**
   * 隐藏指定的菜单项
   * @param indices 要隐藏的菜单项索引数组
   */
  function hideMenuItems(indices: number[]): void {
    indices.forEach((index) => {
      if (tagsViews[index]) {
        tagsViews[index].show = false
        tagsViews[index].disabled = true
      }
    })
  }

  /**
   * 显示指定的菜单项
   * @param indices 要显示的菜单项索引数组
   */
  function showMenuItems(indices: number[]): void {
    indices.forEach((index) => {
      if (tagsViews[index]) {
        tagsViews[index].show = true
        tagsViews[index].disabled = false
      }
    })
  }

  function setMenuItemDisabled(index: number, disabled: boolean) {
    const item = tagsViews[index]
    if (!item) return
    item.disabled = disabled
  }

  /**
   * 配置首页菜单显示（基于浏览器标准行为）
   * @param routeLength 路由总数
   * @param isActiveTab 是否为激活标签
   */
  function configureHomePageMenu(routeLength: number, isActiveTab: boolean = true): void {
    // 1. 重新加载：非激活页时隐藏
    if (!isActiveTab) {
      hideMenuItems([MENU_INDICES.REFRESH])
    }

    // 2. 关闭当前标签页：首页常驻，始终隐藏
    hideMenuItems([MENU_INDICES.CLOSE_CURRENT])

    // 3. 关闭左侧标签页：首页左侧没有标签，始终隐藏
    hideMenuItems([MENU_INDICES.CLOSE_LEFT])

    // 4. 关闭右侧标签页：根据右侧是否有标签决定
    if (routeLength <= 1) {
      // 只有首页，隐藏关闭右侧
      hideMenuItems([MENU_INDICES.CLOSE_RIGHT])
    } else {
      // 右侧有标签，显示关闭右侧
      showMenuItems([MENU_INDICES.CLOSE_RIGHT])
    }

    // 5. 关闭其他标签页：只有首页时隐藏
    if (routeLength <= 1) {
      hideMenuItems([MENU_INDICES.CLOSE_OTHER])
    } else {
      showMenuItems([MENU_INDICES.CLOSE_OTHER])
    }

    // 6. 关闭全部标签页：只有首页时隐藏
    if (routeLength <= 1) {
      hideMenuItems([MENU_INDICES.CLOSE_ALL])
    } else {
      showMenuItems([MENU_INDICES.CLOSE_ALL])
    }
  }

  /**
   * 配置普通页面菜单显示
   * @param currentIndex 当前标签索引
   * @param routeLength 路由总数
   * @param isActiveTab 是否为激活标签（用于右键菜单区分）
   */
  function configureRegularPageMenu(
    currentIndex: number,
    routeLength: number,
    isActiveTab: boolean = true,
  ): void {
    // 如果不是激活标签，隐藏重新加载菜单项
    if (!isActiveTab) {
      hideMenuItems([MENU_INDICES.REFRESH])
    }

    // 只有一个标签时（只有首页），禁用所有关闭操作
    if (routeLength <= 1) {
      hideMenuItems([
        MENU_INDICES.CLOSE_CURRENT,
        MENU_INDICES.CLOSE_LEFT,
        MENU_INDICES.CLOSE_RIGHT,
        MENU_INDICES.CLOSE_OTHER,
        MENU_INDICES.CLOSE_ALL,
      ])
      return
    }

    // 3. 关闭左侧标签页：
    // - 索引0（首页）：不显示（左侧没有标签）
    // - 索引1（首页右侧第一个）：不显示（左侧只有首页，首页不能关闭）
    // - 索引≥2（中间标签）：显示（左侧有可关闭的标签）
    if (currentIndex <= 1) {
      hideMenuItems([MENU_INDICES.CLOSE_LEFT])
    } else {
      showMenuItems([MENU_INDICES.CLOSE_LEFT])
    }

    // 4. 关闭右侧标签页：右侧没有标签时不显示
    if (currentIndex === routeLength - 1) {
      hideMenuItems([MENU_INDICES.CLOSE_RIGHT])
    } else {
      showMenuItems([MENU_INDICES.CLOSE_RIGHT])
    }

    // 5. 关闭其他标签页：始终显示（因为至少有首页）
    showMenuItems([MENU_INDICES.CLOSE_OTHER])

    // 6. 关闭全部标签页：始终显示（会保留首页）
    showMenuItems([MENU_INDICES.CLOSE_ALL])
  }

  /**
   * 配置右键菜单显示
   * 右键菜单需要区分激活页和操作页
   * @param operatedPath 被右键点击的标签路径
   * @param operatedQuery 被右键点击的标签查询参数
   * @param activePath 当前激活标签路径
   * @param activeQuery 当前激活标签查询参数
   */
  function configureContextMenu(
    operatedPath: string,
    operatedQuery: Record<string, any> = {},
    activePath?: string,
    activeQuery: Record<string, any> = {},
  ): void {
    // 重置菜单状态
    resetMenuState()

    const routeLength = multiTags.value.length
    const operatedIndex = multiTags.value.findIndex(
      (v: any) => v && isEqual(v.query || {}, operatedQuery) && v.path === operatedPath,
    )

    // 判断操作页是否为激活页
    const isActiveTab = activePath
      ? operatedPath === activePath && isEqual(operatedQuery, activeQuery)
      : true // 如果没有传入激活页信息，默认认为是激活页

    if (isHomePage(operatedPath)) {
      // 首页菜单配置
      configureHomePageMenu(routeLength, isActiveTab)
    } else {
      // 普通页面菜单配置
      configureRegularPageMenu(operatedIndex, routeLength, isActiveTab)
    }
  }

  /**
   * 配置下拉菜单显示
   * 下拉菜单始终操作当前激活页，使用 disabled 属性控制显示
   * @param currentPath 当前激活页路径
   * @param currentQuery 当前激活页查询参数
   */
  function configureDropdownMenu(
    currentPath?: string,
    currentQuery: Record<string, any> = {},
  ): void {
    const path = currentPath || route.path
    const query = currentQuery || route.query || {}

    // 重置所有菜单项的 disabled 状态
    tagsViews.forEach((item: TagMenuItem) => {
      item.disabled = true // 默认在下拉菜单中不显示
    })

    const routeLength = multiTags.value.length
    const currentIndex = multiTags.value.findIndex(
      (v: any) => v && isEqual(v.query || {}, query) && v.path === path,
    )

    if (isHomePage(path)) {
      // 首页下拉菜单配置
      configureDropdownHomePageMenu(routeLength)
    } else {
      // 普通页面下拉菜单配置
      configureDropdownRegularPageMenu(currentIndex, routeLength)
    }
  }

  // ===== 下拉菜单专用配置函数 =====

  /**
   * 配置首页下拉菜单
   * @param routeLength 总页签数量
   */
  function configureDropdownHomePageMenu(routeLength: number): void {
    // 首页始终显示刷新
    setMenuItemDisabled(0, false) // 刷新页面

    if (routeLength === 1) {
      // 只有首页：只显示刷新
      return
    }

    // 有其他页签时，首页显示：刷新、关闭右侧、关闭其他、关闭所有
    setMenuItemDisabled(3, false) // 关闭右侧标签页
    setMenuItemDisabled(4, false) // 关闭其他标签页
    setMenuItemDisabled(5, false) // 关闭全部标签页
  }

  /**
   * 配置普通页面下拉菜单
   * @param currentIndex 当前页签索引
   * @param routeLength 总页签数量
   */
  function configureDropdownRegularPageMenu(currentIndex: number, routeLength: number): void {
    if (currentIndex === -1) return

    // 普通页面始终显示：刷新、关闭当前、关闭其他、关闭所有
    setMenuItemDisabled(0, false) // 刷新页面
    setMenuItemDisabled(1, false) // 关闭当前标签页
    setMenuItemDisabled(4, false) // 关闭其他标签页
    setMenuItemDisabled(5, false) // 关闭全部标签页

    // 根据位置决定是否显示左侧/右侧关闭
    const isFirstNonHomePage = currentIndex === 1
    const isLastPage = currentIndex === routeLength - 1

    if (!isFirstNonHomePage) {
      // 不是第一个非首页页签，显示关闭左侧
      setMenuItemDisabled(2, false) // 关闭左侧标签页
    }

    if (!isLastPage) {
      // 不是最后一个页签，显示关闭右侧
      setMenuItemDisabled(3, false) // 关闭右侧标签页
    }
  }

  // ===== 返回接口 =====
  return {
    // 菜单配置
    tagsViews,

    // 计算属性
    multiTags,

    // 配置方法
    configureContextMenu,
    configureDropdownMenu,
    resetMenuState,

    // 工具方法
    isHomePage,
    hideMenuItems,
    showMenuItems,
  }
}

/**
 * 右键菜单显示管理 Hook 返回类型
 */
export interface UseContextMenuDisplayReturn {
  // 菜单配置
  tagsViews: TagMenuItem[]

  // 计算属性
  multiTags: any

  // 配置方法
  configureContextMenu: (
    operatedPath: string,
    operatedQuery?: Record<string, any>,
    activePath?: string,
    activeQuery?: Record<string, any>,
  ) => void
  configureDropdownMenu: (currentPath?: string, currentQuery?: Record<string, any>) => void
  resetMenuState: () => void

  // 工具方法
  isHomePage: (path: string) => boolean
  hideMenuItems: (indices: number[]) => void
  showMenuItems: (indices: number[]) => void
}
