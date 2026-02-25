import type { ThemeApplyPayload } from '../../stores/theme';
import { applyRootVarsToStyleElement } from './style-host';
import {
  buildOneRuntimeTokens,
  buildOneStaticTokens,
  resolveThemePresetKey,
  type OneTokenMap,
  type ThemePresetKey
} from './theme-tokens';

const ONE_THEME_BASE_STYLE_ID = 'one-theme-base';
const ONE_THEME_RUNTIME_STYLE_ID = 'one-theme-runtime';

type ElementFeedbackType = 'success' | 'warning' | 'danger' | 'error' | 'info';
type OneFeedbackType = 'success' | 'warning' | 'error' | 'info';

function getToken(tokens: OneTokenMap, key: string): string {
  const value = tokens[key];
  if (!value) {
    throw new Error(`[theme] 缺少 token: ${key}`);
  }
  return value;
}

function buildElementPrimaryBridgeTokens(tokens: OneTokenMap): OneTokenMap {
  return {
    '--el-color-primary': getToken(tokens, '--one-color-primary'),
    '--el-color-primary-light-3': getToken(tokens, '--one-color-primary-light-5'),
    '--el-color-primary-light-5': getToken(tokens, '--one-color-primary-light-4'),
    '--el-color-primary-light-7': getToken(tokens, '--one-color-primary-light-3'),
    '--el-color-primary-light-8': getToken(tokens, '--one-color-primary-light-2'),
    '--el-color-primary-light-9': getToken(tokens, '--one-color-primary-light-1'),
    '--el-color-primary-dark-2': getToken(tokens, '--one-color-primary-light-8')
  };
}

function buildElementFeedbackScaleTokens(
  tokens: OneTokenMap,
  elementType: ElementFeedbackType,
  oneType: OneFeedbackType
): OneTokenMap {
  return {
    [`--el-color-${elementType}`]: getToken(tokens, `--one-color-${oneType}`),
    [`--el-color-${elementType}-light-3`]: getToken(tokens, `--one-color-${oneType}-light-5`),
    [`--el-color-${elementType}-light-5`]: getToken(tokens, `--one-color-${oneType}-light-4`),
    [`--el-color-${elementType}-light-7`]: getToken(tokens, `--one-color-${oneType}-light-3`),
    [`--el-color-${elementType}-light-8`]: getToken(tokens, `--one-color-${oneType}-light-2`),
    [`--el-color-${elementType}-light-9`]: getToken(tokens, `--one-color-${oneType}-light-1`),
    [`--el-color-${elementType}-dark-2`]: getToken(tokens, `--one-color-${oneType}-light-7`)
  };
}

function buildElementFeedbackBridgeTokens(tokens: OneTokenMap): OneTokenMap {
  return {
    ...buildElementFeedbackScaleTokens(tokens, 'success', 'success'),
    ...buildElementFeedbackScaleTokens(tokens, 'warning', 'warning'),
    ...buildElementFeedbackScaleTokens(tokens, 'info', 'info'),
    ...buildElementFeedbackScaleTokens(tokens, 'danger', 'error'),
    ...buildElementFeedbackScaleTokens(tokens, 'error', 'error')
  };
}

function buildElementLinkBridgeTokens(tokens: OneTokenMap): OneTokenMap {
  return {
    '--el-link-text-color': getToken(tokens, '--one-color-link'),
    '--el-link-hover-text-color': getToken(tokens, '--one-color-link-light-5'),
    '--el-link-disabled-text-color': getToken(tokens, '--one-color-link-light-2')
  };
}

