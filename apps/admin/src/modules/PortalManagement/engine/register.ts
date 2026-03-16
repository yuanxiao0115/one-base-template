import {
  type PortalEngineContext,
  setPortalCmsApi,
  setPortalCmsNavigation,
  setPortalPageSettingsApi,
  type PortalCmsNavigation
} from '@one-base-template/portal-engine';

import { cmsApi, portalApi } from '../api';
import { getPortalEngineAdminContext, resetPortalEngineAdminContextForTesting } from './context';

export interface PortalEngineAdminRegisterOptions {
  cmsNavigation?: Partial<PortalCmsNavigation>;
}

let initialized = false;

export function setupPortalEngineForAdmin(
  options: PortalEngineAdminRegisterOptions = {}
): PortalEngineContext {
  const context = getPortalEngineAdminContext();

  if (!initialized) {
    setPortalCmsApi(
      {
        getCategoryTree: cmsApi.getCategoryTree,
        getUserArticlesByCategory: cmsApi.getUserArticlesByCategory,
        getUserCarouselsByCategory: cmsApi.getUserCarouselsByCategory
      },
      context
    );

    setPortalPageSettingsApi(
      {
        getTabDetail: ({ id }) => portalApi.tab.detail({ id }),
        updateTab: (payload) => portalApi.tab.update(payload)
      },
      context
    );

    initialized = true;
  }

  if (options.cmsNavigation) {
    setPortalCmsNavigation(options.cmsNavigation, context);
  }

  return context;
}

export function resetPortalEngineAdminSetupForTesting() {
  initialized = false;
  resetPortalEngineAdminContextForTesting();
}
