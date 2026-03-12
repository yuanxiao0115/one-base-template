import type { App, Component } from 'vue';
import AdminLayout from './layouts/AdminLayout.vue';
import SidebarMenu from './components/menu/SidebarMenu.vue';
import MenuIcon from './components/menu/MenuIcon.vue';
import TopBar from './components/top/TopBar.vue';
import TabsBar from './components/tabs/TabsBar.vue';
import ThemeSwitcher from './components/theme/ThemeSwitcher.vue';
import KeepAliveView from './components/view/KeepAliveView.vue';
import FontIcon from './components/icon/FontIcon.vue';
import ObCard from './components/card/ObCard.vue';
import PageContainer from './components/container/PageContainer.vue';
import CrudContainer from './components/container/CrudContainer.vue';
import Tree from './components/tree/Tree.vue';
import ActionButtons from './components/table/ActionButtons.vue';
import TableBox from './components/table/TableBox.vue';
import VxeTable from './components/table/VxeTable.vue';
import ImportUpload from './components/upload/ImportUpload.vue';
import { setUseTableDefaults, type UseTableDefaults } from '@one-base-template/core';
import { ONE_UI_GLOBAL_CONFIG_KEY, createOneUiGlobalConfig, type CrudContainerGlobalConfig } from './config';

const UI_COMPONENTS = {
  AdminLayout,
  SidebarMenu,
  MenuIcon,
  TopBar,
  TabsBar,
  ThemeSwitcher,
  KeepAliveView,
  FontIcon,
  Card: ObCard,
  PageContainer,
  CrudContainer,
  Tree,
  ActionButtons,
  TableBox,
  VxeTable,
  ImportUpload,
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
  /**
   * 全局 CRUD 容器配置（如默认 dialog/drawer）。
   */
  crudContainer?: CrudContainerGlobalConfig;
  /**
   * 全局 useTable 默认配置（分页参数、响应适配器等）。
   */
  table?: UseTableDefaults;
}

function shouldRegister(options: OneUiPluginOptions, name: OneUiComponentName): boolean {
  if (!options.include) {
    return true;
  }
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

  (Object.entries(UI_COMPONENTS) as [OneUiComponentName, Component][]).forEach(([name, component]) => {
    if (!shouldRegister(options, name)) {
      return;
    }

    registerComponent(app, `${prefix}${name}`, component);
    if (aliases) {
      registerComponent(app, name, component);
    }
  });
}

export const OneUiPlugin = {
  install(app: App, options?: OneUiPluginOptions) {
    app.provide(
      ONE_UI_GLOBAL_CONFIG_KEY,
      createOneUiGlobalConfig({
        crudContainer: options?.crudContainer,
      })
    );

    if (options?.table) {
      setUseTableDefaults(options.table);
    }

    registerOneUiComponents(app, options);
  },
};

export default OneUiPlugin;
