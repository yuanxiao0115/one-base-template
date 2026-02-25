import type { App } from 'vue';
import type { BackendAdapter, MenuMode, AppMenuItem } from './adapter/types';
import { setCoreOptions } from './context';
import { useLayoutStore, type LayoutOptions } from './stores/layout';
import { useSystemStore, type SystemOptions } from './stores/system';
import { useThemeStore, type ThemeOptions } from './stores/theme';

export interface CoreOptions {
  adapter: BackendAdapter;
  menuMode: MenuMode;
  /**
   * 静态菜单模式下提供的菜单树。
   * 为了保持 core 与业务解耦，本脚手架选择由 app 提供一份静态菜单配置。
   */
  staticMenus?: AppMenuItem[];
  sso: {
    enabled: boolean;
    routePath: '/sso';
    strategies: Array<
      | { type: 'token'; paramNames: string[]; exchange: 'direct' | 'adapter' }
      | { type: 'ticket'; paramNames: string[]; serviceUrlParam?: string }
      | { type: 'oauth'; codeParam?: string; stateParam?: string; redirectUri?: string }
    >;
  };
  theme: ThemeOptions;
  /**
   * UI 布局配置（由 UI 包读取 core store，不引入具体 UI 依赖）
   */
  layout?: LayoutOptions;
  /**
   * 多系统菜单配置（可选）。
   */
  systems?: SystemOptions;
}

export function createCore(options: CoreOptions): { install(app: App): void } {
  return {
    install(app: App) {
      setCoreOptions(options);

      // 主题初始化：优先使用本地缓存，没有则用默认主题
      const themeStore = useThemeStore();
      themeStore.init(options.theme);

      // 布局初始化：默认允许持久化（可通过 options.layout.persist 关闭）
      const layoutStore = useLayoutStore();
      layoutStore.init(options.layout);

      // 系统初始化：默认系统、系统首页映射等（由 app 注入）
      const systemStore = useSystemStore();
      systemStore.init(options.systems);

      // 允许在模板侧通过 inject 或全局属性扩展，这里不强行注入任何内容
      void app;
    }
  };
}
