export { createCore, type CoreOptions } from './createCore';
export type {
  BackendAdapter,
  AuthAdapter,
  MenuAdapter,
  SsoAdapter,
  AppMenuItem,
  AppUser,
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
export { useMenuStore } from './stores/menu';
export { useTabsStore } from './stores/tabs';
export { useThemeStore } from './stores/theme';

export { setupRouterGuards } from './router/guards';
export { handleSsoCallbackFromLocation } from './router/sso';

export { createStaticMenusFromRoutes, type CreateStaticMenusOptions } from './menu/fromRoutes';
