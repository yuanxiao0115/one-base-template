import { getPlatformRuleNames, toWarnRules } from './platform-rule-source.mjs';

export const vuePlatformRuleNames = getPlatformRuleNames({
  langName: 'Vue',
  includePrefixes: ['vue/']
});

const vuePlatformRules = toWarnRules(vuePlatformRuleNames);

export const vueRules = {
  ...vuePlatformRules,

  // Vue 关键规则保持阻断
  'vue/no-mutating-props': 'error',
  'vue/require-v-for-key': 'error',
  'vue/no-use-v-if-with-v-for': ['error', { allowUsingIterationVar: false }],

  // 风险较高但需要渐进治理，先告警
  'vue/no-v-html': 'warn'
};
