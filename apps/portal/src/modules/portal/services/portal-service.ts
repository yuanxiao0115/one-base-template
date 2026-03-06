import { portalApiClient } from "../api";

/**
 * 页面层统一通过 service 调用，避免页面直接依赖 api 客户端细节。
 */
export const portalService = {
  tab: portalApiClient.tab,
  templatePublic: portalApiClient.templatePublic,
  tabPublic: portalApiClient.tabPublic,
};
