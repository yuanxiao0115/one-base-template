/**
 * Vue 插件相关功能
 * 专门处理 Vue 应用的插件安装和配置
 */

import type { App } from 'vue'
import type { Router } from 'vue-router'
import type { Pinia } from 'pinia'
import TagComponent from './index.vue'
import { setConfig, type TagConfig } from './config/configManager'
import { setTagPiniaInstance } from './store'
import { enableAutoTags } from './guards/tagGuard'

// 插件选项接口 - pinia 和 router 是必需的
export interface OneTagOptions extends TagConfig {
  pinia: Pinia
  router: Router
}

// Vue 插件安装函数重载
export function install(app: App): void
export function install(app: App, options: OneTagOptions): void
export function install(app: App, options?: OneTagOptions): void {
  // 注册组件
  app.component('TagComponent', TagComponent)
  app.component('OneTag', TagComponent)

  // 如果没有提供选项，只注册组件
  if (!options) {
    return
  }

  const { pinia, router, ...config } = options

  // 检查必需的实例
  if (!pinia || !router) {
    throw new Error(
      '[OneTag] 必须传入 pinia 和 router 实例：\n' +
        'const pinia = createPinia()\n' +
        'const router = createRouter({...})\n' +
        'app.use(pinia)\n' +
        'app.use(router)\n' +
        'app.use(OneTag, { pinia, router, homePath: "/dashboard", homeTitle: "控制台" })',
    )
  }

  // 立即配置
  setupTag(pinia, router, config)
}

// 内部配置函数
function setupTag(pinia: Pinia, router: Router, config: TagConfig) {
  try {
    // 设置 Pinia 实例
    setTagPiniaInstance(pinia)

    // 设置配置
    if (Object.keys(config).length > 0) {
      setConfig(config)
    }

    // 启用自动标签管理
    enableAutoTags(router)

    // 通过类型断言读取 DEV，避免跨包 typecheck 时对 ImportMeta.env 的硬依赖。
    const isDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true
    if (isDev) {
      console.log('[OneTag] 自动配置完成')
    }
  } catch (error) {
    // 错误日志保留（重要）
    console.error('[OneTag] 自动配置失败:', error)
  }
}

// 默认插件对象
export default {
  install,
  TagComponent,
}
