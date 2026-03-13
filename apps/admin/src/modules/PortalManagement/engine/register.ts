import {
  setPortalCmsApi,
  setPortalCmsNavigation,
  setPortalPageSettingsApi,
  type PortalCmsNavigation,
} from '@one-base-template/portal-engine';

import { cmsApi, portalApi } from '../api';

export interface PortalEngineAdminRegisterOptions {
  cmsNavigation?: Partial<PortalCmsNavigation>;
}

let initialized = false;

export function setupPortalEngineForAdmin(options: PortalEngineAdminRegisterOptions = {}) {
  if (initialized) {
    return;
  }

  setPortalCmsApi({
    getCategoryTree: cmsApi.getCategoryTree,
    getUserArticlesByCategory: cmsApi.getUserArticlesByCategory,
    getUserCarouselsByCategory: cmsApi.getUserCarouselsByCategory,
  });

  setPortalPageSettingsApi({
    getTabDetail: ({ id }) => portalApi.tab.detail({ id }),
    updateTab: (payload) => portalApi.tab.update(payload),
  });

  if (options.cmsNavigation) {
    setPortalCmsNavigation(options.cmsNavigation);
  }

  initialized = true;
}

export function resetPortalEngineAdminSetupForTesting() {
  initialized = false;
}
