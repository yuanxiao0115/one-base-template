import { isEqual, isBoolean } from './index'
import type { TagItem } from '../types'
import { configManager } from '../config/configManager'

/**
 * 条件处理函数 - 判断当前路由与标签项的匹配关系
 */
export function conditionHandle(
  route: any,
  item: TagItem,
  previous: boolean | string,
  next: boolean | string,
): boolean | string {
  if (isBoolean(route?.meta?.showLink) && route?.meta?.showLink === false) {
    if (Object.keys(route.query).length > 0 || Object.keys(route.params).length > 0) {
      const queryEqual = isEqual(route.query || {}, item.query || {})
      const paramsEqual = isEqual(route.params || {}, item.params || {})
      return route.path === item.path && queryEqual && paramsEqual ? previous : next
    } else {
      return route.path === item.path ? previous : next
    }
  } else {
    // 同时比较路径和参数
    const queryEqual = isEqual(route.query || {}, item.query || {})
    const paramsEqual = isEqual(route.params || {}, item.params || {})
    return route.path === item.path && queryEqual && paramsEqual ? previous : next
  }
}

/**
 * 判断关闭按钮是否应该显示（重命名自 iconIsActive）
 */
export function shouldShowCloseButton(route: any, item: TagItem, index: number): boolean {
  // 首页不显示关闭按钮
  if (index === 0 || item.path === configManager.getHomePath()) return false
  return conditionHandle(route, item, true, false) as boolean
}

/**
 * 判断链接是否激活
 */
export function getLinkActiveClass(route: any, item: TagItem): string {
  return conditionHandle(route, item, 'is-active', '') as string
}
