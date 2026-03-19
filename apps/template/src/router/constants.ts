export const APP_ROOT_PATH = '/';
export const APP_LOGIN_ROUTE_PATH = '/login';
export const APP_FORBIDDEN_ROUTE_PATH = '/403';
export const APP_NOT_FOUND_ROUTE_PATH = '/404';
export const APP_NOT_FOUND_CATCHALL_PATH = '/:pathMatch(.*)*';

export const APP_PUBLIC_ROUTE_PATHS = [
  APP_LOGIN_ROUTE_PATH,
  APP_FORBIDDEN_ROUTE_PATH,
  APP_NOT_FOUND_ROUTE_PATH
] as const;
