import { portalApiClient } from '../api/client';

/**
 * 页面层统一通过 service 层调用门户接口，避免页面直接依赖 http client 细节。
 */
export const portalService = {
  template: portalApiClient.template,
  tab: portalApiClient.tab,
  templatePublic: portalApiClient.templatePublic,
  tabPublic: portalApiClient.tabPublic
};
