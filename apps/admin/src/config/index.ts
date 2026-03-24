/**
 * admin 配置统一出口。
 *
 * 维护约束：
 * - 这里只导出“可维护配置项”；
 * - 工具逻辑请放到 `utils/*` 或 `services/*`，不要回流到 `config/*`。
 */
export { appSsoOptions } from './sso';
export { createSystemsOptions, DEFAULT_FALLBACK_HOME } from './systems';
export { appThemeOptions } from './theme';
export { appCrudContainerDefaultType, appTableDefaults } from './ui';
export {
  appLayoutMode,
  appSystemSwitchStyle,
  appTopbarHeight,
  appSidebarWidth,
  appSidebarCollapsedWidth
} from './layout';
