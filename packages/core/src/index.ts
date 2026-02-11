export { createCore, type CoreOptions } from './createCore';
export type {
  BackendAdapter,
  AuthAdapter,
  MenuAdapter,
  SsoAdapter,
  AppMenuItem,
  AppMenuSystem,
  AppUser,
  LoginPayload,
  MenuMode
} from './adapter/types';

export { createHttpClient, type HttpClientOptions } from './http/client';
export { createObHttp, type ObHttp } from './http/pureHttp';
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
  RequestMethods
} from './http/types';
export { apiWrapper, type ObApiWrapperResult } from './http/apiWrapper';

export { useAuthStore } from './stores/auth';
export { useLayoutStore, type LayoutMode, type LayoutOptions } from './stores/layout';
export { useMenuStore } from './stores/menu';
export { useSystemStore, type SystemOptions, type AppSystemInfo } from './stores/system';
export { useTabsStore } from './stores/tabs';
export { useThemeStore } from './stores/theme';

export { setupRouterGuards } from './router/guards';
export { handleSsoCallbackFromLocation } from './router/sso';

export { createStaticMenusFromRoutes, type CreateStaticMenusOptions } from './menu/fromRoutes';
