import type { CoreOptions } from '../createCore';
import type { CrudContainerType } from '../hooks/useEntityEditor/types';
import type { UseTableDefaults } from '../hooks/useTable';
import type { LayoutMode, SystemSwitchStyle } from '../stores/layout';

export type TagStorageType = 'session' | 'local';

export interface UiConfig {
  shell: {
    prefix: string;
    aliases: boolean;
  };
  tag: {
    homeTitle: string;
    storageType: TagStorageType;
    ignoredRoutePaths: string[];
    ignoredRoutePathIncludes: string[];
    hiddenMetaKeys: string[];
  };
  layout: {
    mode: LayoutMode;
    systemSwitchStyle: SystemSwitchStyle;
    topbarHeight: string;
    sidebarWidth: string;
    sidebarCollapsedWidth: number | string;
  };
  table: UseTableDefaults;
  crud: {
    container: CrudContainerType;
  };
  topbar: {
    titleSuffix: string;
    tenantSwitcher: boolean;
    profileDialog: boolean;
    changePassword: boolean;
    personalization: boolean;
  };
  login: {
    headerTitle: string;
    loginBoxTitle: string;
  };
  materialCache: {
    enabled: boolean;
    enableInDev: boolean;
    maxEntries: number;
    ttlMs: number;
  };
}

export type ThemeConfig = CoreOptions['theme'];

export interface RequestConfig {
  timeout: {
    basic: number;
    default: number;
  };
  auth: {
    tokenHeader: string;
    tokenPrefix: string;
  };
  successCodes: number[];
  networkMsg: {
    unknown: string;
    timeout: string;
    offline: string;
    serverError: string;
    fallback: string;
  };
}

export interface ExternalSsoEndpoints {
  zhxtSsoEndpoint: string;
  ydbgSsoEndpoint: string;
  desktopSsoLoginEndpoint: string;
  omSsoEndpoint: string;
  portalSsoEndpoint: string;
}

export interface AuthApiConfig {
  loginPageConfigEndpoint: string;
  ticketSsoEndpoint: string;
  externalSsoEndpoints: ExternalSsoEndpoints;
}
