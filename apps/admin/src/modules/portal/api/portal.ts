import { portalApiClient } from './client';

// 兼容历史导入路径（后续推荐改为通过 services 层调用）
export const portalApi = portalApiClient;
