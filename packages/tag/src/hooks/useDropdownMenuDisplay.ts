import { reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTagStoreHook } from '../store'
import { isEqual } from '../utils'
import type { TagMenuItem } from '../types'

/**
 * 下拉菜单显示管理 Hook
 * 专门处理下拉菜单的显示逻辑，与右键菜单完全独立
 */
export function useDropdownMenuDisplay() {
  // ===== 依赖注入 =====
  const route = useRoute()
  const store = useTagStoreHook()

  // ===== 响应式状态 =====
  /** 多标签数据 */
  const multiTags = computed(() => store.multiTags)

  /** 下拉菜单项视图（独立状态） */
  const dropdownMenuViews = reactive<TagMenuItem[]>([
    { text: '刷新页面', disabled: true, show: false, icon: 'ep:refresh-right' },
    { text: '关闭当前标签页', disabled: true, show: false, icon: 'ep:close' },
    { text: '关闭左侧标签页', disabled: true, show: false, icon: 'ri:text-direction-r' },
    { text: '关闭右侧标签页', disabled: true, show: false, icon: 'ri:text-direction-l' },
    { text: '关闭其他标签页', disabled: true, show: false, icon: 'ri:text-spacing' },
    { text: '关闭全部标签页', disabled: true, show: false, icon: 'ri:subtract-line' },
  ])

  // ===== 工具函数 =====

  /**
   * 判断是否为首页
   */
  function isHomePage(path: string): boolean {
    return path === '/home' || path === '/home/index'
  }

  /**
   * 重置所有菜单项状态
   */
  function resetDropdownMenuState(): void {
    dropdownMenuViews.forEach((item: TagMenuItem) => {
      item.disabled = true // 默认不显示
    })
  }

  function setMenuItemDisabled(index: number, disabled: boolean): void {
    const item = dropdownMenuViews[index]
    if (!item) return
    item.disabled = disabled
  }

  /**
   * 配置首页下拉菜单
   * @param routeLength 总页签数量
   */
  function configureHomePageDropdownMenu(routeLength: number): void {
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
  function configureRegularPageDropdownMenu(currentIndex: number, routeLength: number): void {
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

  // ===== 主要方法 =====

  /**
   * 配置下拉菜单显示
   * 下拉菜单始终操作当前激活页
   * @param currentPath 当前激活页路径
   * @param currentQuery 当前激活页查询参数
   */
  function configureDropdownMenu(
    currentPath?: string,
    currentQuery: Record<string, any> = {},
  ): void {
    const path = currentPath || route.path
    const query = currentQuery || route.query || {}

    // 重置所有菜单项状态
    resetDropdownMenuState()

    const routeLength = multiTags.value.length
    const currentIndex = multiTags.value.findIndex(
      (v: any) => v && isEqual(v.query || {}, query) && v.path === path,
    )

    if (isHomePage(path)) {
      // 首页下拉菜单配置
      configureHomePageDropdownMenu(routeLength)
    } else {
      // 普通页面下拉菜单配置
      configureRegularPageDropdownMenu(currentIndex, routeLength)
    }
  }

  // ===== 返回接口 =====
  return {
    // 状态
    dropdownMenuViews,
    multiTags,

    // 方法
    configureDropdownMenu,
    resetDropdownMenuState,
    isHomePage,
  }
}
