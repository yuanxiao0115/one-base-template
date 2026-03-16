export type { BizResponse, PageResult, PortalTemplate } from '../types';

export interface TemplateListParams {
  currentPage: number;
  pageSize: number;
  searchKey?: string;
  publishStatus?: number;
}
