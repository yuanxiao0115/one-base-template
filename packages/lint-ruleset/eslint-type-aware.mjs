import { getPlatformRuleNames, toWarnRules } from './rules/eslint/platform-rule-source.mjs';

/**
 * TypeScript type-aware 规则集合：
 * - 仅收敛平台抓取中 requiresTypeChecking 的规则
 * - 默认按 warning 输出，供业务项目按模块渐进启用
 */
export const tsTypeAwarePlatformRuleNames = getPlatformRuleNames({
  langName: 'TypeScript',
  includePrefixes: ['@typescript-eslint/'],
  includeTypeAware: true,
  typeAwareOnly: true
});

const tsTypeAwareBaseWarnRules = toWarnRules(tsTypeAwarePlatformRuleNames);

export const tsTypeAwareWarnRules = {
  ...tsTypeAwareBaseWarnRules,
  // app 层阶段性关闭：更适合库代码的不可变参数约束，当前噪声过高。
  '@typescript-eslint/prefer-readonly-parameter-types': 'off',

  // legacy 模块以 any/schema 动态数据为主，先关闭高噪声 typed warning。
  '@typescript-eslint/strict-boolean-expressions': 'off',
  '@typescript-eslint/no-unnecessary-condition': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/prefer-nullish-coalescing': 'off',
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/require-await': 'off',
  '@typescript-eslint/naming-convention': 'off',
  '@typescript-eslint/no-base-to-string': 'off',
  '@typescript-eslint/prefer-destructuring': 'off',
  '@typescript-eslint/prefer-promise-reject-errors': 'off',
  '@typescript-eslint/sort-type-constituents': 'off',
  '@typescript-eslint/unbound-method': 'off',
  '@typescript-eslint/no-shadow': 'off'
};
