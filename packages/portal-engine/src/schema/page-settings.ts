export const PORTAL_PAGE_SETTINGS_V2_VERSION = '2.0' as const;

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

export type PortalPageAccessMode = 'public' | 'login' | 'role';

export interface PortalPageAccessSettings {
  mode: PortalPageAccessMode;
  roleIds: string[];
}

export interface PortalPagePublishGuardSettings {
  requireContent: boolean;
  requireTitle: boolean;
}

export type PortalPageLayoutMode =
  | 'global-scroll'
  | 'header-fixed-content-scroll'
  | 'header-fixed-footer-fixed-content-scroll';

export type PortalPageContentWidthMode = 'full-width' | 'fixed' | 'custom';

export type PortalPageContentAlign = 'left' | 'center';

export type PortalPageOverflowMode = 'auto' | 'scroll' | 'hidden';

export interface PortalPageLayoutContainerSettings {
  widthMode: PortalPageContentWidthMode;
  fixedWidth: number;
  customWidth: number;
  contentAlign: PortalPageContentAlign;
  contentMinHeight: number;
  overflowMode: PortalPageOverflowMode;
}

export interface PortalPageSpacingSettings {
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
}

export type PortalPageBackgroundRepeat = 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';

export type PortalPageBackgroundSizeMode = 'cover' | 'contain' | 'custom';

export type PortalPageBackgroundAttachment = 'scroll' | 'fixed';

export type PortalPageBackgroundScope = 'page' | 'content' | 'banner';

export interface PortalPageBackgroundSettings {
  backgroundColor: string;
  backgroundImage: string;
  backgroundRepeat: PortalPageBackgroundRepeat;
  backgroundSizeMode: PortalPageBackgroundSizeMode;
  backgroundSizeCustom: string;
  backgroundPosition: string;
  backgroundAttachment: PortalPageBackgroundAttachment;
  scope: PortalPageBackgroundScope;
  overlayColor: string;
  overlayOpacity: number;
}

export interface PortalPageBannerSettings {
  enabled: boolean;
  image: string;
  height: number;
  fullWidth: boolean;
  linkUrl: string;
  overlayColor: string;
  overlayOpacity: number;
}

export type PortalPageFooterMode = 'normal' | 'fixed';

export interface PortalPageHeaderFooterBehaviorSettings {
  headerSticky: boolean;
  headerOffsetTop: number;
  footerMode: PortalPageFooterMode;
  footerFixedHeight: number;
}

export interface PortalPageResponsiveItemSettings {
  enabled: boolean;
  maxWidth: number;
  colNum: number;
  colSpace: number;
  rowSpace: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  bannerHeight: number;
}

export interface PortalPageResponsiveSettings {
  pad: PortalPageResponsiveItemSettings;
  mobile: PortalPageResponsiveItemSettings;
}

export type PortalPageViewportType = 'pc' | 'pad' | 'mobile';

export interface PortalPageRuntimeSettings {
  viewport: PortalPageViewportType;
  grid: PortalPageGridSettings;
  spacing: PortalPageSpacingSettings;
  bannerHeight: number;
}

export interface PortalPageSettingsV2 {
  version: typeof PORTAL_PAGE_SETTINGS_V2_VERSION;
  basic: PortalPageBasicSettings;
  layout: PortalPageGridSettings;
  layoutMode: PortalPageLayoutMode;
  layoutContainer: PortalPageLayoutContainerSettings;
  spacing: PortalPageSpacingSettings;
  background: PortalPageBackgroundSettings;
  banner: PortalPageBannerSettings;
  headerFooterBehavior: PortalPageHeaderFooterBehaviorSettings;
  responsive: PortalPageResponsiveSettings;
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
  basicData?: Record<string, unknown>;
  gridData?: {
    colNum?: unknown;
    colSpace?: unknown;
    rowSpace?: unknown;
  };
  marginData?: Record<string, unknown>;
  backgroundData?: Record<string, unknown>;
  headerFooterData?: Record<string, unknown>;
  bannerData?: Record<string, unknown>;
  accessMode?: unknown;
  roleIds?: unknown;
  publishGuard?: {
    requireContent?: unknown;
    requireTitle?: unknown;
  };
  [k: string]: unknown;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    return {};
  }
  return value as Record<string, unknown>;
}

function normalizeNumber(value: unknown, fallback: number, min = 0, max = Number.POSITIVE_INFINITY): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(n)));
}

