import type { BizResponse, PortalTab, PortalTemplate } from "@one-base-template/portal-engine";
import { getObHttpClient } from "@one-base-template/core";
import { portalEndpoints } from "./endpoints";

function getHttp() {
  return getObHttpClient();
}

export const portalApiClient = {
  tab: {
    detail: async (params: { id: string }) =>
      getHttp().get<BizResponse<PortalTab>>(portalEndpoints.tab.detail, {
        params,
      }),
  },

  templatePublic: {
    getDetail: async (params: { id: string }) =>
      getHttp().get<BizResponse<PortalTemplate>>(portalEndpoints.templatePublic.getDetail, { params }),
  },

  tabPublic: {
    detail: async (params: { id: string }) =>
      getHttp().get<BizResponse<PortalTab>>(portalEndpoints.tabPublic.detail, {
        params,
      }),
  },
};
