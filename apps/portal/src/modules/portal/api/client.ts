import type { BizResponse, PortalTab, PortalTemplate } from "@one-base-template/portal-engine";
import { getAppHttpClient } from "@/shared/api/http-client";
import { portalEndpoints } from "./endpoints";

function getHttp() {
  return getAppHttpClient();
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
