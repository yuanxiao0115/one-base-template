import type { BackendKind } from '../config/platform-config';

export interface RouteQueryLike {
  token?: unknown;
}

export interface LoginScenario {
  useVerifyLogin: boolean;
  shouldLoadLoginPageConfig: boolean;
  fallback: string;
  directLoginToken: string | null;
}

export interface BuildLoginScenarioOptions {
  backend: BackendKind;
  routeQuery: RouteQueryLike;
  verifyLoginBackend?: BackendKind;
  verifyLoginFallback: string;
  defaultFallback?: string;
}

function getDirectLoginToken(routeQuery: RouteQueryLike, enabled: boolean) {
  if (!enabled) {
    return null;
  }

  return typeof routeQuery.token === 'string' && routeQuery.token ? routeQuery.token : null;
}

export function buildLoginScenario(options: BuildLoginScenarioOptions): LoginScenario {
  const {
    backend,
    routeQuery,
    verifyLoginBackend = 'basic',
    verifyLoginFallback,
    defaultFallback = '/'
  } = options;
  const useVerifyLogin = backend === verifyLoginBackend;

  return {
    useVerifyLogin,
    shouldLoadLoginPageConfig: useVerifyLogin,
    fallback: useVerifyLogin ? verifyLoginFallback : defaultFallback,
    directLoginToken: getDirectLoginToken(routeQuery, useVerifyLogin)
  };
}
