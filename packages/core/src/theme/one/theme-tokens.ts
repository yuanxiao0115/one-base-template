import { mix } from '../../utils/color';

export type ThemePresetKey = 'blue' | 'red';

export type OneTokenMap = Record<string, string>;

export type PrimaryScale = {
  light1: string;
  light2: string;
  light3: string;
  light4: string;
  light5: string;
  light6: string;
  light7: string;
  light8: string;
  light9: string;
};

type FeedbackScale = {
  light1: string;
  light2: string;
  light3: string;
  light4: string;
  light5: string;
  light6: string;
  light7: string;
};

type FeedbackKey = 'success' | 'warning' | 'error' | 'info' | 'link';
type PaletteKey = 'red' | 'blue' | 'green' | 'yellow' | 'gray';

type ThemePresetTokens = {
  themes: Record<ThemePresetKey, { primary: PrimaryScale }>;
  palette: Record<PaletteKey, readonly string[]>;
  feedback: Record<FeedbackKey, FeedbackScale>;
};

const PALETTE_LEVELS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

const BASE_STATIC_TOKENS: OneTokenMap = {
  '--one-color-white': '#FFFFFF',
  '--one-color-black': '#000000',

  '--one-border-color': 'var(--one-color-gray-200)',
  '--one-border-color-light': '#E4E7ED',
  '--one-border-color-lighter': '#EBEEF5',
  '--one-border-color-extra-light': '#F2F6FC',
  '--one-border-color-dark': 'var(--one-color-gray-800)',
  '--one-border-color-darker': '#CDD0D6',
  '--one-border-color-gray': 'var(--one-color-gray-800)',

  '--one-fill-color': '#F0F2F5',
  '--one-fill-color-light': '#F5F7FA',
  '--one-fill-color-lighter': '#FAFAFA',
  '--one-fill-color-extra-light': '#FAFCFF',
  '--one-fill-color-dark': '#EBEDF0',
  '--one-fill-color-darker': '#E6E8EB',
  '--one-fill-color-blank': '#FFFFFF',

  '--one-bg-color': 'var(--one-bg-color-4)',
  '--one-bg-color-page': '#F2F3F5',
  '--one-bg-color-overlay': '#FFFFFF',
  '--one-bg-color-1': 'var(--one-color-gray-200)',
  '--one-bg-color-2': 'var(--one-color-gray-100)',
  '--one-bg-color-3': '#404656',
  '--one-bg-color-4': '#F5F5F5',

  '--one-title-font-size-large': '24px',
  '--one-title-font-size-base': '20px',
  '--one-title-font-size-small': '18px',
  '--one-font-size-large': '16px',
  '--one-font-size-base': '14px',
  '--one-font-size-small': '12px',
  // 字体策略：macOS 优先苹方，Windows 优先微软雅黑，思源黑体作为兜底。
  '--one-font-family-macos':
    '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans SC", "Noto Sans SC", "Helvetica Neue", Arial, sans-serif',
  '--one-font-family-windows':
    '"Microsoft YaHei", "Source Han Sans SC", "PingFang SC", "Noto Sans SC", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  '--one-font-family-fallback':
    '"Source Han Sans SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
  '--one-font-family-base': 'var(--one-font-family-macos)',

  '--one-border-radius-base': '4px',
  '--one-border-radius-small': '2px',
  '--one-border-radius-large': '8px',
  '--one-border-radius-round': '20px',
  '--one-border-radius-circle': '100%',

  '--one-box-shadow-1': '0px 3px 6px 0px rgba(0, 0, 0, 0.12)',
  '--one-box-shadow-2': '0px 6px 16px 0px rgba(0, 0, 0, 0.08)',
  '--one-box-shadow-3': '0px 9px 28px 0px rgba(0, 0, 0, 0.05)',

  '--one-text-color-primary': 'var(--one-color-gray-700)',
  '--one-text-color-regular': 'var(--one-color-gray-600)',
  '--one-text-color-secondary': 'var(--one-color-gray-500)',
  '--one-text-color-placeholder': 'var(--one-color-gray-400)',
  '--one-text-color-disabled': 'var(--one-color-gray-400)',

  '--one-disabled-bg-color': 'var(--one-bg-color-1)',
  '--one-disabled-text-color': 'var(--one-text-color-placeholder)',
  '--one-disabled-border-color': '#D8D8D8',
  '--one-button-disabled-text-color': 'var(--one-text-color-regular)',
  '--one-button-disabled-bg-color': 'var(--one-bg-color-1)',
  '--one-button-disabled-border-color': '#DCDCDC',

  '--one-mask-color': 'rgba(51, 51, 51, 0.6)',
  '--one-mask-color-extra-light': 'rgba(0, 0, 0, 0.3)',

  '--one-overlay-color': 'rgba(29, 33, 41, 0.6)',
  '--one-overlay-color-light': 'rgba(0, 0, 0, 0.7)',
  '--one-overlay-color-lighter': 'rgba(0, 0, 0, 0.5)',
  '--one-overlay-color-1': 'rgba(64, 70, 86, 0.9)',

  '--one-table-header-bg': 'rgba(30, 38, 57, 0.03)',
  '--one-table-header-border-bottom-color': 'rgba(51, 51, 51, 0.0784)',
  '--one-transfer-panel-hover-bg-color': '#E8F3FF'
};

