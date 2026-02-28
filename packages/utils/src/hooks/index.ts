/**
 * Vue Hooks 工具集合
 * @description 提供常用的 Vue Composition API hooks，用于状态管理和业务逻辑复用
 */

// 加载状态管理
export {
  useLoading,
  getGlobalLoading,
  setGlobalLoading,
  type UseLoadingOptions,
  type UseLoadingReturn,
} from './useLoading'

// CRUD 容器管理
export {
  useCrudContainer,
  type CrudBeforeOpenContext,
  type CrudContainerType,
  type CrudErrorContext,
  type CrudFormLike,
  type CrudLoadDetailContext,
  type CrudMapDetailToFormContext,
  type CrudMode,
  type CrudOpenCreateOptions,
  type CrudOpenRowOptions,
  type CrudSubmitContext,
  type CrudSuccessContext,
  type UseCrudContainerOptions,
  type UseCrudContainerReturn
} from './useCrudContainer'

// 表格数据管理
export {
  useTable,
  setUseTableDefaults,
  getUseTableDefaults,
  type UseTableOptions,
  type UseTableConfig,
  type UseTableReturn,
  type PaginationConfig,
  type UseTablePaginationKey,
  type UseTablePaginationAlias,
  type UseTableDefaults,
  type UseTableStandardResponse,
  type UseTableCacheInfo,
  type CacheInvalidationStrategy,
} from './useTable'

// 重新导入用于默认导出
import useLoading, { getGlobalLoading, setGlobalLoading } from './useLoading'
import useCrudContainer from './useCrudContainer'
import useTable from './useTable'

// 默认导出
export default {
  useLoading,
  useCrudContainer,
  useTable,
  getGlobalLoading,
  setGlobalLoading,
}
