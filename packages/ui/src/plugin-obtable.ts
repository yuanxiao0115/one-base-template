import type { App, Component } from 'vue';
import AdminLayout from './layouts/AdminLayout.vue';
import SidebarMenu from './components/menu/SidebarMenu.vue';
import MenuIcon from './components/menu/MenuIcon.vue';
import MenuIconInput from './components/menu/MenuIconInput.vue';
import TopBar from './components/top/TopBar.vue';
import TabsBar from './components/tabs/TabsBar.vue';
import ThemeSwitcher from './components/theme/ThemeSwitcher.vue';
import KeepAliveView from './components/view/KeepAliveView.vue';
import FontIcon from './components/icon/FontIcon.vue';
import ObCard from './components/card/ObCard.vue';
import ObColorField from './components/field/ObColorField.vue';
import PageContainer from './components/container/PageContainer.vue';
import CrudContainer from './components/container/CrudContainer.vue';
import Tree from './components/tree/Tree.vue';
import ActionButtons from './components/table/ActionButtons.vue';
import TableBox from './components/table/TableBox.vue';
import CardTable from './components/table/CardTable.vue';
import Table from './components/table/Table.vue';
import ImportUpload from './components/upload/ImportUpload.vue';
import UploadShell from './components/upload/UploadShell.vue';
import FilePreview from './components/preview/FilePreview.vue';
import PersonnelSelector from './components/personnel-selector/PersonnelSelector.vue';
import RichText from './components/rich-text/RichText.vue';
import { AccountCenterPanel } from './components/account-center';
import { setUseTableDefaults, type UseTableDefaults } from '@one-base-template/core';
import {
  ONE_UI_GLOBAL_CONFIG_KEY,
  createOneUiGlobalConfig,
  type CrudContainerGlobalConfig
} from './config';

const OB_TABLE_UI_COMPONENTS = {
  AdminLayout,
  SidebarMenu,
  MenuIcon,
  MenuIconInput,
  TopBar,
  TabsBar,
  ThemeSwitcher,
  KeepAliveView,
  FontIcon,
  Card: ObCard,
  ColorField: ObColorField,
  PageContainer,
  CrudContainer,
  Tree,
  ActionButtons,
  TableBox,
  CardTable,
  Table,
  ImportUpload,
  UploadShell,
  FilePreview,
  PersonnelSelector,
  RichText,
  AccountCenterPanel
} as const;

export type OneObTableUiComponentName = keyof typeof OB_TABLE_UI_COMPONENTS;

export interface OneObTableUiPluginOptions {
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
  include?: Partial<Record<OneObTableUiComponentName, boolean>>;
  /**
   * 全局 CRUD 容器配置（如默认 dialog/drawer）。
   */
  crudContainer?: CrudContainerGlobalConfig;
  /**
   * 全局 useTable 默认配置（分页参数、响应适配器等）。
   */
  table?: UseTableDefaults;
  /**
   * 顶栏组件覆盖（例如 admin 应用注入自定义 TopBar）。
   */
  topBarComponent?: Component;
}

function shouldRegister(
  options: OneObTableUiPluginOptions,
  name: OneObTableUiComponentName
): boolean {
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

export function registerOneObTableUiComponents(app: App, options: OneObTableUiPluginOptions = {}) {
  const prefix = options.prefix?.trim() || 'Ob';
  const aliases = options.aliases ?? false;

  (Object.entries(OB_TABLE_UI_COMPONENTS) as [OneObTableUiComponentName, Component][]).forEach(
    ([name, component]) => {
      if (!shouldRegister(options, name)) {
        return;
      }

      registerComponent(app, `${prefix}${name}`, component);
      if (aliases) {
        registerComponent(app, name, component);
      }
    }
  );
}

export const OneUiObTablePlugin = {
  install(app: App, options?: OneObTableUiPluginOptions) {
    app.provide(
      ONE_UI_GLOBAL_CONFIG_KEY,
      createOneUiGlobalConfig({
        crudContainer: options?.crudContainer,
        topBarComponent: options?.topBarComponent
      })
    );

    if (options?.table) {
      setUseTableDefaults(options.table);
    }

    registerOneObTableUiComponents(app, options);
  }
};

export default OneUiObTablePlugin;