const PRESET_TOKENS: ThemePresetTokens = {
  themes: {
    blue: {
      primary: {
        light1: '#E7F1FC',
        light2: '#C3DDF9',
        light3: '#9FC9F6',
        light4: '#7BB5F3',
        light5: '#57A1EF',
        light6: '#338DEC',
        light7: '#0F79E9',
        light8: '#0B61E2',
        light9: '#0955DF'
      }
    },
    red: {
      primary: {
        light1: '#FCE5E7',
        light2: '#FACCD0',
        light3: '#F599A0',
        light4: '#F27F88',
        light5: '#EB3341',
        light6: '#E81929',
        light7: '#C40000',
        light8: '#D60817',
        light9: '#C5000F'
      }
    }
  },
  palette: {
    red: ['#FFE7DE', '#FCAA97', '#F77263', '#F03E3C', '#E60012', '#C50021', '#A5002A', '#85002E', '#6E0030'],
    blue: ['#E1F1FD', '#B3D4F4', '#85AFDE', '#5F88BD', '#315791', '#23437C', '#183168', '#0F2254', '#091745'],
    green: ['#DFFFE1', '#9AF6AA', '#65E687', '#3ECD72', '#0CAD57', '#089457', '#067C54', '#03644D', '#025348'],
    yellow: ['#FEF8E5', '#FDEFCB', '#F9E2AF', '#F3D399', '#EBBE78', '#CA9857', '#A9753C', '#885626', '#703F17'],
    gray: ['#F8F8F8', '#EEEEEE', '#CCCCCC', '#999999', '#666666', '#333333', '#112129', '#C9CDD4', '#1D2129']
  },
  feedback: {
    success: {
      light1: '#E8FFEA',
      light2: '#AFF0B5',
      light3: '#7BE188',
      light4: '#4CD263',
      light5: '#23C343',
      light6: '#00B42A',
      light7: '#009A29'
    },
    warning: {
      light1: '#FFF7E8',
      light2: '#FFE4BA',
      light3: '#FFCF8B',
      light4: '#FFB65D',
      light5: '#FF9A2E',
      light6: '#FF7D00',
      light7: '#D25F00'
    },
    error: {
      light1: '#FFECE8',
      light2: '#FDCDC5',
      light3: '#FBACA3',
      light4: '#F98981',
      light5: '#F76560',
      light6: '#F53F3F',
      light7: '#CB2634'
    },
    info: {
      light1: '#F4F4F5',
      light2: '#E9E9EB',
      light3: '#DEDFE0',
      light4: '#C8C9CC',
      light5: '#B1B3B8',
      light6: '#909399',
      light7: '#73767A'
    },
    // link 归类为反馈状态色的一部分，采用固定七阶，不随主题切换变化。
    link: {
      light1: '#E7F1FC',
      light2: '#C3DDF9',
      light3: '#9FC9F6',
      light4: '#7BB5F2',
      light5: '#5491EB',
      light6: '#0F79E9',
      light7: '#0B61E2'
    }
  }
};

const ONE_STATIC_TOKENS: OneTokenMap = {
  ...BASE_STATIC_TOKENS,
  ...buildPaletteTokensFromPreset(PRESET_TOKENS.palette)
};

function buildPaletteTokensFromPreset(palette: Record<PaletteKey, readonly string[]>): OneTokenMap {
  const tokens: OneTokenMap = {};
  const entries = Object.entries(palette) as Array<[PaletteKey, readonly string[]]>;

  for (const [paletteName, values] of entries) {
    values.forEach((value, index) => {
      const level = PALETTE_LEVELS[index];
      tokens[`--one-color-${paletteName}-${level}`] = value;
    });
  }

  return tokens;
}

