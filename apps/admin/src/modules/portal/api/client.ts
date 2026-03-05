import { getAppHttpClient } from '@/shared/api/http-client';
import { normalizeTemplateWhiteList } from '../compat/mapper';
import { portalEndpoints } from './endpoints';
import type { BizResponse, PageResult, PortalTab, PortalTemplate } from '../types';
import type { TabListParams, TemplateListParams } from './contracts';

function getHttp () {
  return getAppHttpClient();
}

export const portalApiClient = {
  template: {
    list: async (params: TemplateListParams) => getHttp().get<BizResponse<PageResult<PortalTemplate>>>(portalEndpoints.template.list, { params }),

    detail: async (params: { id: string }) => {
      const res = await getHttp().get<BizResponse<PortalTemplate>>(portalEndpoints.template.detail, { params });
      return normalizeTemplateWhiteList(res);
    },

    getDetail: async (params: { id: string }) => getHttp().get<BizResponse<PortalTemplate>>(portalEndpoints.template.getDetail, { params }),

    add: async (data: Partial<PortalTemplate>) => getHttp().post<BizResponse<unknown>>(portalEndpoints.template.add, { data }),

    copy: async (data: { id: string; templateName?: string }) => getHttp().post<BizResponse<unknown>>(portalEndpoints.template.copy, { data }),

    update: async (data: Partial<PortalTemplate>) => getHttp().post<BizResponse<unknown>>(portalEndpoints.template.update, { data }),

    publish: async (params: { id: string; status: number }) => getHttp().get<BizResponse<unknown>>(`${portalEndpoints.template.publish}/${params.status}`, {
      params: { id: params.id }
    }),

    // 老项目语义：隐藏/显示某个页面（tab）在模板中的可见性
    hideToggle: async (params: { id: string; tabId: string; isHide: number }) => getHttp().get<BizResponse<unknown>>(portalEndpoints.template.hideToggle, { params }),

    delete: async (data: { id: string }) => getHttp().post<BizResponse<unknown>>(portalEndpoints.template.delete, { data })
  },

  tab: {
    list: async (params: TabListParams) => getHttp().get<BizResponse<PageResult<PortalTab>>>(portalEndpoints.tab.list, { params }),

    detail: async (params: { id: string }) => getHttp().get<BizResponse<PortalTab>>(portalEndpoints.tab.detail, { params }),

    add: async (data: Partial<PortalTab>) => getHttp().post<BizResponse<unknown>>(portalEndpoints.tab.add, { data }),

    update: async (data: Partial<PortalTab>) => getHttp().put<BizResponse<unknown>>(portalEndpoints.tab.update, { data }),

    delete: async (data: { id: string }) => getHttp().delete<BizResponse<unknown>>(portalEndpoints.tab.delete, { data })
  },

  templatePublic: {
    getDetail: async (params: { id: string }) => getHttp().get<BizResponse<PortalTemplate>>(portalEndpoints.templatePublic.getDetail, { params })
  },

  tabPublic: {
    detail: async (params: { id: string }) => getHttp().get<BizResponse<PortalTab>>(portalEndpoints.tabPublic.detail, { params })
  }
};
