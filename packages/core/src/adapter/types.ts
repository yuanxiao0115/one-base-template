export type MenuMode = 'remote' | 'static';

export interface AppUser {
  id: string;
  name: string;
  avatarUrl?: string;
  roles?: string[];
  permissions?: string[];
}

export interface AppMenuItem {
  /** 与路由 path 对齐；外链也用 path 保存 url */
  path: string;
  title: string;
  icon?: string;
  children?: AppMenuItem[];
  external?: boolean;
  keepAlive?: boolean;
  order?: number;
}

export interface AuthAdapter {
  /**
   * Cookie 模式：后端通过 Set-Cookie(HttpOnly) 写入会话
   */
  login(payload: { username: string; password: string }): Promise<void>;
  logout(): Promise<void>;
  fetchMe(): Promise<AppUser>;
}

export interface MenuAdapter {
  /** remote 菜单树 */
  fetchMenuTree(): Promise<AppMenuItem[]>;
}

export interface SsoAdapter {
  /** 有的后端 token 需要换会话，可选 */
  exchangeToken?(token: string): Promise<void>;
  exchangeTicket?(payload: { ticket: string; serviceUrl?: string }): Promise<void>;
  exchangeOAuthCode?(payload: { code: string; state?: string; redirectUri?: string }): Promise<void>;
}

export interface BackendAdapter {
  auth: AuthAdapter;
  menu: MenuAdapter;
  sso?: SsoAdapter;
}
