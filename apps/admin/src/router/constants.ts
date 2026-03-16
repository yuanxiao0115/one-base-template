export const routePaths = {
  root: '/',
  login: '/login',
  sso: '/sso',
  forbidden: '/403',
  notFound: '/404',
  catchall: '/:pathMatch(.*)*'
} as const;