function normalizePositiveInteger(value: unknown, fallback: number): number {
  return normalizeNumber(value, fallback, 1, 99999);
}

function normalizeNonNegativeInteger(value: unknown, fallback: number): number {
  return normalizeNumber(value, fallback, 0, 99999);
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  return fallback;
}

function normalizeString(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') {
    return fallback;
  }
  return value.trim();
}

function normalizeRoleIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

function normalizeAccessMode(value: unknown): PortalPageAccessMode {
  if (value === 'login' || value === 'role') {
    return value;
  }
  return 'public';
}

function normalizeLayoutMode(value: unknown): PortalPageLayoutMode {
  if (
    value === 'global-scroll' ||
    value === 'header-fixed-content-scroll' ||
    value === 'header-fixed-footer-fixed-content-scroll'
  ) {
    return value;
  }

  // 老项目映射：classic=整体滚动, portal=页头吸顶+内容滚动, flow=页头吸顶+页脚固定
  if (value === 'classic') {
    return 'global-scroll';
  }
  if (value === 'portal') {
    return 'header-fixed-content-scroll';
  }
  if (value === 'flow') {
    return 'header-fixed-footer-fixed-content-scroll';
  }

  return 'header-fixed-content-scroll';
}

function normalizeContentWidthMode(value: unknown): PortalPageContentWidthMode {
  if (value === 'full-width' || value === 'fixed' || value === 'custom') {
    return value;
  }
  if (value === 'fixed-width') {
    return 'fixed';
  }
  return 'fixed';
}

function normalizeContentAlign(value: unknown): PortalPageContentAlign {
  if (value === 'left') {
    return 'left';
  }
  return 'center';
}

function normalizeOverflowMode(value: unknown): PortalPageOverflowMode {
  if (value === 'scroll' || value === 'hidden') {
    return value;
  }
  return 'auto';
}

function normalizeBackgroundRepeat(value: unknown): PortalPageBackgroundRepeat {
  if (value === 'repeat' || value === 'repeat-x' || value === 'repeat-y') {
    return value;
  }
  return 'no-repeat';
}

function normalizeBackgroundSizeMode(value: unknown): PortalPageBackgroundSizeMode {
  if (value === 'contain' || value === 'custom') {
    return value;
  }
  return 'cover';
}

function normalizeBackgroundAttachment(value: unknown): PortalPageBackgroundAttachment {
  if (value === 'fixed') {
    return 'fixed';
  }
  return 'scroll';
}

function normalizeBackgroundScope(value: unknown): PortalPageBackgroundScope {
  if (value === 'content' || value === 'banner') {
    return value;
  }
  return 'page';
}

function normalizeFooterMode(value: unknown): PortalPageFooterMode {
  if (value === 'fixed') {
    return 'fixed';
  }
  return 'normal';
}

function normalizeOpacity(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }

  if (n > 1) {
    return Math.min(1, Math.max(0, n / 100));
  }

  return Math.min(1, Math.max(0, n));
}

function resolveLegacyLayoutContainer(raw: LegacyPortalPageSettingsLike): Partial<PortalPageLayoutContainerSettings> {
  const basicData = asRecord(raw.basicData);

  const legacyLayoutMode = normalizeString(basicData.layoutMode);
  let widthMode: PortalPageContentWidthMode = 'fixed';
  if (legacyLayoutMode === 'full-width') {
    widthMode = 'full-width';
  } else if (legacyLayoutMode === 'custom') {
    widthMode = 'custom';
  }

  return {
    widthMode,
    fixedWidth: normalizePositiveInteger(basicData.contentMaxWidth, 1200),
    customWidth: normalizePositiveInteger(basicData.pageWidth, 1440),
    contentAlign: normalizeContentAlign(basicData.contentAlignment),
    overflowMode: normalizeOverflowMode(basicData.scrollMode),
  };
}

function resolveLegacySpacing(raw: LegacyPortalPageSettingsLike): Partial<PortalPageSpacingSettings> {
  const marginData = asRecord(raw.marginData);
  return {
    marginTop: normalizeNonNegativeInteger(marginData.marginTop, 0),
    marginRight: normalizeNonNegativeInteger(marginData.marginRight, 0),
    marginBottom: normalizeNonNegativeInteger(marginData.marginBottom, 0),
    marginLeft: normalizeNonNegativeInteger(marginData.marginLeft, 0),
    paddingTop: normalizeNonNegativeInteger(marginData.paddingTop, 8),
    paddingRight: normalizeNonNegativeInteger(marginData.paddingRight, 8),
    paddingBottom: normalizeNonNegativeInteger(marginData.paddingBottom, 8),
    paddingLeft: normalizeNonNegativeInteger(marginData.paddingLeft, 8),
  };
}

