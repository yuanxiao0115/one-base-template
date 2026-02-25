import type { ThemeDefinition, ThemeSemanticColors } from '../../stores/theme';

const FIXED_THEME_SEMANTIC: Required<ThemeSemanticColors> = {
  success: '#00B42A',
  warning: '#FF7D00',
  error: '#F53F3F',
  info: '#909399'
};

function withFixedSemantic(theme: Omit<ThemeDefinition, 'semantic'>): ThemeDefinition {
  return {
    ...theme,
    semantic: { ...FIXED_THEME_SEMANTIC }
  };
}

export const ONE_BUILTIN_THEMES: Record<'blue' | 'red', ThemeDefinition> = {
  blue: withFixedSemantic({
    name: '移动蓝',
    primary: '#0F79E9',
    tokenPresetKey: 'blue'
  }),
  red: withFixedSemantic({
    name: '党建红',
    primary: '#C40000',
    tokenPresetKey: 'red'
  })
};
