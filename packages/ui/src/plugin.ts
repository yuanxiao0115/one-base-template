import type { App, Component } from 'vue';
import AdminLayout from './layouts/AdminLayout.vue';
import SidebarMenu from './components/menu/SidebarMenu.vue';
import TopBar from './components/top/TopBar.vue';
import TabsBar from './components/tabs/TabsBar.vue';
import ThemeSwitcher from './components/theme/ThemeSwitcher.vue';
import KeepAliveView from './components/view/KeepAliveView.vue';
import FontIcon from './components/icon/FontIcon.vue';

const UI_COMPONENTS = {
  AdminLayout,
  SidebarMenu,
  TopBar,
  TabsBar,
  ThemeSwitcher,
  KeepAliveView,
  FontIcon
} as const;

export type OneUiComponentName = keyof typeof UI_COMPONENTS;

export interface OneUiPluginOptions {
  /**
   * 全局组件名前缀，默认 Ob（例如 ObThemeSwitcher）。
   */
  prefix?: string;
  /**
   * 是否同时注册无前缀别名（例如 ThemeSwitcher），默认 false。
   */
  aliases?: boolean;
  /**
   * 仅注册指定组件；未提供时默认全部注册。
   */
  include?: Partial<Record<OneUiComponentName, boolean>>;
}

function shouldRegister(options: OneUiPluginOptions, name: OneUiComponentName): boolean {
  if (!options.include) return true;
  return options.include[name] !== false;
}

function registerComponent(app: App, name: string, component: Component) {
  if (!app.component(name)) {
    app.component(name, component);
  }
}

export function registerOneUiComponents(app: App, options: OneUiPluginOptions = {}) {
  const prefix = options.prefix?.trim() || 'Ob';
  const aliases = options.aliases ?? false;

  (Object.entries(UI_COMPONENTS) as Array<[OneUiComponentName, Component]>).forEach(([name, component]) => {
    if (!shouldRegister(options, name)) return;

    registerComponent(app, `${prefix}${name}`, component);
    if (aliases) {
      registerComponent(app, name, component);
    }
  });
}

export const OneUiPlugin = {
  install(app: App, options?: OneUiPluginOptions) {
    registerOneUiComponents(app, options);
  }
};

export default OneUiPlugin;
