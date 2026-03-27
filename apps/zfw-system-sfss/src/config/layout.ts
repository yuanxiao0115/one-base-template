import {
  DEFAULT_LAYOUT_SIDEBAR_COLLAPSED_WIDTH,
  type LayoutMode,
  type SystemSwitchStyle
} from '@one-base-template/core';

/**
 * template 布局配置（仅代码配置，不走运行时 platform-config）。
 */
export const appLayoutMode: LayoutMode = 'side';
export const appSystemSwitchStyle: SystemSwitchStyle = 'menu';
export const appTopbarHeight = '56px';
export const appSidebarWidth = '220px';
export const appSidebarCollapsedWidth = DEFAULT_LAYOUT_SIDEBAR_COLLAPSED_WIDTH;
