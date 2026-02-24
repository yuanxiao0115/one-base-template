/**
 * 标签页路由守卫
 * 移动到 tag 组件目录下，与标签页功能更紧密结合
 */

import type { Router } from 'vue-router'
import { nextTick } from 'vue'
import { useTagStoreHook } from '../store'

/**
 * 启用自动标签管理
 * 监听路由变化，自动创建和管理标签页
 */
export function enableAutoTags(router: Router) {
  // 路由后置守卫：自动从路由创建标签
  router.afterEach((to, _from) => {
    // 使用 nextTick 确保在下一个事件循环中执行，避免递归更新
    nextTick(() => {
      const tagStore = useTagStoreHook()
      try {
        // 自动从路由添加标签
        tagStore.addTagFromRoute(to)
      } catch (error) {
        console.error('自动标签管理执行失败:', error)
      }
    })
  })

  // 路由前置守卫：可以在这里添加其他逻辑
  router.beforeEach((_to, _from, next) => {
    // 这里可以添加其他需要在路由跳转前执行的逻辑
    next()
  })
}

/**
 * 手动触发标签添加（用于程序化导航）
 */
export function addTagFromRoute(route: any) {
  const tagStore = useTagStoreHook()

  // 添加标签（使用当前激活标签作为插入基准）
  nextTick(() => {
    try {
      tagStore.addTagFromRoute(route)
    } catch (error) {
      console.error('手动添加标签失败:', error)
    }
  })
}
