import {
  DEFAULT_LAYOUT_SIDEBAR_COLLAPSED_WIDTH,
  type LayoutMode,
  type SystemSwitchStyle
} from '@one-base-template/core';

/**
 * 管理端布局配置（仅代码配置，不走运行时 platform-config）。
 *
 * 维护建议：
 * - 该文件属于“按需维护”配置；
 * - 若只做业务开发，一般不需要修改本文件。
 *
 * 如需调整布局，请直接修改本文件：
 * - layoutMode: side | top
 * - systemSwitchStyle: dropdown | menu
 * - topbarHeight: 顶栏高度
 * - sidebarWidth: 侧边栏展开宽度
 * - sidebarCollapsedWidth: 侧边栏折叠宽度
 */
// 布局模式：side=顶部栏+左侧菜单，top=顶部横向菜单。
export const appLayoutMode: LayoutMode = 'side';
// 系统切换样式：dropdown=下拉，menu=菜单式切换。
export const appSystemSwitchStyle: SystemSwitchStyle = 'menu';
// 顶栏高度，建议使用 px 字符串。
export const appTopbarHeight = '60px';
// 左侧菜单展开宽度。
export const appSidebarWidth = '200px';
// 左侧菜单折叠宽度（默认来自 core 常量）。
export const appSidebarCollapsedWidth = DEFAULT_LAYOUT_SIDEBAR_COLLAPSED_WIDTH;
