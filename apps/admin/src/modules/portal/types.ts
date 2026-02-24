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
  details?: string;
  tabIds?: string[];
  tabList?: PortalTab[];
  whiteDTOS?: unknown[];
  whiteList?: unknown;
  [k: string]: unknown;
};

export type PortalTab = {
  id?: string;
  templateId?: string;
  tabName?: string;
  // 页签类型：1=导航组，2=空白页（可编辑），3=链接（老项目定义）
  tabType?: number;
  tabUrl?: string;
  tabUrlOpenMode?: number | null;
  tabUrlSsoType?: number | null;
  tabIcon?: string;
  tabOrder?: number | null;
  order?: number | null;
  parentId?: string | number;
  sort?: number;
  isHide?: number;
  pageLayout?: string;
  remark?: string;
  cmptInsts?: unknown[];
  children?: PortalTab[];
  [k: string]: unknown;
};
