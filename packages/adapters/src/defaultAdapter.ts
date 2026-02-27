import type { BackendAdapter, AppMenuItem, AppUser, LoginPayload, ObHttp } from '@one-base-template/core';

function isBizWrapped(value: unknown): value is { code?: unknown; data?: unknown } {
  return typeof value === 'object' && value !== null && 'code' in value && 'data' in value;
}

function unwrapBizData<T>(value: unknown): T {
  if (isBizWrapped(value)) {
    return (value.data ?? null) as T;
  }
  return value as T;
}

export function createDefaultAdapter(http: ObHttp): BackendAdapter {
  return {
    auth: {
      async login(payload: LoginPayload) {
        await http.post('/api/auth/login', {
          data: payload,
          $cancelOnRouteChange: false
        });
      },
      async logout() {
        await http.post('/api/auth/logout', { $cancelOnRouteChange: false });
      },
      async fetchMe() {
        const res = await http.get('/api/auth/me', { $cancelOnRouteChange: false });
        return unwrapBizData<AppUser>(res);
      }
    },
    menu: {
      async fetchMenuTree() {
        const res = await http.get('/api/menu/tree', { $cancelOnRouteChange: false });
        return unwrapBizData<AppMenuItem[]>(res);
      }
    },
    sso: {
      async exchangeToken(token: string) {
        await http.post('/api/sso/exchange-token', {
          data: { token },
          $cancelOnRouteChange: false
        });
      },
      async exchangeTicket(payload: { ticket: string; serviceUrl?: string }) {
        await http.post('/api/sso/exchange-ticket', {
          data: payload,
          $cancelOnRouteChange: false
        });
      },
      async exchangeOAuthCode(payload: { code: string; state?: string; redirectUri?: string }) {
        await http.post('/api/sso/exchange-code', {
          data: payload,
          $cancelOnRouteChange: false
        });
      }
    }
  };
}
