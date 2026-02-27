/**
 * @one-base-template/tag 包入口文件
 *
 * 这是一个纯粹的导出入口，不包含任何业务逻辑
 * 所有功能都通过模块化的方式从各自的文件中导出
 */

// ===== 样式说明 =====
// 组件样式已内联到 Vue 组件中，避免全局样式污染
// 不再依赖 Element Plus 样式，使用自定义 dropdown 组件

// ===== 重新导出所有 API =====
export * from './exports'

// ===== Vue 插件导出（保持向后兼容）=====
export { default } from './plugin'
export { default as OneTagPlugin } from './plugin'
