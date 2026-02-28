/**
 * @one/utils - 一站式工具函数库
 * @description 为One Admin项目提供全面的工具函数支持
 * @version 1.0.0
 * @author One Admin Team
 */

// 核心工具模块 - 使用命名空间导出避免冲突
export * as url from './url'
export * as tree from './tree'
export * as array from './array'
export * as object from './object'
export * as validation from './validation'
export * as date from './date'
export * as file from './file'
export * as format from './format'
export * as type from './type'
export * as math from './math'

// 扩展工具模块
export * as http from './http'
export * as microApp from './micro-app'
export * as tool from './tool'

// 框架集成模块
export * from './vue'
export * as hooks from './hooks'
export { useCrudContainer, setUseTableDefaults, getUseTableDefaults } from './hooks'

// 兼容性模块（保留原有工具）
export * from './auth'
export * from './storage'
export * from './base64'
export * from './pinyin'
export * from './crypto'
export * from './sm3'
export * from './sm4'

// 存储工具模块 - 单独导出以避免命名冲突
export * as storage from './storage'

// 类型定义
export type { TreeNode, MenuNode } from './tree'
export type { HttpResponse, HttpError, RequestConfig } from './http'
export type { MicroAppData, IframeData } from './micro-app'
export type { Point } from './math'
export type {
  UseLoadingOptions,
  UseLoadingReturn,
  CrudBeforeOpenContext,
  CrudContainerType,
  CrudErrorContext,
  CrudFormLike,
  CrudLoadDetailContext,
  CrudMapDetailToFormContext,
  CrudMode,
  CrudOpenCreateOptions,
  CrudOpenRowOptions,
  CrudSubmitContext,
  CrudSuccessContext,
  UseCrudContainerOptions,
  UseCrudContainerReturn,
  UseTableOptions,
  UseTableConfig,
  UseTableReturn,
  PaginationConfig,
  UseTablePaginationKey,
  UseTablePaginationAlias,
  UseTableDefaults,
  UseTableStandardResponse,
  UseTableCacheInfo,
  CacheInvalidationStrategy
} from './hooks'

// 版本信息
export const version = '1.0.0'

// 默认导出
export default {
  version,
  // 可以添加其他默认导出内容
}
