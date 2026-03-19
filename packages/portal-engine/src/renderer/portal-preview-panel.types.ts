import type { PortalShellNavItem } from '../shell/template-details';

export interface PortalPreviewTabDetailResponse {
  code?: unknown;
  success?: unknown;
  message?: unknown;
  data?: {
    templateId?: unknown;
    pageLayout?: unknown;
  };
}

export interface PortalPreviewTemplateDetailResponse {
  code?: unknown;
  success?: unknown;
  message?: unknown;
  data?: {
    id?: unknown;
    details?: unknown;
    tabList?: unknown;
  };
}

export interface PortalPreviewDataSource {
  getTabDetail: (tabId: string) => Promise<PortalPreviewTabDetailResponse>;
  getTemplateDetail: (templateId: string) => Promise<PortalPreviewTemplateDetailResponse>;
}

export interface PortalPreviewNavigatePayload {
  type: 'tab' | 'url';
  tabId?: string;
  url?: string;
  item: PortalShellNavItem;
}
