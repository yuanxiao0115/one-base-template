import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { applyOneTheme } from '../theme/one/apply-theme';
import { readFromStorages, removeByPrefixes, safeSetToStorage } from '../utils/storage';

const THEME_KEY = 'ob_theme';
const THEME_STATE_VERSION = 1;

export type ThemeMode = 'preset' | 'custom';

export interface ThemeSemanticColors {
  success?: string;
  warning?: string;
  error?: string;
  info?: string;
}

export interface ThemePrimaryScale {
  light1: string;
  light2: string;
  light3: string;
  light4: string;
  light5: string;
  light6: string;
  light7: string;
  light8: string;
  light9: string;
}

export interface ThemeDefinition {
  /**
   * 主题展示名（用于切换器 UI 展示）。
   */
  name?: string;
  primary: string;
  /**
   * 语义状态色扩展位。
   * 注意：在 One 默认主题应用器中，反馈状态色（success/warning/error/info/link）固定，不消费该字段。
   */
  semantic?: ThemeSemanticColors;
  tokenPresetKey?: string;
  primaryScale?: ThemePrimaryScale;
}

export interface ThemeApplyPayload {
  mode: ThemeMode;
  presetKey: string;
  customPrimary: string | null;
  primary: string;
  semantic: Required<ThemeSemanticColors>;
  theme: ThemeDefinition;
  themes: Record<string, ThemeDefinition>;
  storageKey: string;
}

export interface ThemeOptions {
  defaultTheme: string;
  themes: Record<string, ThemeDefinition>;
  allowCustomPrimary?: boolean;
  storageNamespace?: string;
  onThemeApplied?: (payload: ThemeApplyPayload) => void;
}

type StoredThemeState = {
  version: number;
  mode: ThemeMode;
  presetKey: string;
  customPrimary: string | null;
};

const DEFAULT_SEMANTIC: Required<ThemeSemanticColors> = {
  success: '#00B42A',
  warning: '#FF7D00',
  error: '#F53F3F',
  info: '#909399'
};

function normalizeHexColor(raw: string): string | null {
  const value = raw.trim();
  const short = /^#[0-9a-fA-F]{3}$/.exec(value);
  if (short) {
    const chars = value.slice(1).split('');
    return `#${chars.map(c => `${c}${c}`).join('').toUpperCase()}`;
  }

  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    return value.toUpperCase();
  }

  return null;
}

function normalizeOptionalHexColor(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  return normalizeHexColor(raw);
}

function resolveThemeStorageKey(storageNamespace?: string): string {
  const namespace = storageNamespace?.trim();
  if (!namespace) return THEME_KEY;
  return `${namespace}:${THEME_KEY}`;
}

function readStoredThemeState(storageKey: string): StoredThemeState | null {
  const raw = readFromStorages(storageKey, ['local', 'session']);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;

    const data = parsed as Partial<StoredThemeState>;
    const mode = data.mode === 'custom' ? 'custom' : data.mode === 'preset' ? 'preset' : null;
    const presetKey = typeof data.presetKey === 'string' ? data.presetKey : null;
    const customPrimary = normalizeOptionalHexColor(data.customPrimary);

    if (!mode || !presetKey) return null;

    return {
      version: typeof data.version === 'number' ? data.version : 0,
      mode,
      presetKey,
      customPrimary
    };
  } catch {
    return null;
  }
}

function writeStoredThemeState(storageKey: string, state: StoredThemeState) {
  safeSetToStorage(storageKey, JSON.stringify(state), {
    primary: 'local',
    fallback: 'session',
    onPrimaryQuotaExceeded: () => {
      // 菜单缓存可重新拉取，优先清理避免主题切换失败
      removeByPrefixes(['ob_menu_tree:', 'ob_menu_tree', 'ob_menu_path_index'], 'local');
    }
  });
}

function resolveSemantic(theme: ThemeDefinition): Required<ThemeSemanticColors> {
  return {
    success: normalizeOptionalHexColor(theme.semantic?.success) ?? DEFAULT_SEMANTIC.success,
    warning: normalizeOptionalHexColor(theme.semantic?.warning) ?? DEFAULT_SEMANTIC.warning,
    error: normalizeOptionalHexColor(theme.semantic?.error) ?? DEFAULT_SEMANTIC.error,
    info: normalizeOptionalHexColor(theme.semantic?.info) ?? DEFAULT_SEMANTIC.info
  };
}

function pickInitialThemeKey(themes: Record<string, ThemeDefinition>, fallback: string): string {
  if (themes[fallback]) return fallback;

  const keys = Object.keys(themes);
  const first = keys[0];
  if (first) return first;

  throw new Error('[theme] themes 不能为空');
}

