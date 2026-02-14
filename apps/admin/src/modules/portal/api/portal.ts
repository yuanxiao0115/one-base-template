import { getObHttpClient } from '@/infra/http';
import type { BizResponse, PageResult, PortalTab, PortalTemplate } from '../types';

function getHttp() {
  return getObHttpClient();
}

function handleTemplateWhiteDTOS(res: BizResponse<PortalTemplate>): BizResponse<PortalTemplate> {
  // 兼容老接口：有些环境返回 whiteList 而不是 whiteDTOS
  const data = res.data;
  if (!data || typeof data !== 'object') return res;

  const whiteDTOS = (data as PortalTemplate).whiteDTOS;
  const whiteList = (data as PortalTemplate).whiteList;

  if ((!Array.isArray(whiteDTOS) || whiteDTOS.length === 0) && whiteList) {
    return {
      ...res,
      data: {
        ...data,
        whiteDTOS: Array.isArray(whiteList) ? [...whiteList] : whiteList
      } as PortalTemplate
    };
  }

  return res;
}

export const portalApi = {
  template: {
    list: (params: { currentPage: number; pageSize: number; searchKey?: string; publishStatus?: number }) =>
      getHttp().get<BizResponse<PageResult<PortalTemplate>>>('/cmict/portal/template/page', { params }),

    detail: async (params: { id: string }) => {
      const res = await getHttp().get<BizResponse<PortalTemplate>>('/cmict/portal/template/detail', { params });
      return handleTemplateWhiteDTOS(res);
    },

    getDetail: (params: { id: string }) =>
      getHttp().get<BizResponse<PortalTemplate>>('/cmict/portal/template/get-detail', { params }),

    add: (data: Partial<PortalTemplate>) =>
      getHttp().post<BizResponse<unknown>>('/cmict/portal/template/add', { data }),

    copy: (data: { id: string; templateName?: string }) =>
      getHttp().post<BizResponse<unknown>>('/cmict/portal/template/copy', { data }),

    update: (data: Partial<PortalTemplate>) =>
      getHttp().post<BizResponse<unknown>>('/cmict/portal/template/update', { data }),

    publish: (params: { id: string; status: number }) =>
      getHttp().get<BizResponse<unknown>>(`/cmict/portal/template/publish/${params.status}`, {
        params: { id: params.id }
      }),

    hideToggle: (params: { id: string; hide?: number }) =>
      getHttp().get<BizResponse<unknown>>('/cmict/portal/template/hide', { params }),

    delete: (data: { id: string }) =>
      getHttp().post<BizResponse<unknown>>('/cmict/portal/template/delete', { data })
  },

  tab: {
    list: (params: { currentPage: number; pageSize: number; templateId?: string }) =>
      getHttp().get<BizResponse<PageResult<PortalTab>>>('/cmict/portal/tab/page', { params }),

    detail: (params: { id: string }) =>
      getHttp().get<BizResponse<PortalTab>>('/cmict/portal/tab/detail', { params }),

    add: (data: Partial<PortalTab>) =>
      getHttp().post<BizResponse<unknown>>('/cmict/portal/tab/add', { data }),

    update: (data: Partial<PortalTab>) =>
      getHttp().put<BizResponse<unknown>>('/cmict/portal/tab/update', { data }),

    delete: (data: { id: string }) =>
      getHttp().delete<BizResponse<unknown>>('/cmict/portal/tab/delete', { data })
  },

  templatePublic: {
    getDetail: (params: { id: string }) =>
      getHttp().get<BizResponse<PortalTemplate>>('/cmict/portal/public/portal/template/get-detail', { params })
  },

  tabPublic: {
    detail: (params: { id: string }) =>
      getHttp().get<BizResponse<PortalTab>>('/cmict/portal/public/portal/tab/detail', { params })
  }
};