function resolveLegacyBackground(raw: LegacyPortalPageSettingsLike): Partial<PortalPageBackgroundSettings> {
  const backgroundData = asRecord(raw.backgroundData);

  const legacySize = normalizeString(backgroundData.pageBgSize, 'cover');
  const isLegacyCustomSize = Boolean(legacySize && legacySize !== 'cover' && legacySize !== 'contain');

  const x = normalizeString(backgroundData.pageBgXPosition);
  const y = normalizeString(backgroundData.pageBgYPosition);
  const customPosition = [x || '0px', y || '0px'].join(' ');

  return {
    backgroundColor: normalizeString(backgroundData.pageBgColor, '#ffffff'),
    backgroundImage: normalizeString(backgroundData.pageBgImage),
    backgroundRepeat: normalizeBackgroundRepeat(backgroundData.pageBgRepeat),
    backgroundSizeMode: isLegacyCustomSize ? 'custom' : normalizeBackgroundSizeMode(legacySize),
    backgroundSizeCustom: isLegacyCustomSize ? legacySize : '100% 100%',
    backgroundPosition:
      normalizeString(backgroundData.pageBgPosition) === 'custom'
        ? customPosition
        : normalizeString(backgroundData.pageBgPosition, 'center center'),
    backgroundAttachment: normalizeBackgroundAttachment(backgroundData.pageBgAttachment),
    scope: normalizeBackgroundScope(backgroundData.bgScope),
    overlayColor: normalizeString(backgroundData.pageBgMaskColor, '#000000'),
    overlayOpacity: normalizeOpacity(backgroundData.pageBgOpacity, 0),
  };
}

function resolveLegacyHeaderFooter(raw: LegacyPortalPageSettingsLike): Partial<PortalPageHeaderFooterBehaviorSettings> {
  const headerFooterData = asRecord(raw.headerFooterData);
  return {
    headerSticky: normalizeBoolean(headerFooterData.headerFixed, true),
    headerOffsetTop: normalizeNumber(headerFooterData.overlapHeaderOffset, 0, -300, 300),
    footerMode: headerFooterData.footerFixedMode === 'fixed' ? 'fixed' : 'normal',
    footerFixedHeight: normalizePositiveInteger(headerFooterData.footerHeight, 72),
  };
}

function normalizeResponsiveItem(
  input: unknown,
  defaults: PortalPageResponsiveItemSettings
): PortalPageResponsiveItemSettings {
  const raw = asRecord(input);
  return {
    enabled: normalizeBoolean(raw.enabled, defaults.enabled),
    maxWidth: normalizePositiveInteger(raw.maxWidth, defaults.maxWidth),
    colNum: normalizePositiveInteger(raw.colNum, defaults.colNum),
    colSpace: normalizeNonNegativeInteger(raw.colSpace, defaults.colSpace),
    rowSpace: normalizeNonNegativeInteger(raw.rowSpace, defaults.rowSpace),
    marginTop: normalizeNonNegativeInteger(raw.marginTop, defaults.marginTop),
    marginRight: normalizeNonNegativeInteger(raw.marginRight, defaults.marginRight),
    marginBottom: normalizeNonNegativeInteger(raw.marginBottom, defaults.marginBottom),
    marginLeft: normalizeNonNegativeInteger(raw.marginLeft, defaults.marginLeft),
    paddingTop: normalizeNonNegativeInteger(raw.paddingTop, defaults.paddingTop),
    paddingRight: normalizeNonNegativeInteger(raw.paddingRight, defaults.paddingRight),
    paddingBottom: normalizeNonNegativeInteger(raw.paddingBottom, defaults.paddingBottom),
    paddingLeft: normalizeNonNegativeInteger(raw.paddingLeft, defaults.paddingLeft),
    bannerHeight: normalizePositiveInteger(raw.bannerHeight, defaults.bannerHeight),
  };
}