export const useThemeStore = defineStore('ob-theme', () => {
  const themes = ref<ThemeOptions['themes']>({});
  const themeKey = ref<string>('');
  const themeMode = ref<ThemeMode>('preset');
  const customPrimary = ref<string | null>(null);
  const allowCustomPrimary = ref(true);
  const storageKey = ref<string>(THEME_KEY);
  const lastPersistedState = ref<string>('');

  const onThemeApplied = ref<ThemeOptions['onThemeApplied']>();

  const currentTheme = computed(() => themes.value[themeKey.value]);
  const currentSemantic = computed(() => resolveSemantic(currentTheme.value ?? { primary: '#409EFF' }));
  const currentPrimary = computed(() => {
    if (themeMode.value === 'custom' && customPrimary.value) return customPrimary.value;
    return normalizeOptionalHexColor(currentTheme.value?.primary) ?? '#409EFF';
  });

  function applyCurrentTheme() {
    const theme = currentTheme.value;
    if (!theme) {
      throw new Error(`[theme] 未定义主题: ${themeKey.value}`);
    }

    const presetPrimary = normalizeOptionalHexColor(theme.primary);
    if (!presetPrimary) {
      throw new Error(`[theme] 主题主色非法: ${theme.primary}`);
    }

    const primary = themeMode.value === 'custom' && customPrimary.value ? customPrimary.value : presetPrimary;
    const semantic = resolveSemantic(theme);

    onThemeApplied.value?.({
      mode: themeMode.value,
      presetKey: themeKey.value,
      customPrimary: customPrimary.value,
      primary,
      semantic,
      theme,
      themes: themes.value,
      storageKey: storageKey.value
    });
  }

  function persistCurrentTheme() {
    const nextState: StoredThemeState = {
      version: THEME_STATE_VERSION,
      mode: themeMode.value,
      presetKey: themeKey.value,
      customPrimary: customPrimary.value
    };
    const serialized = JSON.stringify(nextState);
    if (serialized === lastPersistedState.value) return;

    writeStoredThemeState(storageKey.value, nextState);
    lastPersistedState.value = serialized;
  }

  function syncTheme() {
    applyCurrentTheme();
    persistCurrentTheme();
  }

  function init(options: ThemeOptions) {
    themes.value = options.themes;
    allowCustomPrimary.value = options.allowCustomPrimary ?? true;
    storageKey.value = resolveThemeStorageKey(options.storageNamespace);
    onThemeApplied.value = options.onThemeApplied ?? applyOneTheme;

    const fallbackPreset = pickInitialThemeKey(options.themes, options.defaultTheme);
    const stored = readStoredThemeState(storageKey.value);

    themeKey.value = stored?.presetKey && themes.value[stored.presetKey] ? stored.presetKey : fallbackPreset;

    const storedCustom = normalizeOptionalHexColor(stored?.customPrimary);
    const canUseCustom = allowCustomPrimary.value && stored?.mode === 'custom' && Boolean(storedCustom);

    themeMode.value = canUseCustom ? 'custom' : 'preset';
    customPrimary.value = canUseCustom ? storedCustom : null;

    const currentState: StoredThemeState = {
      version: THEME_STATE_VERSION,
      mode: themeMode.value,
      presetKey: themeKey.value,
      customPrimary: customPrimary.value
    };
    const matchesStored = stored
      ? stored.version === THEME_STATE_VERSION &&
        stored.mode === currentState.mode &&
        stored.presetKey === currentState.presetKey &&
        stored.customPrimary === currentState.customPrimary
      : false;
    lastPersistedState.value = matchesStored ? JSON.stringify(currentState) : '';

    syncTheme();
  }

  function setTheme(key: string) {
    if (!themes.value[key]) {
      // 脚手架阶段直接报错，避免静默失败
      throw new Error(`[theme] 未定义主题: ${key}`);
    }

    themeKey.value = key;
    syncTheme();
  }

  function setThemeMode(mode: ThemeMode) {
    if (mode === 'custom' && !allowCustomPrimary.value) {
      throw new Error('[theme] 当前配置不允许自定义主题色');
    }

    if (mode === 'custom' && !customPrimary.value) {
      const presetPrimary = normalizeOptionalHexColor(currentTheme.value?.primary);
      if (!presetPrimary) {
        throw new Error('[theme] 当前预设主题主色无效，无法进入自定义模式');
      }
      customPrimary.value = presetPrimary;
    }

    themeMode.value = mode;
    syncTheme();
  }

  function setCustomPrimary(color: string) {
    if (!allowCustomPrimary.value) {
      throw new Error('[theme] 当前配置不允许自定义主题色');
    }

    const normalized = normalizeHexColor(color);
    if (!normalized) {
      throw new Error(`[theme] 非法颜色值: ${color}`);
    }

    customPrimary.value = normalized;
    themeMode.value = 'custom';
    syncTheme();
  }

  function resetCustomPrimary() {
    customPrimary.value = null;
    themeMode.value = 'preset';
    syncTheme();
  }

  return {
    themes,
    themeKey,
    themeMode,
    customPrimary,
    allowCustomPrimary,
    currentTheme,
    currentPrimary,
    currentSemantic,
    init,
    setTheme,
    setThemeMode,
    setCustomPrimary,
    resetCustomPrimary
  };
});
