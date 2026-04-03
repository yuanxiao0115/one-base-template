export type StarterCrudStatus = 0 | 1;

export interface StarterCrudRecord {
  id: string;
  code: string;
  name: string;
  owner: string;
  status: StarterCrudStatus;
  remark: string;
  updateTime: string;
}

export interface StarterCrudPageParams {
  keyword?: string;
  owner?: string;
  status?: StarterCrudStatus | '';
  currentPage?: number;
  pageSize?: number;
}

export interface StarterCrudPageData {
  records: StarterCrudRecord[];
  total: number;
  currentPage: number;
  pageSize: number;
}

export interface StarterCrudSavePayload {
  id?: string;
  code: string;
  name: string;
  owner: string;
  status: StarterCrudStatus;
  remark: string;
}
