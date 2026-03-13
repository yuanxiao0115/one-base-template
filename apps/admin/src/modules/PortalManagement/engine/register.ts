import {
  setPortalCmsApi,
  setPortalCmsNavigation,
  type PortalCmsNavigation,
} from '@one-base-template/portal-engine';

import { cmsApi } from '../api';

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

  if (options.cmsNavigation) {
    setPortalCmsNavigation(options.cmsNavigation);
  }

  initialized = true;
}

export function resetPortalEngineAdminSetupForTesting() {
  initialized = false;
}
