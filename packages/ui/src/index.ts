import './styles/iconfont.css';
import './styles/table-theme.css';

export { default as AdminLayout } from './layouts/AdminLayout.vue';
export { default as SidebarMenu } from './components/menu/SidebarMenu.vue';
export { default as MenuIcon } from './components/menu/MenuIcon.vue';
export { default as MenuIconInput } from './components/menu/MenuIconInput.vue';
export { default as TopBar } from './components/top/TopBar.vue';
export { default as TabsBar } from './components/tabs/TabsBar.vue';
export { default as ThemeSwitcher } from './components/theme/ThemeSwitcher.vue';
export { default as KeepAliveView } from './components/view/KeepAliveView.vue';
export { default as FontIcon } from './components/icon/FontIcon.vue';
export { default as ObCard } from './components/card/ObCard.vue';
export { default as ObColorField } from './components/field/ObColorField.vue';
export { default as PageContainer } from './components/container/PageContainer.vue';
export { default as CrudContainer } from './components/container/CrudContainer.vue';
export { default as Tree } from './components/tree/Tree.vue';
export { default as ActionButtons } from './components/table/ActionButtons.vue';
export { default as TableBox } from './components/table/TableBox.vue';
export { default as CardTable } from './components/table/CardTable.vue';
export { default as Table } from './components/table/Table.vue';
export { default as ImportUpload } from './components/upload/ImportUpload.vue';
export { default as UploadShell } from './components/upload/UploadShell.vue';
export { default as FilePreview } from './components/preview/FilePreview.vue';
export { default as PersonnelSelector } from './components/personnel-selector/PersonnelSelector.vue';
export { default as RichText } from './components/rich-text/RichText.vue';
export { AccountCenterPanel } from './components/account-center';
export { CommandPalette } from './components/command-palette';
export { DialogHost } from './components/dialog-host';
export { LoginBox, LoginBoxV2 } from './lite-auth';
export {
  ensureMenuIconifyCollectionsRegistered,
  getMenuIconifyNames,
  isMenuIconifyValue,
  type MenuIconifyPrefix
} from './iconify/menu-iconify';
export type {
  MenuIconfontGlyph,
  MenuIconfontSource,
  MenuIconfontSourceKey
} from './components/menu/menu-iconfont-sources';
export {
  buildMenuIconfontValue,
  MENU_ICONFONT_SOURCE_MAP,
  MENU_ICONFONT_SOURCES,
  normalizeIconfontClass
} from './components/menu/menu-iconfont-sources';
export type {
  AdaptiveConfig,
  TableAlign,
  TableColumn,
  TableColumnHeaderRendererParams,
  TableColumnList,
  TableColumnRendererParams,
  TableColumnType,
  TableDefaultLocale,
  TableFixed,
  TableLoadingConfig,
  TableLocaleInput,
  TableLocaleObject,
  TablePaginationAlign,
  TablePaginationSize,
  TablePagination,
  TableRowDragConfig,
  TableRowDragSortPayload,
  TableSortable,
  VxeVirtualConfig
} from './components/table/types';
export {
  openPersonnelSelection,
  type OpenPersonnelSelectionOptions
} from './components/personnel-selector/openPersonnelSelection';
export type {
  OpenPersonnelSelectionResult,
  PersonnelFetchNodes,
  PersonnelNode,
  PersonnelNodeType,
  PersonnelSearchNodes,
  PersonnelSelectedItem,
  PersonnelSelectedOrg,
  PersonnelSelectedPosition,
  PersonnelSelectedRole,
  PersonnelSelectedUser,
  PersonnelSelectionField,
  PersonnelSelectionModel,
  PersonnelSelectMode
} from './components/personnel-selector/types';
export type { RichTextProfile } from './components/rich-text/rich-text-html';
export type {
  AccountCenterAvatarUrlResolver,
  AccountCenterAvatarUrlResolverParams,
  AccountCenterChangePassword,
  AccountCenterCheckPassword,
  AccountCenterEncryptPassword,
  AccountCenterIsAvatarHidden,
  AccountCenterResolveSuccess,
  AccountCenterResponse,
  AccountCenterSetAvatarHidden,
  AccountCenterUploadAvatar,
  AccountCenterUploadAvatarPayload,
  AccountCenterUser
} from './components/account-center';
export type {
  BuildCommandPaletteItemsOptions,
  CommandPaletteItem,
  CommandPaletteMenuItems,
  CommandPaletteNavigatePayload,
  UseCommandPaletteOptions
} from './components/command-palette';
export {
  closeAllDialogs,
  closeDialog,
  getDialogHostQueue,
  openDialog
} from './components/dialog-host';
export type {
  DialogHostActionContext,
  DialogHostBeforeCloseContext,
  DialogHostClassName,
  DialogHostCloseReason,
  DialogHostContainer,
  DialogHostOpenOptions,
  DialogHostQueueItem,
  DialogHostRenderContext,
  DialogHostRenderer
} from './components/dialog-host';
export {
  buildCommandPaletteItemsFromMenus,
  filterCommandPaletteItems,
  normalizeCommandPaletteKeyword,
  useCommandPalette
} from './components/command-palette';
export {
  getRichTextToolbarExcludeKeys,
  normalizeRichTextHtml,
  sanitizeRichTextHtml,
  toSafeRichTextHtml
} from './components/rich-text/rich-text-html';
export { default as ForbiddenPage } from './pages/error/ForbiddenPage.vue';
export { default as NotFoundPage } from './pages/error/NotFoundPage.vue';
export { confirm, obConfirm, openSecondaryConfirm, type ConfirmTone } from './feedback/confirm';
export {
  closeAllMessage,
  message,
  registerMessageUtils,
  type MessageParams,
  type ObMessageFn
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
  type UseEntityEditorReturn
} from './hooks/useEntityEditor';
export {
  OneUiObTablePlugin,
  registerOneObTableUiComponents,
  type OneObTableUiPluginOptions,
  type OneObTableUiComponentName
} from './plugin-obtable';
export {
  OneUiObTablePlugin as OneUiPlugin,
  registerOneObTableUiComponents as registerOneUiComponents,
  type OneObTableUiPluginOptions as OneUiPluginOptions,
  type OneObTableUiComponentName as OneUiComponentName
} from './plugin-obtable';
export { default } from './plugin-obtable';
