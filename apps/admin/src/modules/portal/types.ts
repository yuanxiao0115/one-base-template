export type BizResponse<T> = {
  code?: unknown;
  data?: T;
  message?: string;
  success?: boolean;
};

export type PageResult<T> = {
  records?: T[];
  total?: number;
  currentPage?: number;
  pageSize?: number;
  [k: string]: unknown;
};

export type PortalTemplate = {
  id?: string;
  templateName?: string;
  description?: string;
  publishStatus?: number;
  sort?: number;
  isOpen?: number;
  coverPicture?: string;
  tabIds?: string[];
  tabList?: unknown[];
  whiteDTOS?: unknown[];
  whiteList?: unknown;
  [k: string]: unknown;
};

export type PortalTab = {
  id?: string;
  templateId?: string;
  tabName?: string;
  sort?: number;
  pageLayout?: string;
  [k: string]: unknown;
};

