import {
  createPortalPageSettingsService,
  type PortalPageSettingsV2,
  type PortalTabPageSettingsDetail as EnginePortalTabPageSettingsDetail,
} from "@one-base-template/portal-engine";

import type { PortalTab } from "../../../types";

interface PageLayoutJson {
  settings?: unknown;
  component?: unknown[];
  [key: string]: unknown;
}

export interface PortalTabPageSettingsDetail {
  tab: PortalTab;
  pageLayout: PageLayoutJson;
  settings: PortalPageSettingsV2;
  components: unknown[];
}

const pageSettingsService = createPortalPageSettingsService();

function toPortalTabPageSettingsDetail(detail: EnginePortalTabPageSettingsDetail): PortalTabPageSettingsDetail {
  return {
    ...detail,
    tab: detail.tab as PortalTab,
  };
}

export async function loadPortalTabPageSettings(tabId: string): Promise<PortalTabPageSettingsDetail> {
  const detail = await pageSettingsService.loadTabPageSettings(tabId);
  return toPortalTabPageSettingsDetail(detail);
}

export async function savePortalTabPageSettings(params: {
  tabId: string;
  templateId: string;
  settings: PortalPageSettingsV2;
}): Promise<void> {
  await pageSettingsService.saveTabPageSettings(params);
}
