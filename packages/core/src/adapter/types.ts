export type MenuMode = 'remote' | 'static';

export type LoginPayload = {
  username: string;
  password: string;
} & Record<string, unknown>;

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

/**
 * 多系统菜单：一个项目下可能存在多个“系统”，每个系统对应一棵菜单树。
 *
 * 约定：
 * - `code`：系统唯一标识（例如 sczfw 的 permissionCode）
 * - `name`：系统展示名称（当前阶段优先使用后端返回的 title/resourceName）
 */
export interface AppMenuSystem {
  code: string;
  name: string;
  menus: AppMenuItem[];
}

export interface AuthAdapter {
  /**
   * Cookie 模式：后端通过 Set-Cookie(HttpOnly) 写入会话
   */
  login(payload: LoginPayload): Promise<void>;
  logout(): Promise<void>;
  fetchMe(): Promise<AppUser>;
}

export interface MenuAdapter {
  /** remote 菜单树 */
  fetchMenuTree(): Promise<AppMenuItem[]>;
  /**
   * remote 多系统菜单树（可选实现）：
   * - 若实现，core 会优先使用它一次性拉取全部系统菜单
   * - 若未实现，则退化为单系统 `fetchMenuTree()`
   */
  fetchMenuSystems?(): Promise<AppMenuSystem[]>;
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
