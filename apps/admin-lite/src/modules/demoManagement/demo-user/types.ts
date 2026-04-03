export interface DemoUserRecord {
  id: string;
  name: string;
  code: string;
  status: 0 | 1;
  updateTime: string;
}

export interface DemoUserForm {
  id?: string;
  name: string;
  code: string;
  status: 0 | 1;
}

export interface DemoUserQueryParams {
  keyword?: string;
  currentPage?: number;
  pageSize?: number;
}
