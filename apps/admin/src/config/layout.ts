import type { LayoutMode, SystemSwitchStyle } from '@one-base-template/core';

/**
 * 管理端布局配置（仅代码配置，不走运行时 platform-config）。
 *
 * 如需调整布局，请直接修改本文件：
 * - layoutMode: side | top
 * - systemSwitchStyle: dropdown | menu
 */
export const appLayoutMode: LayoutMode = 'side';
export const appSystemSwitchStyle: SystemSwitchStyle = 'menu';