function buildElementTextBorderFillBridgeTokens(tokens: OneTokenMap): OneTokenMap {
  return {
    // Element Plus 全局字体统一走 one token，便于按系统切换字体栈。
    '--el-font-family': 'var(--one-font-family-base)',
    '--el-text-color-primary': getToken(tokens, '--one-text-color-primary'),
    '--el-text-color-regular': getToken(tokens, '--one-text-color-regular'),
    '--el-text-color-secondary': getToken(tokens, '--one-text-color-secondary'),
    '--el-text-color-placeholder': getToken(tokens, '--one-text-color-placeholder'),
    '--el-text-color-disabled': getToken(tokens, '--one-text-color-disabled'),

    '--el-border-color': getToken(tokens, '--one-border-color'),
    '--el-border-color-light': getToken(tokens, '--one-border-color-light'),
    '--el-border-color-lighter': getToken(tokens, '--one-border-color-lighter'),
    '--el-border-color-extra-light': getToken(tokens, '--one-border-color-extra-light'),
    '--el-border-color-dark': getToken(tokens, '--one-border-color-dark'),
    '--el-border-color-darker': getToken(tokens, '--one-border-color-darker'),

    '--el-fill-color': getToken(tokens, '--one-fill-color'),
    '--el-fill-color-light': getToken(tokens, '--one-fill-color-light'),
    '--el-fill-color-lighter': getToken(tokens, '--one-fill-color-lighter'),
    '--el-fill-color-extra-light': getToken(tokens, '--one-fill-color-extra-light'),
    '--el-fill-color-dark': getToken(tokens, '--one-fill-color-dark'),
    '--el-fill-color-darker': getToken(tokens, '--one-fill-color-darker'),
    '--el-fill-color-blank': getToken(tokens, '--one-fill-color-blank'),

    '--el-bg-color': getToken(tokens, '--one-bg-color'),
    '--el-bg-color-page': getToken(tokens, '--one-bg-color-page'),
    '--el-bg-color-overlay': getToken(tokens, '--one-bg-color-overlay'),
    '--el-mask-color': getToken(tokens, '--one-mask-color')
  };
}

function buildElementBridgeTokens(tokens: OneTokenMap): OneTokenMap {
  return {
    ...buildElementPrimaryBridgeTokens(tokens),
    ...buildElementFeedbackBridgeTokens(tokens),
    ...buildElementLinkBridgeTokens(tokens),
    ...buildElementTextBorderFillBridgeTokens(tokens)
  };
}

function resolveOnePresetKey(payload: ThemeApplyPayload): ThemePresetKey {
  const rawPresetKey = payload.theme.tokenPresetKey ?? payload.presetKey;
  return resolveThemePresetKey(rawPresetKey) ?? 'blue';
}

function resolveOnePrimaryScaleOverride(payload: ThemeApplyPayload) {
  if (payload.mode === 'custom') return null;
  return payload.theme.primaryScale ?? null;
}

function resolveOnePrimaryOverride(payload: ThemeApplyPayload): string | null {
  if (payload.mode === 'custom') {
    return payload.primary;
  }

  if (payload.theme.primaryScale) {
    return null;
  }

  // 预设模式下，若未命中内置 tokenPresetKey，则按主题 primary 动态计算九阶。
  if (!resolveThemePresetKey(payload.theme.tokenPresetKey)) {
    return payload.primary;
  }

  return null;
}

export function applyOneTheme(payload: ThemeApplyPayload) {
  if (typeof document === 'undefined') return;

  const presetKey = resolveOnePresetKey(payload);
  const primaryScale = resolveOnePrimaryScaleOverride(payload);
  const customPrimary = resolveOnePrimaryOverride(payload);

  const staticTokens = buildOneStaticTokens();
  const runtimeTokens = buildOneRuntimeTokens({
    presetKey,
    customPrimary,
    primaryScale
  });
  const resolvedOneTokens = {
    ...staticTokens,
    ...runtimeTokens
  };
  const elementBridgeTokens = buildElementBridgeTokens(resolvedOneTokens);

  applyRootVarsToStyleElement(ONE_THEME_BASE_STYLE_ID, staticTokens);
  applyRootVarsToStyleElement(ONE_THEME_RUNTIME_STYLE_ID, {
    ...runtimeTokens,
    ...elementBridgeTokens
  });
}
