export type MenuIconfontSourceKey = 'cp' | 'dj' | 'od' | 'om'

export type MenuIconfontSource = {
  key: MenuIconfontSourceKey
  label: string
  jsonPath: string
  baseClass: string
  classPrefix: string
}

export const MENU_ICONFONT_SOURCE_MAP: Record<MenuIconfontSourceKey, MenuIconfontSource> = {
  cp: {
    key: 'cp',
    label: 'CP（产品 Iconfont）',
    jsonPath: '/fonts/cp-icons/iconfont.json',
    baseClass: 'iconfont',
    classPrefix: 'icon-'
  },
  dj: {
    key: 'dj',
    label: 'DJ（党建 Iconfont）',
    jsonPath: '/fonts/dj-icons/iconfont.json',
    baseClass: 'dj-icons',
    classPrefix: 'dj-icon-'
  },
  om: {
    key: 'om',
    label: 'OM（OM Iconfont）',
    jsonPath: '/fonts/om-icons/iconfont.json',
    baseClass: 'i-icon-menu',
    classPrefix: 'i-icon-'
  },
  od: {
    key: 'od',
    label: 'OD（公文 Iconfont）',
    jsonPath: '/fonts/od-icons/iconfont.json',
    baseClass: 'iconfont-od',
    classPrefix: 'icon-'
  }
};

export const MENU_ICONFONT_SOURCES: MenuIconfontSource[] = [
  MENU_ICONFONT_SOURCE_MAP.cp,
  MENU_ICONFONT_SOURCE_MAP.dj,
  MENU_ICONFONT_SOURCE_MAP.om,
  MENU_ICONFONT_SOURCE_MAP.od
];

export function normalizeIconfontClass (source: MenuIconfontSource, fontClass: string): string {
  const normalized = fontClass.trim();
  if (!normalized) {
    return '';
  }

  return normalized.startsWith(source.classPrefix)
    ? normalized
    : `${source.classPrefix}${normalized}`;
}

export function buildMenuIconfontValue (source: MenuIconfontSource, fontClass: string): string {
  const normalizedClass = normalizeIconfontClass(source, fontClass);
  if (!normalizedClass) {
    return '';
  }

  return `${source.baseClass} ${normalizedClass}`;
}
