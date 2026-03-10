export {
  createCore,
  type CoreHookOptions,
  type CoreOptions,
  type CoreTableConfirmAdapter,
} from './createCore';
export {
  parseRuntimeConfig,
  type RuntimeConfig,
  type BackendKind,
  type AuthMode,
  type MenuMode as PlatformMenuMode,
  type MenuRoutePreset,
  type EnabledModulesSetting,
} from './config/platform-config';
export type {
  BackendAdapter,
  AssetAdapter,
  AuthAdapter,
  MenuAdapter,
  SsoAdapter,
  AppMenuItem,
  AppMenuSystem,
  AppUser,
  LoginPayload,
  MenuMode,
} from './adapter/types';

export { createHttpClient, type HttpClientOptions } from './http/client';
export { createObHttp, type ObHttp } from './http/pureHttp';
export { getObHttpClient, setObHttpClient } from './http/runtime';
export type {
  CreateObHttpOptions,
  ObAuthMode,
  ObBizCode,
  ObHttpAuthOptions,
  ObHttpBizOptions,
  ObHttpDownloadOptions,
  ObHttpError,
  ObHttpHooks,
  ObHttpRequestConfig,
  RequestMethods,
} from './http/types';
export { apiWrapper, type ObApiWrapperResult } from './http/apiWrapper';

export { useAuthStore } from './stores/auth';
export { useAssetStore } from './stores/assets';
export {
  useLayoutStore,
  DEFAULT_LAYOUT_TOPBAR_HEIGHT,
  DEFAULT_LAYOUT_SIDEBAR_WIDTH,
  DEFAULT_LAYOUT_SIDEBAR_COLLAPSED_WIDTH,
  type LayoutMode,
  type LayoutOptions,
  type SystemSwitchStyle,
} from './stores/layout';
export { useMenuStore } from './stores/menu';
export { useSystemStore, type SystemOptions, type AppSystemInfo } from './stores/system';
export {
  useThemeStore,
  type ThemeMode,
  type ThemeSemanticColors,
  type ThemePrimaryScale,
  type ThemeDefinition,
  type ThemeApplyPayload,
  type ThemeOptions,
} from './stores/theme';
export {
  ONE_BUILTIN_THEMES,
  applyOneTheme,
  buildOneTokens,
  buildOneStaticTokens,
  buildOneRuntimeTokens,
  buildPrimaryScale,
  resolveThemePresetKey,
} from './theme/one';
export type { ThemePresetKey, OneTokenMap, PrimaryScale } from './theme/one';

export { setupRouterGuards, type RouterGuardOptions } from './router/guards';
export { handleSsoCallback } from './router/sso';
export { getInitialPath, type GetInitialPathOptions } from './router/initial-path';
export { resolveAppRedirectTarget } from './router/redirect';
export { buildRouteFullPath, normalizeRoutePath, toRouteNameKey } from './router/route-utils';
export { buildFixedRoutes, type BuildFixedRoutesOptions, type PublicRouteDefinition } from './router/fixed-routes';
export {
  createModuleRouteAssemblyValidator,
  buildModuleRoutes,
  buildModuleAliasRoutes,
  type RouteSource,
  type RouteCollectContext,
  type RouteAssemblyValidator,
  type RouteAssemblyModule,
} from './router/module-assembly';
export type {
  ModuleTier,
  RouteAlias,
  ModuleCompat,
  AppModuleManifestMeta,
  CoreAppModuleManifest,
  OptionalAppModuleManifest,
  AppModuleManifest,
  AppModuleDeclarationModule,
} from './router/module-assembly';
export {
  collectModuleLoadEntries,
  pickEnabledModuleEntries,
  resolveModuleDeclarationCandidate,
  validateModuleDeclaration,
  isValidAppModuleManifestMeta,
  isValidAppModuleManifest,
  toModuleDeclarationPath,
  type ModuleLoadEntry,
} from './router/module-registry';
export {
  getCoreStorageNamespace,
  getNamespacedKey,
  getNamespacedPrefix,
  getWithLegacy,
  removeWithLegacy,
  clearByPrefixes,
} from './storage/namespace';

export { createStaticMenusFromRoutes, type CreateStaticMenusOptions } from './menu/fromRoutes';
export { finalizeAuthSession, safeRedirect, type FinalizeAuthSessionOptions } from './auth/flow';
export {
  loginByPassword,
  resolvePortalLoginTarget,
  type LoginByPasswordOptions,
  type PortalFrontConfig,
  type ResolvePortalLoginTargetOptions,
} from './auth/login';

export {
  useTable,
  setUseTableDefaults,
  getUseTableDefaults,
  type UseTableOptions,
  type UseTableQueryOptions,
  type UseTableRemoveOptions,
  type UseTableDeleteConfirmOptions,
  type UseTableHooks,
  type UseTableReturn,
  type PaginationConfig,
  type UseTablePaginationKey,
  type UseTablePaginationAlias,
  type UseTableDefaults,
  type UseTableStandardResponse,
  type UseTableCacheInfo,
  type CacheInvalidationStrategy,
} from './hooks/useTable';
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
export {
  useCrudPage,
  type CrudPageRefreshAfterDelete,
  type CrudPageRefreshAfterSave,
  type UseCrudPageBehavior,
  type UseCrudPageOptions,
  type UseCrudPageReturn,
} from './hooks/useCrudPage';
