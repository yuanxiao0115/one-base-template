import {
  buildPortalPageLayoutForSave,
  createDefaultPortalPageSettingsV2,
  normalizePortalPageSettingsV2,
  type PortalPageSettingsV2,
} from '../schema/page-settings';

interface PageLayoutJson {
  settings?: unknown;
  component?: unknown[];
  [key: string]: unknown;
}

export interface PortalPageSettingsApiResponse<TData = unknown> {
  code?: unknown;
  message?: string;
  success?: boolean;
  data?: TData;
}

export interface PortalPageSettingsTabLike {
  id?: unknown;
  tabName?: unknown;
  templateId?: unknown;
  pageLayout?: unknown;
  [key: string]: unknown;
}

export interface PortalPageSettingsApi {
  getTabDetail: (params: { id: string }) => Promise<PortalPageSettingsApiResponse<PortalPageSettingsTabLike>>;
  updateTab: (payload: Record<string, unknown>) => Promise<PortalPageSettingsApiResponse<unknown>>;
}

export interface PortalTabPageSettingsDetail {
  tab: PortalPageSettingsTabLike;
  pageLayout: PageLayoutJson;
  settings: PortalPageSettingsV2;
  components: unknown[];
}

const fallbackPortalPageSettingsApi: PortalPageSettingsApi = {
  async getTabDetail() {
    return {
      code: 500,
      success: false,
      message: 'portal-engine pageSettingsApi 未配置：getTabDetail',
      data: {},
    };
  },
  async updateTab() {
    return {
      code: 500,
      success: false,
      message: 'portal-engine pageSettingsApi 未配置：updateTab',
      data: null,
    };
  },
};

let currentPortalPageSettingsApi: PortalPageSettingsApi = fallbackPortalPageSettingsApi;

function normalizeBizOk(res: PortalPageSettingsApiResponse<unknown> | null | undefined): boolean {
  const code = res?.code;
  return res?.success === true || code === 0 || code === 200 || String(code) === '0' || String(code) === '200';
}

function normalizeIdLike(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return Object.prototype.toString.call(value) === '[object Object]';
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
  if (typeof raw !== 'string' || !raw.trim()) {
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
    normalized.basic.pageTitle = fallbackTitle || '页面';
  }
  return normalized;
}

function resolvePageLayoutComponents(input: unknown): unknown[] {
  return Array.isArray(input) ? input : [];
}

export function setPortalPageSettingsApi(api: Partial<PortalPageSettingsApi>) {
  currentPortalPageSettingsApi = {
    ...currentPortalPageSettingsApi,
    ...api,
  };
}

export function resetPortalPageSettingsApi() {
  currentPortalPageSettingsApi = fallbackPortalPageSettingsApi;
}

export function getPortalPageSettingsApi(): PortalPageSettingsApi {
  return currentPortalPageSettingsApi;
}

export function createPortalPageSettingsService(api: PortalPageSettingsApi = currentPortalPageSettingsApi) {
  async function loadTabPageSettings(tabId: string): Promise<PortalTabPageSettingsDetail> {
    const res = await api.getTabDetail({ id: tabId });
    if (!normalizeBizOk(res)) {
      throw new Error(res?.message || '加载页面设置失败');
    }

    const tab = (res?.data ?? {}) as PortalPageSettingsTabLike;
    const tabName = typeof tab.tabName === 'string' ? tab.tabName.trim() : '';
    const pageLayout = parsePageLayout(tab.pageLayout);

    return {
      tab,
      pageLayout,
      settings: normalizeSettingsWithFallback(pageLayout.settings, tabName),
      components: resolvePageLayoutComponents(pageLayout.component),
    };
  }

  async function saveTabPageSettings(params: {
    tabId: string;
    templateId: string;
    settings: unknown;
  }): Promise<void> {
    const detail = await loadTabPageSettings(params.tabId);
    const tabNameFallback = typeof detail.tab.tabName === 'string' ? detail.tab.tabName.trim() : '';
    const baseSettings = normalizeSettingsWithFallback(detail.pageLayout.settings, tabNameFallback);

    const mergedSettings = normalizeSettingsWithFallback(
      mergeRecords(
        isPlainRecord(baseSettings) ? (baseSettings as unknown as Record<string, unknown>) : {},
        isPlainRecord(params.settings) ? params.settings : {}
      ),
      tabNameFallback
    );

    const pageLayout = buildPortalPageLayoutForSave(mergedSettings, detail.components);
    const templateId = normalizeIdLike(detail.tab.templateId) || params.templateId;
    const tabName =
      (typeof detail.tab.tabName === 'string' && detail.tab.tabName.trim()) || mergedSettings.basic.pageTitle || '页面';

    const res = await api.updateTab({
      id: params.tabId,
      templateId,
      tabName,
      pageLayout: JSON.stringify(pageLayout),
    });

    if (!normalizeBizOk(res)) {
      throw new Error(res?.message || '页面设置保存失败');
    }
  }

  return {
    loadTabPageSettings,
    saveTabPageSettings,
  };
}