function normalizeHexColor(raw: string): string {
  const value = raw.trim();
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const chars = value.slice(1).split('');
    return `#${chars.map(c => `${c}${c}`).join('').toUpperCase()}`;
  }
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    return value.toUpperCase();
  }
  throw new Error(`[theme] 非法颜色值: ${raw}`);
}

function flattenPrimaryTokens(scale: PrimaryScale): OneTokenMap {
  return {
    '--one-color-primary': scale.light7,
    '--one-color-primary-light-1': scale.light1,
    '--one-color-primary-light-2': scale.light2,
    '--one-color-primary-light-3': scale.light3,
    '--one-color-primary-light-4': scale.light4,
    '--one-color-primary-light-5': scale.light5,
    '--one-color-primary-light-6': scale.light6,
    '--one-color-primary-light-7': scale.light7,
    '--one-color-primary-light-8': scale.light8,
    '--one-color-primary-light-9': scale.light9
  };
}

function flattenFeedbackTokens(name: FeedbackKey, scale: FeedbackScale): OneTokenMap {
  return {
    [`--one-color-${name}`]: scale.light6,
    [`--one-color-${name}-light-1`]: scale.light1,
    [`--one-color-${name}-light-2`]: scale.light2,
    [`--one-color-${name}-light-3`]: scale.light3,
    [`--one-color-${name}-light-4`]: scale.light4,
    [`--one-color-${name}-light-5`]: scale.light5,
    [`--one-color-${name}-light-6`]: scale.light6,
    [`--one-color-${name}-light-7`]: scale.light7
  };
}

function buildFeedbackTokensFromPreset(feedback: Record<FeedbackKey, FeedbackScale>): OneTokenMap {
  const tokens: OneTokenMap = {};
  const entries = Object.entries(feedback) as Array<[FeedbackKey, FeedbackScale]>;
  for (const [name, scale] of entries) {
    Object.assign(tokens, flattenFeedbackTokens(name, scale));
  }
  return tokens;
}

export function resolveThemePresetKey(raw: string | undefined): ThemePresetKey | null {
  if (raw === 'blue' || raw === 'red') return raw;
  return null;
}

function normalizePrimaryScale(scale: PrimaryScale): PrimaryScale {
  return {
    light1: normalizeHexColor(scale.light1),
    light2: normalizeHexColor(scale.light2),
    light3: normalizeHexColor(scale.light3),
    light4: normalizeHexColor(scale.light4),
    light5: normalizeHexColor(scale.light5),
    light6: normalizeHexColor(scale.light6),
    light7: normalizeHexColor(scale.light7),
    light8: normalizeHexColor(scale.light8),
    light9: normalizeHexColor(scale.light9)
  };
}

function toUpperHex(value: string): string {
  return normalizeHexColor(value);
}

export function buildPrimaryScale(customPrimary: string): PrimaryScale {
  const base = normalizeHexColor(customPrimary);
  const white = '#FFFFFF';
  const black = '#000000';

  return {
    light1: toUpperHex(mix(base, white, 0.9)),
    light2: toUpperHex(mix(base, white, 0.78)),
    light3: toUpperHex(mix(base, white, 0.66)),
    light4: toUpperHex(mix(base, white, 0.52)),
    light5: toUpperHex(mix(base, white, 0.36)),
    light6: toUpperHex(mix(base, white, 0.2)),
    light7: base,
    light8: toUpperHex(mix(base, black, 0.1)),
    light9: toUpperHex(mix(base, black, 0.2))
  };
}

export function buildOneTokens(params: {
  presetKey?: ThemePresetKey;
  customPrimary?: string | null;
  primaryScale?: PrimaryScale | null;
}): OneTokenMap {
  return {
    ...buildOneStaticTokens(),
    ...buildOneRuntimeTokens(params)
  };
}

export function buildOneStaticTokens(): OneTokenMap {
  return { ...ONE_STATIC_TOKENS };
}

export function buildOneRuntimeTokens(params: {
  presetKey?: ThemePresetKey;
  customPrimary?: string | null;
  primaryScale?: PrimaryScale | null;
}): OneTokenMap {
  const presetKey = params.presetKey ?? 'blue';
  const preset = PRESET_TOKENS.themes[presetKey] ?? PRESET_TOKENS.themes.blue;
  const primary = params.customPrimary
    ? buildPrimaryScale(params.customPrimary)
    : params.primaryScale
      ? normalizePrimaryScale(params.primaryScale)
      : preset.primary;

  const feedback = buildFeedbackTokensFromPreset(PRESET_TOKENS.feedback);

  return {
    ...flattenPrimaryTokens(primary),
    ...feedback,
    '--one-color-focus': 'var(--one-color-primary)'
  };
}
