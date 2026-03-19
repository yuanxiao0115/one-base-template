import type { PortalMaterialExtension } from '@one-base-template/portal-engine';

// admin 侧唯一扩展入口：直接在这里罗列“需要注册到 PortalManagement 的物料扩展”。
// 约束：不保留 examples/demo 分叉目录，新增物料时只维护这个数组。
export const PORTAL_ADMIN_MATERIAL_EXTENSIONS = [] satisfies PortalMaterialExtension[];
