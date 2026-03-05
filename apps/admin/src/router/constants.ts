export const APP_ROOT_PATH = '/';
export const APP_LOGIN_ROUTE_PATH = '/login';
export const APP_SSO_ROUTE_PATH = '/sso';
export const APP_FORBIDDEN_ROUTE_PATH = '/403';
export const APP_NOT_FOUND_ROUTE_PATH = '/404';
export const APP_NOT_FOUND_CATCHALL_PATH = '/:pathMatch(.*)*';

export const APP_PUBLIC_ROUTE_PATHS = [
  APP_ROOT_PATH,
  APP_LOGIN_ROUTE_PATH,
  APP_SSO_ROUTE_PATH,
  APP_FORBIDDEN_ROUTE_PATH,
  APP_NOT_FOUND_ROUTE_PATH
] as const;

export const APP_GUARD_PUBLIC_ROUTE_PATHS = [
  APP_LOGIN_ROUTE_PATH,
  APP_SSO_ROUTE_PATH,
  APP_FORBIDDEN_ROUTE_PATH,
  APP_NOT_FOUND_ROUTE_PATH
] as const;

export const APP_RESERVED_ROUTE_PATHS = new Set<string>([
  ...APP_PUBLIC_ROUTE_PATHS,
  APP_NOT_FOUND_CATCHALL_PATH
]);

export const APP_RESERVED_ROUTE_NAMES = new Set<string>([
  'Login',
  'Sso',
  'Forbidden',
  'NotFound'
]);
