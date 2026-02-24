/**
 * API 导出管理
 * 统一管理所有对外暴露的 API，便于维护和文档生成
 */

// ===== 核心 API =====
export { useTagAPI, type TagItem } from './api'
export { setConfig, getConfig, type TagConfig } from './config/configManager'
export { enableAutoTags } from './guards/tagGuard'

// ===== 辅助 API =====
export {
  HomeConfig,
  addTagFromRoute,
  onMenuChange,
  type TagPosition,
  type RouteIgnoreRule,
  type TagStorageConfig,
} from './api'

// ===== 集成相关 =====
export { setTagPiniaInstance } from './store'
export { useTagStoreHook } from './store'

// ===== 组件相关 =====
export { default as TagComponent } from './index.vue'

// ===== 插件相关 =====
export { install, type OneTagOptions } from './plugin'

// ===== 类型已在上面的具名导出中包含，无需重复导出 =====

/**
 * 导出清单（用于文档生成）
 */
export const EXPORTS = {
  // 核心功能
  core: ['useTagAPI', 'setConfig', 'getConfig', 'enableAutoTags'],

  // 辅助功能
  helpers: ['HomeConfig', 'addTagFromRoute', 'onMenuChange', 'setTagPiniaInstance'],

  // 组件
  components: ['TagComponent'],

  // 插件
  plugin: ['install'],

  // 类型
  types: [
    'TagItem',
    'TagConfig',
    'TagPosition',
    'RouteIgnoreRule',
    'TagStorageConfig',
    'OneTagOptions',
  ],
} as const
