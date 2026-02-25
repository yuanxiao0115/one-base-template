import {
  // DEFAULT_LAYOUT_TOPBAR_HEIGHT,
  // DEFAULT_LAYOUT_SIDEBAR_WIDTH,
  DEFAULT_LAYOUT_SIDEBAR_COLLAPSED_WIDTH,
  type LayoutMode,
  type SystemSwitchStyle
} from '@one-base-template/core';

/**
 * 管理端布局配置（仅代码配置，不走运行时 platform-config）。
 *
 * 如需调整布局，请直接修改本文件：
 * - layoutMode: side | top
 * - systemSwitchStyle: dropdown | menu
 * - topbarHeight: 顶栏高度
 * - sidebarWidth: 侧边栏展开宽度
 * - sidebarCollapsedWidth: 侧边栏折叠宽度
 */
export const appLayoutMode: LayoutMode = 'side';
export const appSystemSwitchStyle: SystemSwitchStyle = 'menu';
export const appTopbarHeight = '60px';
export const appSidebarWidth = '200px';
export const appSidebarCollapsedWidth = DEFAULT_LAYOUT_SIDEBAR_COLLAPSED_WIDTH;
