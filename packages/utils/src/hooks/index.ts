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

// 对话框管理
export { useDialog, DialogMode, type UseDialogOptions, type UseDialogReturn } from './useDialog'

// 抽屉管理
export { useDrawer, DrawerMode, type UseDrawerOptions, type UseDrawerReturn } from './useDrawer'

// 表格数据管理
export {
  useTable,
  type UseTableOptions,
  type UseTableConfig,
  type UseTableReturn,
  type PaginationConfig,
  type UseTableStandardResponse,
  type UseTableCacheInfo,
  type CacheInvalidationStrategy,
} from './useTable'

// 重新导入用于默认导出
import useLoading, { getGlobalLoading, setGlobalLoading } from './useLoading'
import useDialog, { DialogMode } from './useDialog'
import useDrawer, { DrawerMode } from './useDrawer'
import useTable from './useTable'

// 默认导出
export default {
  useLoading,
  useDialog,
  useDrawer,
  useTable,
  DialogMode,
  DrawerMode,
  getGlobalLoading,
  setGlobalLoading,
}
