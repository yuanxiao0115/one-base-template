import cpIconfont from '../../assets/iconfont/cp-icons/iconfont.json';
import djIconfont from '../../assets/iconfont/dj-icons/iconfont.json';
import omIconfont from '../../assets/iconfont/om-icons/iconfont.json';
import odIconfont from '../../assets/iconfont/od-icons/iconfont.json';

export type MenuIconfontSourceKey = 'cp' | 'dj' | 'od' | 'om';

export interface MenuIconfontGlyph {
  name?: string;
  font_class?: string;
}

interface MenuIconfontManifest {
  glyphs?: MenuIconfontGlyph[];
}

export interface MenuIconfontSource {
  key: MenuIconfontSourceKey;
  label: string;
  glyphs: MenuIconfontGlyph[];
  baseClass: string;
  classPrefix: string;
}

function normalizeIconfontGlyphs(manifest: MenuIconfontManifest): MenuIconfontGlyph[] {
  return Array.isArray(manifest.glyphs) ? manifest.glyphs : [];
}

export const MENU_ICONFONT_SOURCE_MAP: Record<MenuIconfontSourceKey, MenuIconfontSource> = {
  cp: {
    key: 'cp',
    label: 'CP（产品 Iconfont）',
    glyphs: normalizeIconfontGlyphs(cpIconfont),
    baseClass: 'iconfont',
    classPrefix: 'icon-'
  },
  dj: {
    key: 'dj',
    label: 'DJ（党建 Iconfont）',
    glyphs: normalizeIconfontGlyphs(djIconfont),
    baseClass: 'dj-icons',
    classPrefix: 'dj-icon-'
  },
  om: {
    key: 'om',
    label: 'OM（OM Iconfont）',
    glyphs: normalizeIconfontGlyphs(omIconfont),
    baseClass: 'i-icon-menu',
    classPrefix: 'i-icon-'
  },
  od: {
    key: 'od',
    label: 'OD（公文 Iconfont）',
    glyphs: normalizeIconfontGlyphs(odIconfont),
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

export function normalizeIconfontClass(source: MenuIconfontSource, fontClass: string): string {
  const normalized = fontClass.trim();
  if (!normalized) {
    return '';
  }

  return normalized.startsWith(source.classPrefix)
    ? normalized
    : `${source.classPrefix}${normalized}`;
}

export function buildMenuIconfontValue(source: MenuIconfontSource, fontClass: string): string {
  const normalizedClass = normalizeIconfontClass(source, fontClass);
  if (!normalizedClass) {
    return '';
  }

  return `${source.baseClass} ${normalizedClass}`;
}
