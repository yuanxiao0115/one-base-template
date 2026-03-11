import type { PortalTab } from "../types";

export type PortalHeaderMode = "configurable" | "customComponent";
export type PortalHeaderVariant = "classic" | "newsBlue" | "newsRed";
export type PortalFooterVariant = "simple" | "gov" | "enterprise";
export type PortalNavSource = "tabTree" | "manual";
export type PortalNavAlign = "left" | "center" | "right";
export type PortalFooterFixedMode = "static" | "fixed";

export interface PortalShellNavItem {
  key: string;
  label: string;
  tabId?: string;
  url?: string;
}

export interface PortalHeaderTokens {
  bgColor: string;
  textColor: string;
  activeBgColor: string;
  activeTextColor: string;
  height: number;
  logo: string;
  logoWidth: number;
  logoLeftMargin: number;
  containerWidth: number;
  sticky: boolean;
  zIndex: number;
  shadow: string;
}

export interface PortalHeaderBehavior {
  navSource: PortalNavSource;
  navAlign: PortalNavAlign;
  showUserCenter: boolean;
  showTopNotice: boolean;
  topNoticeText: string;
  manualNavItems: PortalShellNavItem[];
}

export interface PortalHeaderConfig {
  enabled: boolean;
  mode: PortalHeaderMode;
  variant: PortalHeaderVariant;
  customComponentKey: string;
  tokens: PortalHeaderTokens;
  behavior: PortalHeaderBehavior;
}

export interface PortalFooterTokens {
  bgColor: string;
  textColor: string;
  linkColor: string;
  height: number;
  containerWidth: number;
  borderTopColor: string;
}

export interface PortalFooterContent {
  description: string;
  copyright: string;
  icp: string;
  policeRecord: string;
  links: Array<{ label: string; url: string }>;
}

export interface PortalFooterBehavior {
  fixedMode: PortalFooterFixedMode;
  scrollableWhenFixed: boolean;
}

export interface PortalFooterConfig {
  enabled: boolean;
  variant: PortalFooterVariant;
  tokens: PortalFooterTokens;
  content: PortalFooterContent;
  behavior: PortalFooterBehavior;
}

export interface PortalShellConfig {
  header: PortalHeaderConfig;
  footer: PortalFooterConfig;
}

export interface PortalPageShellOverride {
  headerOverrideEnabled?: boolean;
  footerOverrideEnabled?: boolean;
  header?: Partial<PortalHeaderConfig>;
  footer?: Partial<PortalFooterConfig>;
}

export interface PortalTemplateDetails {
  schemaVersion: 1;
  pageHeader: number;
  pageFooter: number;
  shell: PortalShellConfig;
  pageOverrides: Record<string, PortalPageShellOverride>;
}

export interface PortalResolvedShell {
  pageHeader: number;
  pageFooter: number;
  header: PortalHeaderConfig;
  footer: PortalFooterConfig;
}

export const PORTAL_CUSTOM_HEADER_OPTIONS = [
  {
    key: "news-government-v1",
    label: "新闻门户-政务红",
    description: "红色政务风格，适配新闻门户等专题站点",
  },
] as const;

export const PORTAL_HEADER_VARIANT_OPTIONS: Array<{ label: string; value: PortalHeaderVariant }> = [
  { label: "经典蓝", value: "classic" },
  { label: "新闻蓝", value: "newsBlue" },
  { label: "新闻红", value: "newsRed" },
];

export const PORTAL_FOOTER_VARIANT_OPTIONS: Array<{ label: string; value: PortalFooterVariant }> = [
  { label: "简洁页脚", value: "simple" },
  { label: "政务页脚", value: "gov" },
  { label: "企业页脚", value: "enterprise" },
];

