import mitt from 'mitt'
import type { TagEvents } from '../types'

/**
 * Tag组件内置的事件总线
 * 完全自治，不依赖外部mitt实例
 */
export const tagEmitter = mitt<TagEvents>()

// ===== 菜单选择事件操作 =====

/**
 * 触发菜单选择事件
 * @param path 路由路径
 */
export function emitMenuSelect(path: string): void {
  tagEmitter.emit('menuSelect', path)
}

/**
 * 监听菜单选择事件
 * @param handler 事件处理函数
 */
export function onMenuSelect(handler: (path: string) => void): void {
  tagEmitter.on('menuSelect', handler)
}

/**
 * 取消监听菜单选择事件
 * @param handler 事件处理函数（可选）
 */
export function offMenuSelect(handler?: (path: string) => void): void {
  if (handler) {
    tagEmitter.off('menuSelect', handler)
  } else {
    tagEmitter.off('menuSelect')
  }
}

// ===== 标签变化事件操作 =====

/**
 * 触发标签变化事件
 * @param tag 标签数据
 */
export function emitTagChange(tag: any): void {
  tagEmitter.emit('tagChange', tag)
}

/**
 * 监听标签变化事件
 * @param handler 事件处理函数
 */
export function onTagChange(handler: (tag: any) => void): void {
  tagEmitter.on('tagChange', handler)
}

/**
 * 取消监听标签变化事件
 * @param handler 事件处理函数（可选）
 */
export function offTagChange(handler?: (tag: any) => void): void {
  if (handler) {
    tagEmitter.off('tagChange', handler)
  } else {
    tagEmitter.off('tagChange')
  }
}

// ===== 标签关闭事件操作 =====

/**
 * 触发标签关闭事件
 * @param tag 标签数据
 */
export function emitTagClose(tag: any): void {
  tagEmitter.emit('tagClose', tag)
}

/**
 * 监听标签关闭事件
 * @param handler 事件处理函数
 */
export function onTagClose(handler: (tag: any) => void): void {
  tagEmitter.on('tagClose', handler)
}

/**
 * 取消监听标签关闭事件
 * @param handler 事件处理函数（可选）
 */
export function offTagClose(handler?: (tag: any) => void): void {
  if (handler) {
    tagEmitter.off('tagClose', handler)
  } else {
    tagEmitter.off('tagClose')
  }
}

// ===== 通用事件操作 =====

/**
 * 清除所有事件监听器
 */
export function clearAllListeners(): void {
  tagEmitter.all.clear()
}

/**
 * 获取事件发射器实例（用于高级用法）
 */
export function getEventEmitter() {
  return tagEmitter
}
