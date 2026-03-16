import type {
  PortalPreviewDataSource,
  PortalPreviewTabDetailResponse,
  PortalPreviewTemplateDetailResponse
} from '../renderer/portal-preview-panel.types';

export interface PortalPreviewBizResponseLike {
  code?: unknown;
  success?: unknown;
}

export interface CreatePortalPreviewDataSourceOptions {
  getTabDetail: (tabId: string) => Promise<PortalPreviewTabDetailResponse>;
  getTemplateDetail: (templateId: string) => Promise<PortalPreviewTemplateDetailResponse>;
  getPublicTabDetail?: (tabId: string) => Promise<PortalPreviewTabDetailResponse>;
  isBizOk?: (response: PortalPreviewBizResponseLike | null | undefined) => boolean;
}

export function isPortalPreviewBizOk(
  response: PortalPreviewBizResponseLike | null | undefined
): boolean {
  const code = response?.code;
  return (
    response?.success === true ||
    code === 0 ||
    code === 200 ||
    String(code) === '0' ||
    String(code) === '200'
  );
}

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
