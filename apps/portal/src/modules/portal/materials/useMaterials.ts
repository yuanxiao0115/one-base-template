import {
  setPortalCmsApi,
  useRendererMaterials as usePortalEngineRendererMaterials
} from '@one-base-template/portal-engine';
import { cmsApi } from '../api';

let cmsApiBound = false;

function ensureCmsApiBound() {
  if (cmsApiBound) {
    return;
  }

  setPortalCmsApi({
    getCategoryTree: cmsApi.getCategoryTree,
    getUserArticlesByCategory: cmsApi.getUserArticlesByCategory,
    getUserCarouselsByCategory: cmsApi.getUserCarouselsByCategory
  });

  cmsApiBound = true;
}

export function useMaterials() {
  ensureCmsApiBound();
  return usePortalEngineRendererMaterials();
}