const DEFAULT_DETAILS: PortalTemplateDetails = {
  schemaVersion: 1,
  pageHeader: 1,
  pageFooter: 1,
  shell: {
    header: {
      enabled: true,
      mode: "configurable",
      variant: "classic",
      customComponentKey: "",
      tokens: {
        bgColor: "#0f62cf",
        textColor: "#ffffff",
        activeBgColor: "rgba(255,255,255,0.16)",
        activeTextColor: "#ffffff",
        height: 60,
        logo: "",
        logoWidth: 150,
        logoLeftMargin: 0,
        containerWidth: 1200,
        sticky: false,
        zIndex: 20,
        shadow: "0 1px 4px rgba(15, 98, 207, 0.18)",
      },
      behavior: {
        navSource: "tabTree",
        navAlign: "left",
        showUserCenter: true,
        showTopNotice: false,
        topNoticeText: "",
        manualNavItems: [],
      },
    },
    footer: {
      enabled: true,
      variant: "simple",
      tokens: {
        bgColor: "#f8fafc",
        textColor: "#475569",
        linkColor: "#2563eb",
        height: 80,
        containerWidth: 1200,
        borderTopColor: "#e2e8f0",
      },
      content: {
        description: "",
        copyright: "",
        icp: "",
        policeRecord: "",
        links: [],
      },
      behavior: {
        fixedMode: "static",
        scrollableWhenFixed: true,
      },
    },
  },
  pageOverrides: {},
};

function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback: number): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === 1 || value === "1" || value === "true") {
    return true;
  }
  if (value === 0 || value === "0" || value === "false") {
    return false;
  }
  return fallback;
}

function toEnabledNumber(value: unknown, fallback: number): number {
  return toBoolean(value, fallback === 1) ? 1 : 0;
}

function normalizeNavItems(input: unknown): PortalShellNavItem[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const items: PortalShellNavItem[] = [];
  input.forEach((item, index) => {
    if (!isObject(item)) {
      return;
    }
    const label = toText(item.label).trim();
    if (!label) {
      return;
    }

    const key = toText(item.key).trim() || `manual-${index + 1}`;
    const tabId = toText(item.tabId).trim();
    const url = toText(item.url).trim();

    const next: PortalShellNavItem = {
      key,
      label,
    };
    if (tabId) {
      next.tabId = tabId;
    }
    if (url) {
      next.url = url;
    }
    items.push(next);
  });
  return items;
}

function mergeHeaderConfig(input: unknown, fallback: PortalHeaderConfig): PortalHeaderConfig {
  if (!isObject(input)) {
    return deepCopy(fallback);
  }

  const next = deepCopy(fallback);
  next.enabled = toBoolean(input.enabled, next.enabled);
  next.mode = input.mode === "customComponent" ? "customComponent" : "configurable";
  next.variant = input.variant === "newsBlue" || input.variant === "newsRed" ? input.variant : "classic";
  next.customComponentKey = toText(input.customComponentKey, next.customComponentKey);

  const tokens = isObject(input.tokens) ? input.tokens : {};
  next.tokens.bgColor = toText(tokens.bgColor, next.tokens.bgColor);
  next.tokens.textColor = toText(tokens.textColor, next.tokens.textColor);
  next.tokens.activeBgColor = toText(tokens.activeBgColor, next.tokens.activeBgColor);
  next.tokens.activeTextColor = toText(tokens.activeTextColor, next.tokens.activeTextColor);
  next.tokens.height = toNumber(tokens.height, next.tokens.height);
  next.tokens.logo = toText(tokens.logo, next.tokens.logo);
  next.tokens.logoWidth = toNumber(tokens.logoWidth, next.tokens.logoWidth);
  next.tokens.logoLeftMargin = toNumber(tokens.logoLeftMargin, next.tokens.logoLeftMargin);
  next.tokens.containerWidth = toNumber(tokens.containerWidth, next.tokens.containerWidth);
  next.tokens.sticky = toBoolean(tokens.sticky, next.tokens.sticky);
  next.tokens.zIndex = toNumber(tokens.zIndex, next.tokens.zIndex);
  next.tokens.shadow = toText(tokens.shadow, next.tokens.shadow);

  const behavior = isObject(input.behavior) ? input.behavior : {};
  next.behavior.navSource = behavior.navSource === "manual" ? "manual" : "tabTree";
  next.behavior.navAlign = behavior.navAlign === "center" || behavior.navAlign === "right" ? behavior.navAlign : "left";
  next.behavior.showUserCenter = toBoolean(behavior.showUserCenter, next.behavior.showUserCenter);
  next.behavior.showTopNotice = toBoolean(behavior.showTopNotice, next.behavior.showTopNotice);
  next.behavior.topNoticeText = toText(behavior.topNoticeText, next.behavior.topNoticeText);
  next.behavior.manualNavItems = normalizeNavItems(behavior.manualNavItems);

  return next;
}

