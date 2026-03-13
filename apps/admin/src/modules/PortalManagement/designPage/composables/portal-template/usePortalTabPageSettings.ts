import {
  createPortalPageSettingsService,
  getPortalPageSettingsApi,
  type PortalPageSettingsV2,
  type PortalTabPageSettingsDetail as EnginePortalTabPageSettingsDetail,
} from "@one-base-template/portal-engine";

import type { PortalTab } from "../../../types";
import { getPortalEngineAdminContext } from "../../../engine/context";
import { setupPortalEngineForAdmin } from "../../../engine/register";

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

function toPortalTabPageSettingsDetail(detail: EnginePortalTabPageSettingsDetail): PortalTabPageSettingsDetail {
  return {
    ...detail,
    tab: detail.tab as PortalTab,
  };
}

function getPageSettingsService() {
  const context = setupPortalEngineForAdmin();
  return createPortalPageSettingsService(getPortalPageSettingsApi(getPortalEngineAdminContext()), context);
}

export async function loadPortalTabPageSettings(tabId: string): Promise<PortalTabPageSettingsDetail> {
  const detail = await getPageSettingsService().loadTabPageSettings(tabId);
  return toPortalTabPageSettingsDetail(detail);
}

export async function savePortalTabPageSettings(params: {
  tabId: string;
  templateId: string;
  settings: PortalPageSettingsV2;
}): Promise<void> {
  await getPageSettingsService().saveTabPageSettings(params);
}
