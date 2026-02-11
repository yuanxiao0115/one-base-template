import type { App } from 'vue';
import type { BackendAdapter, MenuMode, AppMenuItem } from './adapter/types';
import { setCoreOptions } from './context';
import { useThemeStore } from './stores/theme';

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
  theme: {
    defaultTheme: string;
    themes: Record<string, { primary: string }>;
  };
}

export function createCore(options: CoreOptions): { install(app: App): void } {
  return {
    install(app: App) {
      setCoreOptions(options);

      // 主题初始化：优先使用本地缓存，没有则用默认主题
      const themeStore = useThemeStore();
      themeStore.init(options.theme);

      // 允许在模板侧通过 inject 或全局属性扩展，这里不强行注入任何内容
      void app;
    }
  };
}