function mergeFooterConfig(input: unknown, fallback: PortalFooterConfig): PortalFooterConfig {
  if (!isObject(input)) {
    return deepCopy(fallback);
  }

  const next = deepCopy(fallback);
  next.enabled = toBoolean(input.enabled, next.enabled);
  next.variant = input.variant === "gov" || input.variant === "enterprise" ? input.variant : "simple";

  const tokens = isObject(input.tokens) ? input.tokens : {};
  next.tokens.bgColor = toText(tokens.bgColor, next.tokens.bgColor);
  next.tokens.textColor = toText(tokens.textColor, next.tokens.textColor);
  next.tokens.linkColor = toText(tokens.linkColor, next.tokens.linkColor);
  next.tokens.height = toNumber(tokens.height, next.tokens.height);
  next.tokens.containerWidth = toNumber(tokens.containerWidth, next.tokens.containerWidth);
  next.tokens.borderTopColor = toText(tokens.borderTopColor, next.tokens.borderTopColor);

  const content = isObject(input.content) ? input.content : {};
  next.content.description = toText(content.description, next.content.description);
  next.content.copyright = toText(content.copyright, next.content.copyright);
  next.content.icp = toText(content.icp, next.content.icp);
  next.content.policeRecord = toText(content.policeRecord, next.content.policeRecord);
  const linksRaw = Array.isArray(content.links) ? content.links : [];
  next.content.links = linksRaw
    .map((item) => {
      if (!isObject(item)) {
        return null;
      }
      const label = toText(item.label).trim();
      const url = toText(item.url).trim();
      if (!(label || url)) {
        return null;
      }
      return {
        label,
        url,
      };
    })
    .filter((item): item is { label: string; url: string } => Boolean(item));

  const behavior = isObject(input.behavior) ? input.behavior : {};
  next.behavior.fixedMode = behavior.fixedMode === "fixed" ? "fixed" : "static";
  next.behavior.scrollableWhenFixed = toBoolean(behavior.scrollableWhenFixed, next.behavior.scrollableWhenFixed);

  return next;
}

function mergePageOverride(input: unknown, fallbackHeader: PortalHeaderConfig, fallbackFooter: PortalFooterConfig): PortalPageShellOverride {
  if (!isObject(input)) {
    return {};
  }

  const next: PortalPageShellOverride = {};
  next.headerOverrideEnabled = toBoolean(input.headerOverrideEnabled, false);
  next.footerOverrideEnabled = toBoolean(input.footerOverrideEnabled, false);

  if (isObject(input.header)) {
    next.header = mergeHeaderConfig(input.header, fallbackHeader);
  }
  if (isObject(input.footer)) {
    next.footer = mergeFooterConfig(input.footer, fallbackFooter);
  }

  return next;
}

function normalizePageOverrides(
  input: unknown,
  fallbackHeader: PortalHeaderConfig,
  fallbackFooter: PortalFooterConfig
): Record<string, PortalPageShellOverride> {
  if (!isObject(input)) {
    return {};
  }

  const entries = Object.entries(input);
  const next: Record<string, PortalPageShellOverride> = {};
  for (const [key, value] of entries) {
    const tabId = key.trim();
    if (!tabId) {
      continue;
    }
    next[tabId] = mergePageOverride(value, fallbackHeader, fallbackFooter);
  }
  return next;
}

