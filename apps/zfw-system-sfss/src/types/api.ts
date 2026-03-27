export interface ApiResponse<T = unknown> {
  code?: number | string;
  message?: string;
  data?: T;
  success?: boolean;
}

export interface ApiPageData<T = unknown> {
  records?: T[];
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  [key: string]: unknown;
}
