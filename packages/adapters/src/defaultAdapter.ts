import type { AxiosInstance } from 'axios';
import type { BackendAdapter, AppMenuItem, AppUser } from '@standard-base-tamplate/core';

export function createDefaultAdapter(http: AxiosInstance): BackendAdapter {
  return {
    auth: {
      async login(payload: { username: string; password: string }) {
        await http.post('/api/auth/login', payload);
      },
      async logout() {
        await http.post('/api/auth/logout');
      },
      async fetchMe() {
        const me = (await http.get('/api/auth/me')) as AppUser;
        return me;
      }
    },
    menu: {
      async fetchMenuTree() {
        const tree = (await http.get('/api/menu/tree')) as AppMenuItem[];
        return tree;
      }
    },
    sso: {
      async exchangeToken(token: string) {
        await http.post('/api/sso/exchange-token', { token });
      },
      async exchangeTicket(payload: { ticket: string; serviceUrl?: string }) {
        await http.post('/api/sso/exchange-ticket', payload);
      },
      async exchangeOAuthCode(payload: { code: string; state?: string; redirectUri?: string }) {
        await http.post('/api/sso/exchange-code', payload);
      }
    }
  };
}
