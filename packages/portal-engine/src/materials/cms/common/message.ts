import { ElMessage } from 'element-plus';

/**
 * CMS 物料统一消息出口，避免业务组件散落直接依赖 ElMessage。
 */
export const message = {
  info: ElMessage.info,
  success: ElMessage.success,
  warning: ElMessage.warning,
  error: ElMessage.error,
};

