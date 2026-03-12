import {
  buildPortalPageLayoutForSave,
  createDefaultPortalPageSettingsV2,
  normalizePortalPageSettingsV2,
  type PortalPageSettingsV2,
} from "@one-base-template/portal-engine";

import { portalApi } from "../../../api";
import type { BizResponse, PortalTab } from "../../../types";

interface PageLayoutJson {
  settings?: unknown;
  component?: unknown[];
  [key: string]: unknown;
}

type BizResLike = Pick<BizResponse<unknown>, "code" | "message" | "success">;

function normalizeBizOk(res: BizResLike | null | undefined): boolean {
  const code = res?.code;
  return res?.success === true || code === 0 || code === 200 || String(code) === "0" || String(code) === "200";
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }
  return Object.prototype.toString.call(value) === "[object Object]";
}

function mergeRecords(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = { ...base };

  for (const [key, patchValue] of Object.entries(patch)) {
    const baseValue = next[key];
    if (isPlainRecord(baseValue) && isPlainRecord(patchValue)) {
      next[key] = mergeRecords(baseValue, patchValue);
      continue;
    }
    next[key] = patchValue;
  }

  return next;
}

function parsePageLayout(raw: unknown): PageLayoutJson {
  if (typeof raw !== "string" || !raw.trim()) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isPlainRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeSettingsWithFallback(settingsInput: unknown, fallbackTitle: string): PortalPageSettingsV2 {
  const normalized = normalizePortalPageSettingsV2(settingsInput ?? createDefaultPortalPageSettingsV2());
  if (!normalized.basic.pageTitle.trim()) {
    normalized.basic.pageTitle = fallbackTitle || "页面";
  }
  return normalized;
}

function resolvePageLayoutComponents(input: unknown): unknown[] {
  return Array.isArray(input) ? input : [];
}

export interface PortalTabPageSettingsDetail {
  tab: PortalTab;
  pageLayout: PageLayoutJson;
  settings: PortalPageSettingsV2;
  components: unknown[];
}

export async function loadPortalTabPageSettings(tabId: string): Promise<PortalTabPageSettingsDetail> {
  const res = await portalApi.tab.detail({ id: tabId });
  if (!normalizeBizOk(res)) {
    throw new Error(res?.message || "加载页面设置失败");
  }

  const tab = (res?.data ?? {}) as PortalTab;
  const tabName = typeof tab.tabName === "string" ? tab.tabName.trim() : "";
  const pageLayout = parsePageLayout(tab.pageLayout);

  return {
    tab,
    pageLayout,
    settings: normalizeSettingsWithFallback(pageLayout.settings, tabName),
    components: resolvePageLayoutComponents(pageLayout.component),
  };
}

export async function savePortalTabPageSettings(params: {
  tabId: string;
  templateId: string;
  settings: PortalPageSettingsV2;
}): Promise<void> {
  const detail = await loadPortalTabPageSettings(params.tabId);

  const mergedSettings = normalizeSettingsWithFallback(
    mergeRecords(
      isPlainRecord(detail.pageLayout.settings) ? detail.pageLayout.settings : {},
      isPlainRecord(params.settings) ? params.settings : {}
    ),
    typeof detail.tab.tabName === "string" ? detail.tab.tabName.trim() : ""
  );

  const pageLayout = buildPortalPageLayoutForSave(mergedSettings, detail.components);

  const templateId =
    typeof detail.tab.templateId === "string" && detail.tab.templateId.trim()
      ? detail.tab.templateId.trim()
      : params.templateId;
  const tabName =
    typeof detail.tab.tabName === "string" && detail.tab.tabName.trim()
      ? detail.tab.tabName.trim()
      : mergedSettings.basic.pageTitle || "页面";

  const res = await portalApi.tab.update({
    id: params.tabId,
    templateId,
    tabName,
    pageLayout: JSON.stringify(pageLayout),
  });

  if (!normalizeBizOk(res)) {
    throw new Error(res?.message || "页面设置保存失败");
  }
}
