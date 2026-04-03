import {
  DEFAULT_LAYOUT_SIDEBAR_COLLAPSED_WIDTH,
  type UiConfig,
  type UseTableDefaults
} from '@one-base-template/core';
import { routePaths } from '@/router/constants';
import { appTableResponseAdapter } from '@/utils/table-response-adapter';

const table: UseTableDefaults = {
  /** 分页页码字段名 */
  paginationKey: {
    /** 当前页字段 */
    current: 'currentPage',
    /** 每页条数字段 */
    size: 'pageSize'
  },
  /** 分页字段别名 */
  paginationAlias: {
    /** 当前页别名 */
    current: ['current', 'page'],
    /** 每页条数别名 */
    size: ['size']
  },
  /** 表格响应适配器 */
  responseAdapter: appTableResponseAdapter
};

/** UI 配置 */
export const ui: UiConfig = {
  /** Ob 组件前缀策略 */
  shell: {
    /** 组件前缀 */
    prefix: 'Ob',
    /** 是否开启别名 */
    aliases: false
  },
  /** 标签页策略 */
  tag: {
    /** 首页标签标题 */
    homeTitle: '首页',
    /** 标签页存储类型 */
    storageType: 'session',
    /** 忽略写入标签页的固定路由 */
    ignoredRoutePaths: [
      routePaths.login,
      routePaths.sso,
      routePaths.forbidden,
      routePaths.notFound,
      routePaths.root
    ],
    /** 忽略写入标签页的路径包含规则 */
    ignoredRoutePathIncludes: ['/redirect', '/error'],
    /** 隐藏标签页的 meta key */
    hiddenMetaKeys: ['hiddenTab', 'noTag']
  },
  /** 布局配置 */
  layout: {
    /** 默认布局模式 */
    mode: 'side',
    /** 系统切换样式 */
    systemSwitchStyle: 'menu',
    /** 顶栏高度 */
    topbarHeight: '60px',
    /** 侧栏展开宽度 */
    sidebarWidth: '200px',
    /** 侧栏折叠宽度 */
    sidebarCollapsedWidth: DEFAULT_LAYOUT_SIDEBAR_COLLAPSED_WIDTH
  },
  /** 表格默认配置 */
  table,
  /** CRUD 容器默认配置 */
  crud: {
    /** 默认使用抽屉容器 */
    container: 'drawer'
  },
  /** 顶栏能力开关 */
  topbar: {
    /** 顶栏标题后缀 */
    titleSuffix: '后台管理',
    /** 租户切换开关 */
    tenantSwitcher: false,
    /** 个人中心开关 */
    profileDialog: true,
    /** 修改密码开关 */
    changePassword: true,
    /** 个性化设置开关 */
    personalization: true
  },
  /** 登录页文案配置 */
  login: {
    /** 登录页头部标题 */
    headerTitle: '后台管理',
    /** 登录框标题 */
    loginBoxTitle: '用户登录'
  },
  /** 素材缓存开关 */
  materialCache: {
    /** 是否启用缓存 */
    enabled: false,
    /** 开发环境是否启用缓存 */
    enableInDev: false,
    /** 最大缓存条数 */
    maxEntries: 240,
    /** 缓存有效期（毫秒） */
    ttlMs: 7 * 24 * 60 * 60 * 1000
  }
};
