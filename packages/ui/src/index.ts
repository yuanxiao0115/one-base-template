import 'vxe-pc-ui/lib/style.css';
import 'vxe-table/lib/style.css';
import './styles/vxe-theme.css';
import './styles/iconfont.css';

export { default as AdminLayout } from './layouts/AdminLayout.vue';
export { default as SidebarMenu } from './components/menu/SidebarMenu.vue';
export { default as MenuIcon } from './components/menu/MenuIcon.vue';
export { default as TopBar } from './components/top/TopBar.vue';
export { default as TabsBar } from './components/tabs/TabsBar.vue';
export { default as ThemeSwitcher } from './components/theme/ThemeSwitcher.vue';
export { default as KeepAliveView } from './components/view/KeepAliveView.vue';
export { default as FontIcon } from './components/icon/FontIcon.vue';
export { default as ObCard } from './components/card/ObCard.vue';
export { default as PageContainer } from './components/container/PageContainer.vue';
export { default as CrudContainer } from './components/container/CrudContainer.vue';
export { default as Tree } from './components/tree/Tree.vue';
export { default as ActionButtons } from './components/table/ActionButtons.vue';
export { default as TableBox } from './components/table/TableBox.vue';
export { default as VxeTable } from './components/table/VxeTable.vue';
export { default as ImportUpload } from './components/upload/ImportUpload.vue';
export { LoginBox, LoginBoxV2 } from './lite-auth';
export {
  ensureMenuIconifyCollectionsRegistered,
  getMenuIconifyNames,
  isMenuIconifyValue,
  type MenuIconifyPrefix,
} from './iconify/menu-iconify';
export type {
  AdaptiveConfig,
  TableAlign,
  TableColumn,
  TableColumnList,
  TableColumnRendererParams,
  TableColumnType,
  TableFixed,
  TablePagination,
  TableSortable,
  VxeVirtualConfig,
} from './components/table/types';
export { default as ForbiddenPage } from './pages/error/ForbiddenPage.vue';
export { default as NotFoundPage } from './pages/error/NotFoundPage.vue';
export {
  confirm,
  obConfirm,
  openSecondaryConfirm,
  type ConfirmTone,
} from './feedback/confirm';
export {
  closeAllMessage,
  message,
  registerMessageUtils,
  type MessageParams,
  type ObMessageFn,
} from './feedback/message';
export type { CrudContainerGlobalConfig, OneUiGlobalConfig } from './config';
export {
  useEntityEditor,
  type CrudBeforeOpenContext,
  type CrudBuildPayloadContext,
  type CrudContainerType,
  type CrudDetailOptions,
  type CrudEntityOptions,
  type CrudErrorContext,
  type CrudFormOptions,
  type CrudFormLike,
  type CrudLoadDetailContext,
  type CrudMapDetailToFormContext,
  type CrudMode,
  type CrudOpenCreateOptions,
  type CrudOpenRowOptions,
  type CrudSaveOptions,
  type CrudSaveContext,
  type CrudSaveSuccessContext,
  type UseEntityEditorOptions,
  type UseEntityEditorReturn,
} from './hooks/useEntityEditor';
export { OneUiPlugin, registerOneUiComponents, type OneUiPluginOptions, type OneUiComponentName } from './plugin';
export { default } from './plugin';
