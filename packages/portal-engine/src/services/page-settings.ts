import {
  buildPortalPageLayoutForSave,
  createDefaultPortalPageSettingsV2,
  normalizePortalPageSettingsV2,
  type PortalPageSettingsV2
} from '../schema/page-settings';
import type { PortalEngineContext } from '../runtime/context';
import {
  getDefaultPortalEngineContext,
  readPortalEngineContextValue,
  writePortalEngineContextValue
} from '../runtime/context';
import { isPortalBizOk } from '../utils/biz-response';

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
  getTabDetail: (params: {
    id: string;
  }) => Promise<PortalPageSettingsApiResponse<PortalPageSettingsTabLike>>;
  updateTab: (payload: Record<string, unknown>) => Promise<PortalPageSettingsApiResponse<unknown>>;
}

export interface PortalTabPageSettingsDetail {
  tab: PortalPageSettingsTabLike;
  pageLayout: PageLayoutJson;
  settings: PortalPageSettingsV2;
  components: unknown[];
}

export interface SaveTabPageSettingsDirectParams {
  tabId: string;
  templateId: string;
  settings: unknown;
  components: unknown[];
  tabName?: string;
}

const PORTAL_PAGE_SETTINGS_API_CONTEXT_KEY = Symbol('portal-engine.page-settings-api');

function createFallbackPortalPageSettingsApi(): PortalPageSettingsApi {
  return {
    async getTabDetail() {
      return {
        code: 500,
        success: false,
        message: 'portal-engine pageSettingsApi 未配置：getTabDetail',
        data: {}
      };
    },
    async updateTab() {
      return {
        code: 500,
        success: false,
        message: 'portal-engine pageSettingsApi 未配置：updateTab',
        data: null
      };
    }
  };
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

function mergeRecords(
  base: Record<string, unknown>,
  patch: Record<string, unknown>
): Record<string, unknown> {
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

function normalizeSettingsWithFallback(
  settingsInput: unknown,
  fallbackTitle: string
): PortalPageSettingsV2 {
  const normalized = normalizePortalPageSettingsV2(
    settingsInput ?? createDefaultPortalPageSettingsV2()
  );
  if (!normalized.basic.pageTitle.trim()) {
    normalized.basic.pageTitle = fallbackTitle || '页面';
  }
  return normalized;
}

function resolvePageLayoutComponents(input: unknown): unknown[] {
  return Array.isArray(input) ? input : [];
}

export function setPortalPageSettingsApi(
  api: Partial<PortalPageSettingsApi>,
  context: PortalEngineContext = getDefaultPortalEngineContext()
) {
  const currentPortalPageSettingsApi = getPortalPageSettingsApi(context);
  return writePortalEngineContextValue(
    PORTAL_PAGE_SETTINGS_API_CONTEXT_KEY,
    {
      ...currentPortalPageSettingsApi,
      ...api
    },
    context
  );
}

export function resetPortalPageSettingsApi(
  context: PortalEngineContext = getDefaultPortalEngineContext()
) {
  return writePortalEngineContextValue(
    PORTAL_PAGE_SETTINGS_API_CONTEXT_KEY,
    createFallbackPortalPageSettingsApi(),
    context
  );
}

export function getPortalPageSettingsApi(
  context: PortalEngineContext = getDefaultPortalEngineContext()
): PortalPageSettingsApi {
  return readPortalEngineContextValue<PortalPageSettingsApi>(
    PORTAL_PAGE_SETTINGS_API_CONTEXT_KEY,
    context,
    createFallbackPortalPageSettingsApi
  );
}

export function createPortalPageSettingsService(
  api: PortalPageSettingsApi | undefined = undefined,
  context: PortalEngineContext = getDefaultPortalEngineContext()
) {
  const resolvedApi = api ?? getPortalPageSettingsApi(context);

  async function loadTabPageSettings(tabId: string): Promise<PortalTabPageSettingsDetail> {
    const res = await resolvedApi.getTabDetail({ id: tabId });
    if (!isPortalBizOk(res)) {
      throw new Error(res?.message || '加载页面设置失败');
    }

    const tab = (res?.data ?? {}) as PortalPageSettingsTabLike;
    const tabName = typeof tab.tabName === 'string' ? tab.tabName.trim() : '';
    const pageLayout = parsePageLayout(tab.pageLayout);

    return {
      tab,
      pageLayout,
      settings: normalizeSettingsWithFallback(pageLayout.settings, tabName),
      components: resolvePageLayoutComponents(pageLayout.component)
    };
  }

  async function saveTabPageSettingsDirect(params: SaveTabPageSettingsDirectParams): Promise<void> {
    const fallbackTabName = typeof params.tabName === 'string' ? params.tabName.trim() : '';
    const mergedSettings = normalizeSettingsWithFallback(params.settings, fallbackTabName);
    const pageLayout = buildPortalPageLayoutForSave(mergedSettings, params.components);
    const res = await resolvedApi.updateTab({
      id: params.tabId,
      templateId: params.templateId,
      tabName: fallbackTabName || mergedSettings.basic.pageTitle || '页面',
      pageLayout: JSON.stringify(pageLayout)
    });

    if (!isPortalBizOk(res)) {
      throw new Error(res?.message || '页面设置保存失败');
    }
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
    const templateId = normalizeIdLike(detail.tab.templateId) || params.templateId;
    const tabName =
      (typeof detail.tab.tabName === 'string' && detail.tab.tabName.trim()) ||
      mergedSettings.basic.pageTitle ||
      '页面';

    await saveTabPageSettingsDirect({
      tabId: params.tabId,
      templateId,
      tabName,
      settings: mergedSettings,
      components: detail.components
    });
  }

  return {
    loadTabPageSettings,
    saveTabPageSettings,
    saveTabPageSettingsDirect
  };
}
