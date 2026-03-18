import { obHttp } from '@one-base-template/core';
import { templateApi } from '../templatePage/api';
import type { BizResponse, PortalTab, PortalTemplate, TabListParams } from '../types';

export const portalApi = {
  template: templateApi,

  resource: {
    upload: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return obHttp().post<BizResponse<{ id?: string; savedPath?: string; joinUrl?: string }>>(
        '/cmict/file/resource/upload',
        {
          data: formData,
          $isUpload: true
        }
      );
    }
  },

  tab: {
    list: async (params: TabListParams) =>
      obHttp().get<BizResponse<unknown>>('/cmict/portal/tab/page', { params }),

    detail: async (params: { id: string; templateId?: string | number }) =>
      obHttp().get<BizResponse<PortalTab>>('/cmict/portal/tab/detail', {
        params
      }),

    add: async (data: Partial<PortalTab>) =>
      obHttp().post<BizResponse<unknown>>('/cmict/portal/tab/add', {
        data
      }),

    update: async (data: Partial<PortalTab>) =>
      obHttp().post<BizResponse<unknown>>('/cmict/portal/tab/update', {
        data
      }),

    delete: async (data: { id: string }) =>
      obHttp().delete<BizResponse<unknown>>('/cmict/portal/tab/delete', {
        data
      })
  },

  templatePublic: {
    getDetail: async (params: { id: string }) =>
      obHttp().get<BizResponse<PortalTemplate>>('/cmict/portal/public/portal/template/get-detail', {
        params
      })
  },

  tabPublic: {
    detail: async (params: { id: string }) =>
      obHttp().get<BizResponse<PortalTab>>('/cmict/portal/public/portal/tab/detail', {
        params
      })
  }
};
