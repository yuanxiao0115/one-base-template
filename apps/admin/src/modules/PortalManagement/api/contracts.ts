export type {
  BizResponse,
  PageResult,
  PortalTemplate,
  PortalTab,
} from "../types";

export interface TemplateListParams {
  currentPage: number;
  pageSize: number;
  searchKey?: string;
  publishStatus?: number;
}

export interface TabListParams {
  currentPage: number;
  pageSize: number;
  templateId?: string;
}
