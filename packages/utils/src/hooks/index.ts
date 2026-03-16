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
  type UseLoadingReturn
} from './useLoading';

// 重新导入用于默认导出
import useLoading, { getGlobalLoading, setGlobalLoading } from './useLoading';

// 默认导出
export default {
  useLoading,
  getGlobalLoading,
  setGlobalLoading
};
