import type {
  PortalPreviewDataSource,
  PortalPreviewTabDetailResponse,
  PortalPreviewTemplateDetailResponse
} from '../renderer/portal-preview-panel.types';
import { isPortalBizOk, type PortalBizResponseLike } from '../utils/biz-response';

export type PortalPreviewBizResponseLike = PortalBizResponseLike;

export interface CreatePortalPreviewDataSourceOptions {
  getTabDetail: (tabId: string) => Promise<PortalPreviewTabDetailResponse>;
  getTemplateDetail: (templateId: string) => Promise<PortalPreviewTemplateDetailResponse>;
  getPublicTabDetail?: (tabId: string) => Promise<PortalPreviewTabDetailResponse>;
  isBizOk?: (response: PortalPreviewBizResponseLike | null | undefined) => boolean;
}

export const isPortalPreviewBizOk: (
  response: PortalPreviewBizResponseLike | null | undefined
) => boolean = isPortalBizOk;

export function createPortalPreviewDataSource(
  options: CreatePortalPreviewDataSourceOptions
): PortalPreviewDataSource {
  const bizOk = options.isBizOk || isPortalPreviewBizOk;

  return {
    async getTabDetail(tabId: string) {
      if (!options.getPublicTabDetail) {
        return options.getTabDetail(tabId);
      }

      try {
        const publicResponse = await options.getPublicTabDetail(tabId);
        if (bizOk(publicResponse)) {
          return publicResponse;
        }
      } catch {
        // 忽略公开接口异常并回退管理端接口，保证预览可用性
      }

      return options.getTabDetail(tabId);
    },
    getTemplateDetail(templateId: string) {
      return options.getTemplateDetail(templateId);
    }
  };
}
