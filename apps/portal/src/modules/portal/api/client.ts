import type { BizResponse, PortalTab, PortalTemplate } from "@one-base-template/portal-engine";
import { obHttp } from "@one-base-template/core";
import { portalEndpoints } from "./endpoints";

export const portalApiClient = {
  tab: {
    detail: async (params: { id: string }) =>
      obHttp().get<BizResponse<PortalTab>>(portalEndpoints.tab.detail, {
        params,
      }),
  },

  templatePublic: {
    getDetail: async (params: { id: string }) =>
      obHttp().get<BizResponse<PortalTemplate>>(portalEndpoints.templatePublic.getDetail, { params }),
  },

  tabPublic: {
    detail: async (params: { id: string }) =>
      obHttp().get<BizResponse<PortalTab>>(portalEndpoints.tabPublic.detail, {
        params,
      }),
  },
};
