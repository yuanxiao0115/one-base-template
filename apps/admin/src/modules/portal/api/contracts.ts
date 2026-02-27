export type { BizResponse, PageResult, PortalTemplate, PortalTab } from '../types';

export type TemplateListParams = {
  currentPage: number;
  pageSize: number;
  searchKey?: string;
  publishStatus?: number;
};

export type TabListParams = {
  currentPage: number;
  pageSize: number;
  templateId?: string;
};
