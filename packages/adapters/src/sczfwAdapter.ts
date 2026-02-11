import type { AppMenuItem, AppUser, BackendAdapter, LoginPayload, ObHttp } from '@one-base-template/core';

type BizResponse<T> = {
  code?: unknown;
  data?: T;
  message?: string;
};

type SczfwLoginResult = {
  authToken?: string;
  token?: string;
  id?: string;
  nickName?: string;
  avatar?: string;
  roleCodes?: string[];
  permissionCodes?: string[];
  [k: string]: unknown;
};

type SczfwMe = {
  id?: string;
  nickName?: string;
  avatar?: string;
  roleCodes?: string[];
  permissionCodes?: string[];
  [k: string]: unknown;
};

type SczfwMenuNode = {
  url?: string;
  resourceName?: string;
  icon?: string;
  hidden?: number;
  resourceType?: number;
  routeCache?: number;
  children?: SczfwMenuNode[];
  [k: string]: unknown;
};

type SczfwMenuRoot = {
  permissionCode?: string;
  children?: SczfwMenuNode[];
  [k: string]: unknown;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

function mapMenuItems(nodes: SczfwMenuNode[]): AppMenuItem[] {
  return nodes
    .filter(v => v.hidden !== 1 && (v.resourceType === 1 || v.resourceType === 2))
    .map(v => {
      const children = Array.isArray(v.children) && v.children.length ? mapMenuItems(v.children) : undefined;
      return {
        path: isNonEmptyString(v.url) ? v.url : '/',
        title: isNonEmptyString(v.resourceName) ? v.resourceName : '未命名菜单',
        icon: isNonEmptyString(v.icon) ? v.icon : undefined,
        keepAlive: v.routeCache === 1,
        children
      };
    });
}

/**
 * sczfw（standard-oa-web-sczfw）后端适配器：
 * - 登录：/cmict/auth/login（返回 authToken）
 * - 当前用户：/cmict/auth/token/verify
 * - 菜单树：/cmict/admin/permission/my-tree（取 permissionCode=systemPermissionCode 的 children，默认 admin_server）
 *
 * 说明：
 * - 本适配器默认使用 token 鉴权：会把 authToken 写入 localStorage，供 ObHttp 的 getToken() 使用。
 * - 登录 payload 允许携带额外字段（captcha/captchaKey/encrypt...），适配器会按后端字段名映射。
 */
export function createSczfwAdapter(
  http: ObHttp,
  options: {
    tokenKey: string;
    /** my-tree 根节点 permissionCode，默认 admin_server */
    systemPermissionCode?: string;
  }
): BackendAdapter {
  const tokenKey = options.tokenKey;
  const systemPermissionCode = options.systemPermissionCode ?? 'admin_server';

  return {
    auth: {
      async login(payload: LoginPayload) {
        // 后端字段名：userAccount/password/captcha/captchaKey/encrypt
        const body = {
          userAccount: payload.username,
          password: payload.password,
          captcha: payload.captcha,
          captchaKey: payload.captchaKey,
          encrypt: payload.encrypt
        };

        const res = await http.post<BizResponse<SczfwLoginResult>>('/cmict/auth/login', {
          data: body,
          $throwOnBizError: true
        });

        const token = res.data?.authToken ?? res.data?.token;
        if (!isNonEmptyString(token)) {
          throw new Error('[sczfw] 登录成功但未返回 authToken');
        }
        localStorage.setItem(tokenKey, token);
      },
      async logout() {
        try {
          await http.get('/cmict/auth/logout', { $throwOnBizError: false });
        } finally {
          localStorage.removeItem(tokenKey);
        }
      },
      async fetchMe(): Promise<AppUser> {
        const res = await http.get<BizResponse<SczfwMe>>('/cmict/auth/token/verify', { $throwOnBizError: true });
        const me = res.data ?? {};

        const id = isNonEmptyString(me.id) ? me.id : 'unknown';
        const name = isNonEmptyString(me.nickName) ? me.nickName : '未命名用户';

        return {
          id,
          name,
          avatarUrl: isNonEmptyString(me.avatar) ? me.avatar : undefined,
          roles: Array.isArray(me.roleCodes) ? me.roleCodes.filter(isNonEmptyString) : undefined,
          permissions: Array.isArray(me.permissionCodes) ? me.permissionCodes.filter(isNonEmptyString) : undefined
        };
      }
    },
    menu: {
      async fetchMenuTree(): Promise<AppMenuItem[]> {
        const res = await http.get<BizResponse<SczfwMenuRoot[]>>('/cmict/admin/permission/my-tree', {
          $throwOnBizError: true
        });

        const list = Array.isArray(res.data) ? res.data : [];
        const systemRoot = list.find(it => it.permissionCode === systemPermissionCode);
        const nodes = Array.isArray(systemRoot?.children) ? systemRoot.children : [];
        return mapMenuItems(nodes);
      }
    },
    sso: {
      async exchangeToken(token: string) {
        localStorage.setItem(tokenKey, token);
      },
      async exchangeTicket(payload: { ticket: string; serviceUrl?: string }) {
        const res = await http.get<BizResponse<{ authToken?: string }>>('/cmict/auth/ticket/sso', {
          params: payload,
          $throwOnBizError: true
        });

        const token = res.data?.authToken;
        if (!isNonEmptyString(token)) {
          throw new Error('[sczfw] ticket 兑换成功但未返回 authToken');
        }
        localStorage.setItem(tokenKey, token);
      }
    }
  };
}
