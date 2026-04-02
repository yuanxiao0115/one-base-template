export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message?: string;
}

export interface ApiPageData<T> {
  records: T[];
  total: number;
  currentPage: number;
  pageSize: number;
}