export function createDefaultPortalTemplateDetails(): PortalTemplateDetails {
  return deepCopy(DEFAULT_DETAILS);
}

export function parsePortalTemplateDetails(raw: unknown): PortalTemplateDetails {
  const fallback = createDefaultPortalTemplateDetails();

  let source: unknown = raw;
  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) {
      return fallback;
    }
    try {
      source = JSON.parse(text);
    } catch {
      return fallback;
    }
  }

  if (!isObject(source)) {
    return fallback;
  }

  const next = createDefaultPortalTemplateDetails();
  next.schemaVersion = 1;

  const shell = isObject(source.shell) ? source.shell : {};
  const headerInput = isObject(shell.header) ? shell.header : source.header;
  const footerInput = isObject(shell.footer) ? shell.footer : source.footer;

  next.shell.header = mergeHeaderConfig(headerInput, next.shell.header);
  next.shell.footer = mergeFooterConfig(footerInput, next.shell.footer);

  next.pageHeader = toEnabledNumber(source.pageHeader, next.shell.header.enabled ? 1 : 0);
  next.pageFooter = toEnabledNumber(source.pageFooter, next.shell.footer.enabled ? 1 : 0);
  next.shell.header.enabled = next.pageHeader === 1;
  next.shell.footer.enabled = next.pageFooter === 1;

  next.pageOverrides = normalizePageOverrides(source.pageOverrides, next.shell.header, next.shell.footer);

  return next;
}

export function stringifyPortalTemplateDetails(input: PortalTemplateDetails): string {
  return JSON.stringify(input);
}

export function resolvePortalShellForTab(details: PortalTemplateDetails, tabId: string): PortalResolvedShell {
  const resolved: PortalResolvedShell = {
    pageHeader: details.pageHeader,
    pageFooter: details.pageFooter,
    header: deepCopy(details.shell.header),
    footer: deepCopy(details.shell.footer),
  };

  const override = tabId ? details.pageOverrides?.[tabId] : undefined;
  if (!override) {
    return resolved;
  }

  if (override.headerOverrideEnabled && override.header) {
    resolved.header = mergeHeaderConfig(override.header, resolved.header);
    resolved.pageHeader = resolved.header.enabled ? 1 : 0;
  }
  if (override.footerOverrideEnabled && override.footer) {
    resolved.footer = mergeFooterConfig(override.footer, resolved.footer);
    resolved.pageFooter = resolved.footer.enabled ? 1 : 0;
  }

  return resolved;
}

export function normalizeTabId(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return "";
}

export function buildPortalHeaderNavItems(tabs: PortalTab[] | undefined): PortalShellNavItem[] {
  if (!Array.isArray(tabs)) {
    return [];
  }

  const items: PortalShellNavItem[] = [];

  const walk = (nodes: PortalTab[]) => {
    for (const node of nodes) {
      if (!node || typeof node !== "object") {
        continue;
      }
      if (node.isHide === 1) {
        continue;
      }

      const id = normalizeTabId(node.id);
      const label = toText(node.tabName).trim();
      if (node.tabType === 2 && id && label) {
        items.push({
          key: `tab-${id}`,
          label,
          tabId: id,
        });
      } else if (node.tabType === 3 && label) {
        const url = toText(node.tabUrl).trim();
        items.push({
          key: `link-${id || label}`,
          label,
          url: url || undefined,
        });
      }

      if (Array.isArray(node.children) && node.children.length > 0) {
        walk(node.children);
      }
    }
  };

  walk(tabs);

  return items;
}

export function getCustomHeaderOption(key: string): (typeof PORTAL_CUSTOM_HEADER_OPTIONS)[number] | null {
  return PORTAL_CUSTOM_HEADER_OPTIONS.find((item) => item.key === key) ?? null;
}