function normalizeBackground(input: unknown, defaults: PortalPageBackgroundSettings): PortalPageBackgroundSettings {
  const raw = asRecord(input);
  return {
    backgroundColor: normalizeString(raw.backgroundColor, defaults.backgroundColor),
    backgroundImage: normalizeString(raw.backgroundImage, defaults.backgroundImage),
    backgroundRepeat: normalizeBackgroundRepeat(raw.backgroundRepeat),
    backgroundSizeMode: normalizeBackgroundSizeMode(raw.backgroundSizeMode),
    backgroundSizeCustom: normalizeString(raw.backgroundSizeCustom, defaults.backgroundSizeCustom),
    backgroundPosition: normalizeString(raw.backgroundPosition, defaults.backgroundPosition),
    backgroundAttachment: normalizeBackgroundAttachment(raw.backgroundAttachment),
    scope: normalizeBackgroundScope(raw.scope),
    overlayColor: normalizeString(raw.overlayColor, defaults.overlayColor),
    overlayOpacity: normalizeOpacity(raw.overlayOpacity, defaults.overlayOpacity),
  };
}

function normalizeSpacing(input: unknown, defaults: PortalPageSpacingSettings): PortalPageSpacingSettings {
  const raw = asRecord(input);
  return {
    marginTop: normalizeNonNegativeInteger(raw.marginTop, defaults.marginTop),
    marginRight: normalizeNonNegativeInteger(raw.marginRight, defaults.marginRight),
    marginBottom: normalizeNonNegativeInteger(raw.marginBottom, defaults.marginBottom),
    marginLeft: normalizeNonNegativeInteger(raw.marginLeft, defaults.marginLeft),
    paddingTop: normalizeNonNegativeInteger(raw.paddingTop, defaults.paddingTop),
    paddingRight: normalizeNonNegativeInteger(raw.paddingRight, defaults.paddingRight),
    paddingBottom: normalizeNonNegativeInteger(raw.paddingBottom, defaults.paddingBottom),
    paddingLeft: normalizeNonNegativeInteger(raw.paddingLeft, defaults.paddingLeft),
  };
}

function normalizeLayoutContainer(
  input: unknown,
  defaults: PortalPageLayoutContainerSettings
): PortalPageLayoutContainerSettings {
  const raw = asRecord(input);
  return {
    widthMode: normalizeContentWidthMode(raw.widthMode),
    fixedWidth: normalizePositiveInteger(raw.fixedWidth, defaults.fixedWidth),
    customWidth: normalizePositiveInteger(raw.customWidth, defaults.customWidth),
    contentAlign: normalizeContentAlign(raw.contentAlign),
    contentMinHeight: normalizePositiveInteger(raw.contentMinHeight, defaults.contentMinHeight),
    overflowMode: normalizeOverflowMode(raw.overflowMode),
  };
}

export function createDefaultPortalPageSettingsV2(): PortalPageSettingsV2 {
  return {
    version: PORTAL_PAGE_SETTINGS_V2_VERSION,
    basic: {
      pageTitle: '',
      slug: '',
      isVisible: true,
    },
    layout: {
      colNum: 12,
      colSpace: 16,
      rowSpace: 16,
    },
    layoutMode: 'header-fixed-content-scroll',
    layoutContainer: {
      widthMode: 'fixed',
      fixedWidth: 1200,
      customWidth: 1440,
      contentAlign: 'center',
      contentMinHeight: 720,
      overflowMode: 'auto',
    },
    spacing: {
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      paddingTop: 8,
      paddingRight: 8,
      paddingBottom: 8,
      paddingLeft: 8,
    },
    background: {
      backgroundColor: '#ffffff',
      backgroundImage: '',
      backgroundRepeat: 'no-repeat',
      backgroundSizeMode: 'cover',
      backgroundSizeCustom: '100% 100%',
      backgroundPosition: 'center center',
      backgroundAttachment: 'scroll',
      scope: 'page',
      overlayColor: '#000000',
      overlayOpacity: 0,
    },
    banner: {
      enabled: false,
      image: '',
      height: 260,
      fullWidth: true,
      linkUrl: '',
      overlayColor: '#000000',
      overlayOpacity: 0,
    },
    headerFooterBehavior: {
      headerSticky: true,
      headerOffsetTop: 0,
      footerMode: 'normal',
      footerFixedHeight: 72,
    },
    responsive: {
      pad: {
        enabled: false,
        maxWidth: 1200,
        colNum: 8,
        colSpace: 12,
        rowSpace: 12,
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,
        paddingTop: 8,
        paddingRight: 8,
        paddingBottom: 8,
        paddingLeft: 8,
        bannerHeight: 220,
      },
      mobile: {
        enabled: false,
        maxWidth: 768,
        colNum: 4,
        colSpace: 8,
        rowSpace: 8,
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,
        paddingTop: 6,
        paddingRight: 6,
        paddingBottom: 6,
        paddingLeft: 6,
        bannerHeight: 180,
      },
    },
    access: {
      mode: 'public',
      roleIds: [],
    },
    publishGuard: {
      requireContent: true,
      requireTitle: true,
    },
  };
}

