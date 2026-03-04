import { getPlatformRuleNames, toWarnRules } from './platform-rule-source.mjs';

export const tsPlatformRuleNames = getPlatformRuleNames({
  langName: 'TypeScript',
  includePrefixes: ['@typescript-eslint/']
});

const tsPlatformRules = toWarnRules(tsPlatformRuleNames);

export const tsRules = {
  ...tsPlatformRules,

  // TS 常用高价值规则保持阻断
  '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }
  ]
};
