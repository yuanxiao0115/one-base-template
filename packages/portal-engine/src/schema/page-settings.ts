export const PORTAL_PAGE_SETTINGS_V2_VERSION = "2.0" as const;

export interface PortalPageGridSettings {
  colNum: number;
  colSpace: number;
  rowSpace: number;
}

export interface PortalPageBasicSettings {
  pageTitle: string;
  slug?: string;
  isVisible: boolean;
}

export type PortalPageAccessMode = "public" | "login" | "role";

export interface PortalPageAccessSettings {
  mode: PortalPageAccessMode;
  roleIds: string[];
}

export interface PortalPagePublishGuardSettings {
  requireContent: boolean;
  requireTitle: boolean;
}

export interface PortalPageSettingsV2 {
  version: typeof PORTAL_PAGE_SETTINGS_V2_VERSION;
  basic: PortalPageBasicSettings;
  layout: PortalPageGridSettings;
  access: PortalPageAccessSettings;
  publishGuard: PortalPagePublishGuardSettings;
  [k: string]: unknown;
}

export interface PortalPageLayoutPayload<TComponent = unknown> {
  settings: PortalPageSettingsV2;
  component: TComponent[];
}

export interface PortalPageSettingIssue {
  field: string;
  message: string;
}

interface LegacyPortalPageSettingsLike {
  pageTitle?: unknown;
  slug?: unknown;
  isVisible?: unknown;
  gridData?: {
    colNum?: unknown;
    colSpace?: unknown;
    rowSpace?: unknown;
  };
  accessMode?: unknown;
  roleIds?: unknown;
  publishGuard?: {
    requireContent?: unknown;
    requireTitle?: unknown;
  };
  [k: string]: unknown;
}

function normalizePositiveInteger(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.max(1, Math.round(n));
}

function normalizeNonNegativeInteger(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.max(0, Math.round(n));
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  return fallback;
}

function normalizeString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }
  return value.trim();
}

function normalizeRoleIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizeAccessMode(value: unknown): PortalPageAccessMode {
  if (value === "login" || value === "role") {
    return value;
  }
  return "public";
}

export function createDefaultPortalPageSettingsV2(): PortalPageSettingsV2 {
  return {
    version: PORTAL_PAGE_SETTINGS_V2_VERSION,
    basic: {
      pageTitle: "",
      slug: "",
      isVisible: true,
    },
    layout: {
      colNum: 12,
      colSpace: 16,
      rowSpace: 16,
    },
    access: {
      mode: "public",
      roleIds: [],
    },
    publishGuard: {
      requireContent: true,
      requireTitle: true,
    },
  };
}

export function isPortalPageSettingsV2(input: unknown): input is PortalPageSettingsV2 {
  if (!input || typeof input !== "object") {
    return false;
  }
  const raw = input as Record<string, unknown>;
  return raw.version === PORTAL_PAGE_SETTINGS_V2_VERSION;
}

export function normalizePortalPageSettingsV2(input: unknown): PortalPageSettingsV2 {
  const defaults = createDefaultPortalPageSettingsV2();
  if (!input || typeof input !== "object") {
    return defaults;
  }

  const raw = input as LegacyPortalPageSettingsLike & {
    version?: unknown;
    basic?: Record<string, unknown>;
    layout?: Record<string, unknown>;
    access?: Record<string, unknown>;
  };

  if (isPortalPageSettingsV2(raw)) {
    return {
      ...raw,
      version: PORTAL_PAGE_SETTINGS_V2_VERSION,
      basic: {
        pageTitle: normalizeString(raw.basic?.pageTitle),
        slug: normalizeString(raw.basic?.slug),
        isVisible: normalizeBoolean(raw.basic?.isVisible, defaults.basic.isVisible),
      },
      layout: {
        colNum: normalizePositiveInteger(raw.layout?.colNum, defaults.layout.colNum),
        colSpace: normalizeNonNegativeInteger(raw.layout?.colSpace, defaults.layout.colSpace),
        rowSpace: normalizeNonNegativeInteger(raw.layout?.rowSpace, defaults.layout.rowSpace),
      },
      access: {
        mode: normalizeAccessMode(raw.access?.mode),
        roleIds: normalizeRoleIds(raw.access?.roleIds),
      },
      publishGuard: {
        requireContent: normalizeBoolean(raw.publishGuard?.requireContent, defaults.publishGuard.requireContent),
        requireTitle: normalizeBoolean(raw.publishGuard?.requireTitle, defaults.publishGuard.requireTitle),
      },
    };
  }

  const legacyGrid = raw.gridData;
  return {
    ...defaults,
    version: PORTAL_PAGE_SETTINGS_V2_VERSION,
    basic: {
      pageTitle: normalizeString(raw.pageTitle),
      slug: normalizeString(raw.slug),
      isVisible: normalizeBoolean(raw.isVisible, defaults.basic.isVisible),
    },
    layout: {
      colNum: normalizePositiveInteger(legacyGrid?.colNum, defaults.layout.colNum),
      colSpace: normalizeNonNegativeInteger(legacyGrid?.colSpace, defaults.layout.colSpace),
      rowSpace: normalizeNonNegativeInteger(legacyGrid?.rowSpace, defaults.layout.rowSpace),
    },
    access: {
      mode: normalizeAccessMode(raw.accessMode),
      roleIds: normalizeRoleIds(raw.roleIds),
    },
    publishGuard: {
      requireContent: normalizeBoolean(raw.publishGuard?.requireContent, defaults.publishGuard.requireContent),
      requireTitle: normalizeBoolean(raw.publishGuard?.requireTitle, defaults.publishGuard.requireTitle),
    },
  };
}

export function buildPortalPageLayoutForSave<TComponent>(
  settings: unknown,
  component: TComponent[] | undefined
): PortalPageLayoutPayload<TComponent> {
  return {
    settings: normalizePortalPageSettingsV2(settings),
    component: Array.isArray(component) ? component : [],
  };
}

export function getPortalGridSettings(input: unknown): PortalPageGridSettings {
  return normalizePortalPageSettingsV2(input).layout;
}

export function validatePortalPageSettingsV2(
  settings: unknown,
  options: { componentCount?: number } = {}
): PortalPageSettingIssue[] {
  const normalized = normalizePortalPageSettingsV2(settings);
  const issues: PortalPageSettingIssue[] = [];
  const componentCount = Number(options.componentCount ?? 0);

  if (normalized.publishGuard.requireTitle && !normalized.basic.pageTitle.trim()) {
    issues.push({
      field: "basic.pageTitle",
      message: "请填写页面标题",
    });
  }

  if (normalized.access.mode === "role" && normalized.access.roleIds.length === 0) {
    issues.push({
      field: "access.roleIds",
      message: "访问方式为角色可见时必须选择角色",
    });
  }

  if (normalized.publishGuard.requireContent && componentCount <= 0) {
    issues.push({
      field: "publishGuard.requireContent",
      message: "当前页面没有组件内容，无法发布",
    });
  }

  if (normalized.layout.colNum <= 0) {
    issues.push({
      field: "layout.colNum",
      message: "栅格列数必须大于 0",
    });
  }

  return issues;
}