export function isPortalPageSettingsV2(input: unknown): input is PortalPageSettingsV2 {
  if (!input || typeof input !== 'object') {
    return false;
  }
  const raw = input as Record<string, unknown>;
  return raw.version === PORTAL_PAGE_SETTINGS_V2_VERSION;
}

export function normalizePortalPageSettingsV2(input: unknown): PortalPageSettingsV2 {
  const defaults = createDefaultPortalPageSettingsV2();
  if (!input || typeof input !== 'object') {
    return defaults;
  }

  const raw = input as LegacyPortalPageSettingsLike & {
    version?: unknown;
    basic?: Record<string, unknown>;
    layout?: Record<string, unknown>;
    layoutContainer?: Record<string, unknown>;
    spacing?: Record<string, unknown>;
    background?: Record<string, unknown>;
    banner?: Record<string, unknown>;
    headerFooterBehavior?: Record<string, unknown>;
    responsive?: Record<string, unknown>;
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
      layoutMode: normalizeLayoutMode(raw.layoutMode),
      layoutContainer: normalizeLayoutContainer(raw.layoutContainer, defaults.layoutContainer),
      spacing: normalizeSpacing(raw.spacing, defaults.spacing),
      background: normalizeBackground(raw.background, defaults.background),
      banner: {
        enabled: normalizeBoolean(raw.banner?.enabled, defaults.banner.enabled),
        image: normalizeString(raw.banner?.image),
        height: normalizePositiveInteger(raw.banner?.height, defaults.banner.height),
        fullWidth: normalizeBoolean(raw.banner?.fullWidth, defaults.banner.fullWidth),
        linkUrl: normalizeString(raw.banner?.linkUrl),
        overlayColor: normalizeString(raw.banner?.overlayColor, defaults.banner.overlayColor),
        overlayOpacity: normalizeOpacity(raw.banner?.overlayOpacity, defaults.banner.overlayOpacity),
      },
      headerFooterBehavior: {
        headerSticky: normalizeBoolean(raw.headerFooterBehavior?.headerSticky, defaults.headerFooterBehavior.headerSticky),
        headerOffsetTop: normalizeNumber(
          raw.headerFooterBehavior?.headerOffsetTop,
          defaults.headerFooterBehavior.headerOffsetTop,
          -300,
          300
        ),
        footerMode: normalizeFooterMode(raw.headerFooterBehavior?.footerMode),
        footerFixedHeight: normalizePositiveInteger(
          raw.headerFooterBehavior?.footerFixedHeight,
          defaults.headerFooterBehavior.footerFixedHeight
        ),
      },
      responsive: {
        pad: normalizeResponsiveItem(raw.responsive?.pad, defaults.responsive.pad),
        mobile: normalizeResponsiveItem(raw.responsive?.mobile, defaults.responsive.mobile),
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
  const legacyLayoutContainer = resolveLegacyLayoutContainer(raw);
  const legacySpacing = resolveLegacySpacing(raw);
  const legacyBackground = resolveLegacyBackground(raw);
  const legacyHeaderFooterBehavior = resolveLegacyHeaderFooter(raw);
  const headerFooterData = asRecord(raw.headerFooterData);
  const basicData = asRecord(raw.basicData);

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
    layoutMode: normalizeLayoutMode(headerFooterData.layoutMode),
    layoutContainer: {
      ...defaults.layoutContainer,
      ...legacyLayoutContainer,
      overflowMode: normalizeOverflowMode(basicData.scrollMode),
    },
    spacing: {
      ...defaults.spacing,
      ...legacySpacing,
    },
    background: {
      ...defaults.background,
      ...legacyBackground,
    },
    banner: {
      ...defaults.banner,
      enabled: normalizeBoolean(raw.bannerData?.enabled, defaults.banner.enabled),
      image: normalizeString(raw.bannerData?.image),
      height: normalizePositiveInteger(raw.bannerData?.height, defaults.banner.height),
      fullWidth: normalizeBoolean(raw.bannerData?.fullWidth, defaults.banner.fullWidth),
      linkUrl: normalizeString(raw.bannerData?.linkUrl),
    },
    headerFooterBehavior: {
      ...defaults.headerFooterBehavior,
      ...legacyHeaderFooterBehavior,
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

export function resolvePortalPageRuntimeSettings(
  input: unknown,
  options: { viewportWidth?: number } = {}
): PortalPageRuntimeSettings {
  const normalized = normalizePortalPageSettingsV2(input);
  const viewportWidth = normalizePositiveInteger(options.viewportWidth, 1920);

  const mobileSettings = normalized.responsive.mobile;
  const padSettings = normalized.responsive.pad;

  let viewport: PortalPageViewportType = 'pc';
  if (mobileSettings.enabled && viewportWidth <= mobileSettings.maxWidth) {
    viewport = 'mobile';
  } else if (padSettings.enabled && viewportWidth <= padSettings.maxWidth) {
    viewport = 'pad';
  }

  if (viewport === 'mobile') {
    return {
      viewport,
      grid: {
        colNum: mobileSettings.colNum,
        colSpace: mobileSettings.colSpace,
        rowSpace: mobileSettings.rowSpace,
      },
      spacing: {
        marginTop: mobileSettings.marginTop,
        marginRight: mobileSettings.marginRight,
        marginBottom: mobileSettings.marginBottom,
        marginLeft: mobileSettings.marginLeft,
        paddingTop: mobileSettings.paddingTop,
        paddingRight: mobileSettings.paddingRight,
        paddingBottom: mobileSettings.paddingBottom,
        paddingLeft: mobileSettings.paddingLeft,
      },
      bannerHeight: mobileSettings.bannerHeight,
    };
  }

  if (viewport === 'pad') {
    return {
      viewport,
      grid: {
        colNum: padSettings.colNum,
        colSpace: padSettings.colSpace,
        rowSpace: padSettings.rowSpace,
      },
      spacing: {
        marginTop: padSettings.marginTop,
        marginRight: padSettings.marginRight,
        marginBottom: padSettings.marginBottom,
        marginLeft: padSettings.marginLeft,
        paddingTop: padSettings.paddingTop,
        paddingRight: padSettings.paddingRight,
        paddingBottom: padSettings.paddingBottom,
        paddingLeft: padSettings.paddingLeft,
      },
      bannerHeight: padSettings.bannerHeight,
    };
  }

  return {
    viewport,
    grid: normalized.layout,
    spacing: normalized.spacing,
    bannerHeight: normalized.banner.height,
  };
}

export function getPortalGridSettings(
  input: unknown,
  options: { viewportWidth?: number } = {}
): PortalPageGridSettings {
  return resolvePortalPageRuntimeSettings(input, options).grid;
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
      field: 'basic.pageTitle',
      message: '请填写页面标题',
    });
  }

  if (normalized.access.mode === 'role' && normalized.access.roleIds.length === 0) {
    issues.push({
      field: 'access.roleIds',
      message: '访问方式为角色可见时必须选择角色',
    });
  }

  if (normalized.publishGuard.requireContent && componentCount <= 0) {
    issues.push({
      field: 'publishGuard.requireContent',
      message: '当前页面没有组件内容，无法发布',
    });
  }

  if (normalized.layout.colNum <= 0) {
    issues.push({
      field: 'layout.colNum',
      message: '栅格列数必须大于 0',
    });
  }

  if (normalized.layoutContainer.widthMode === 'custom' && normalized.layoutContainer.customWidth < 320) {
    issues.push({
      field: 'layoutContainer.customWidth',
      message: '自定义内容宽度不能小于 320px',
    });
  }

  if (normalized.headerFooterBehavior.footerMode === 'fixed' && normalized.headerFooterBehavior.footerFixedHeight < 40) {
    issues.push({
      field: 'headerFooterBehavior.footerFixedHeight',
      message: '固定页脚高度不能小于 40px',
    });
  }

  if (
    normalized.responsive.mobile.enabled &&
    normalized.responsive.pad.enabled &&
    normalized.responsive.mobile.maxWidth >= normalized.responsive.pad.maxWidth
  ) {
    issues.push({
      field: 'responsive.mobile.maxWidth',
      message: '移动端断点宽度必须小于平板断点宽度',
    });
  }

  return issues;
}
