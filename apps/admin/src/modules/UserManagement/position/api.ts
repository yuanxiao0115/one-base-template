import { getHttpClient, trimText } from '@/shared/api/utils';

export interface BizResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export interface PositionRecord {
  id: string;
  postName: string;
  sort: number;
  remark: string;
  createTime: string;
}

export interface PositionPageParams {
  postName?: string;
  currentPage?: number;
  pageSize?: number;
}

export interface PositionPageData {
  records: PositionRecord[];
  total: number;
  currentPage: number;
  pageSize: number;
}

export interface PositionSavePayload {
  id?: string;
  postName: string;
  sort: number;
  remark: string;
}

export interface PositionUniqueParams {
  id?: string;
  postName: string;
}

export const positionApi = {
  page: (params: PositionPageParams) =>
    getHttpClient().get<BizResponse<PositionPageData>>('/cmict/admin/sys-post/page', {
      params: {
        postName: trimText(params.postName),
        currentPage: params.currentPage,
        pageSize: params.pageSize
      }
    }),

  addPost: (data: PositionSavePayload) =>
    getHttpClient().post<BizResponse<PositionRecord>>('/cmict/admin/sys-post/add', { data }),

  updatePost: (data: PositionSavePayload) =>
    getHttpClient().post<BizResponse<PositionRecord>>('/cmict/admin/sys-post/update', { data }),

  removePost: (id: string) =>
    getHttpClient().post<BizResponse<null>>('/cmict/admin/sys-post/delete', {
      data: { id }
    }),

  checkUnique: (params: PositionUniqueParams) =>
    getHttpClient().get<BizResponse<boolean>>('/cmict/admin/sys-post/unique/check', {
      params: {
        id: params.id,
        postName: trimText(params.postName)
      }
    })
};

export default positionApi;
