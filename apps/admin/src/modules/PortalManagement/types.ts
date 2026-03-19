export type {
  BizResponse,
  PageResult,
  PortalTab,
  PortalTemplate
} from '@one-base-template/portal-engine';

export interface TabListParams {
  currentPage: number;
  pageSize: number;
  templateId?: string;
}
