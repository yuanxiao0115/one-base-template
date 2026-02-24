import type { TagMenuItem, MenuContext, MenuStrategy } from '../types'
import { MENU_INDICES } from '../types'
import { isEqual } from './index'
import { configManager } from '../config/configManager'

/**
 * 显示或隐藏菜单项
 */
export function showMenus(tagsViews: TagMenuItem[], value: boolean): void {
  ;[1, 2, 3, 4, 5].forEach((index) => {
    if (tagsViews[index]) {
      tagsViews[index].show = value
    }
  })
}

/**
 * 禁用或启用菜单项
 */
export function disabledMenus(tagsViews: TagMenuItem[], value: boolean): void {
  ;[1, 2, 3, 4, 5].forEach((index) => {
    if (tagsViews[index]) {
      tagsViews[index].disabled = value
    }
  })
}

/**
 * 重置菜单状态
 */
export function resetMenuState(tagsViews: TagMenuItem[]): void {
  showMenus(tagsViews, true)
  disabledMenus(tagsViews, false)

  // 刷新菜单项始终显示
  if (tagsViews[MENU_INDICES.REFRESH]) {
    tagsViews[MENU_INDICES.REFRESH].show = true
    tagsViews[MENU_INDICES.REFRESH].disabled = false
  }
}

/**
 * 隐藏指定的菜单项
 */
export function hideMenuItems(tagsViews: TagMenuItem[], indices: number[]): void {
  indices.forEach((index) => {
    if (tagsViews[index]) {
      tagsViews[index].show = false
      tagsViews[index].disabled = true
    }
  })
}

/**
 * 检查是否为首页
 */
export function isHomePage(path: string): boolean {
  return path === configManager.getHomePath()
}

/**
 * 首页菜单策略
 */
export class HomePageMenuStrategy implements MenuStrategy {
  configure(context: MenuContext): void {
    const { routeLength, tagsViews } = context

    // 首页右键菜单：隐藏"关闭当前标签页"、"关闭左侧"、"关闭右侧"
    hideMenuItems(tagsViews, [
      MENU_INDICES.CLOSE_CURRENT,
      MENU_INDICES.CLOSE_LEFT,
      MENU_INDICES.CLOSE_RIGHT,
    ])

    // 根据是否有其他标签决定"关闭其他"和"关闭全部"
    if (routeLength <= 1) {
      hideMenuItems(tagsViews, [MENU_INDICES.CLOSE_OTHER, MENU_INDICES.CLOSE_ALL])
    } else {
      // 显示"关闭其他"和"关闭全部"
      ;[MENU_INDICES.CLOSE_OTHER, MENU_INDICES.CLOSE_ALL].forEach((index) => {
        if (tagsViews[index]) {
          tagsViews[index].show = true
          tagsViews[index].disabled = false
        }
      })
    }
  }
}

/**
 * 普通页面菜单策略
 */
export class RegularPageMenuStrategy implements MenuStrategy {
  configure(context: MenuContext): void {
    const { currentIndex, routeLength, tagsViews } = context

    // 只有一个标签时（只有首页），禁用所有关闭操作
    if (routeLength <= 1) {
      disabledMenus(tagsViews, true)
      return
    }

    // 位置相关的菜单控制
    this.configurePositionBasedMenus(currentIndex, routeLength, tagsViews)

    // 只有两个标签时的特殊处理
    if (routeLength === 2) {
      this.configureTwoTagsMenu(tagsViews)
    }
  }

  /**
   * 配置基于位置的菜单
   */
  private configurePositionBasedMenus(
    currentIndex: number,
    routeLength: number,
    tagsViews: TagMenuItem[],
  ): void {
    if (currentIndex === 1 && routeLength > 2) {
      // 第二个位置（首页右侧第一个），不显示"关闭左侧"
      hideMenuItems(tagsViews, [MENU_INDICES.CLOSE_LEFT])
    } else if (currentIndex === routeLength - 1 && currentIndex > 0) {
      // 最后一个位置，不显示"关闭右侧"
      hideMenuItems(tagsViews, [MENU_INDICES.CLOSE_RIGHT])
    }
  }

  /**
   * 配置两个标签时的菜单
   */
  private configureTwoTagsMenu(tagsViews: TagMenuItem[]): void {
    hideMenuItems(tagsViews, [
      MENU_INDICES.CLOSE_LEFT, // 关闭左侧
      MENU_INDICES.CLOSE_RIGHT, // 关闭右侧
      MENU_INDICES.CLOSE_OTHER, // 关闭其他（只剩首页了）
    ])
  }
}

/**
 * 菜单策略工厂
 */
export const MenuStrategyFactory = {
  /**
   * 创建菜单策略
   */
  createStrategy(currentPath: string): MenuStrategy {
    if (isHomePage(currentPath)) {
      return new HomePageMenuStrategy()
    }
    return new RegularPageMenuStrategy()
  },
} as const

/**
 * 菜单配置器 - 主要的配置入口
 */
export const MenuConfigurator = {
  /**
   * 配置菜单状态
   */
  configure(
    currentPath: string,
    query: Record<string, any>,
    multiTags: any[],
    tagsViews: TagMenuItem[],
  ): void {
    try {
      // 查找当前标签索引
      const currentIndex = multiTags.findIndex(
        (v) => v && isEqual(v.query || {}, query) && v.path === currentPath,
      )

      // 创建上下文
      const context: MenuContext = {
        currentPath,
        query,
        currentIndex,
        routeLength: multiTags.length,
        tagsViews,
      }

      // 重置菜单状态
      resetMenuState(tagsViews)

      // 使用策略模式配置菜单
      const strategy = MenuStrategyFactory.createStrategy(currentPath)
      strategy.configure(context)
    } catch (error) {
      console.error('菜单配置失败:', error)
      // 发生错误时重置为默认状态
      resetMenuState(tagsViews)
    }
  },
} as const
