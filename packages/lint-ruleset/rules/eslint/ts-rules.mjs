import { getPlatformRuleNames, toWarnRulesWithDefaultOptions } from './platform-rule-source.mjs';

export const tsPlatformRuleNames = getPlatformRuleNames({
  langName: 'TypeScript',
  includePrefixes: ['@typescript-eslint/']
});

const tsPlatformRules = toWarnRulesWithDefaultOptions(tsPlatformRuleNames);
const tsNoiseOffRules = {
  // 迁移阶段噪声规则收敛：先关闭低信噪比的风格/约束类 warning。
  '@typescript-eslint/member-ordering': 'off',
  '@typescript-eslint/no-use-before-define': 'off',
  '@typescript-eslint/unified-signatures': 'off',
  '@typescript-eslint/naming-convention': 'off',
  '@typescript-eslint/consistent-type-assertions': 'off',
  '@typescript-eslint/init-declarations': 'off',
  '@typescript-eslint/max-params': 'off',
  '@typescript-eslint/explicit-member-accessibility': 'off',
  '@typescript-eslint/prefer-destructuring': 'off',
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/no-non-null-assertion': 'off',
  '@typescript-eslint/no-base-to-string': 'off',
  '@typescript-eslint/require-await': 'off',
  '@typescript-eslint/no-dynamic-delete': 'off'
};

export const tsRules = {
  ...tsPlatformRules,

  // antfu + 团队约束：补齐“仅规则名”场景的参数模板，避免依赖隐式默认值
  '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }],
  '@typescript-eslint/ban-ts-comment': [
    'warn',
    {
      'ts-check': false,
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': true,
      'ts-nocheck': true,
      minimumDescriptionLength: 5
    }
  ],
  // Vue + TS 业务层默认依赖类型推断，强制显式返回类型会制造大量低收益噪声。
  '@typescript-eslint/explicit-function-return-type': 'off',
  // 当前阶段先使用 core no-magic-numbers，避免与 TS 同名规则重复报错。
  '@typescript-eslint/no-magic-numbers': 'off',
  // app 层参数可变是常态，readonly 参数约束更适合 library 场景。
  '@typescript-eslint/prefer-readonly-parameter-types': 'off',
  '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
  '@typescript-eslint/consistent-indexed-object-style': ['warn', 'record'],
  '@typescript-eslint/consistent-generic-constructors': ['warn', 'constructor'],
  '@typescript-eslint/consistent-type-assertions': [
    'warn',
    {
      assertionStyle: 'as',
      objectLiteralTypeAssertions: 'never'
    }
  ],
  '@typescript-eslint/class-literal-property-style': ['warn', 'fields'],
  '@typescript-eslint/method-signature-style': ['warn', 'property'],
  '@typescript-eslint/no-empty-function': ['warn', { allow: ['arrowFunctions'] }],
  '@typescript-eslint/no-use-before-define': [
    'warn',
    {
      functions: false,
      classes: true,
      variables: true,
      enums: true,
      typedefs: true,
      ignoreTypeReferences: true
    }
  ],
  '@typescript-eslint/no-restricted-imports': ['warn', {}],

  // TS 常用高价值规则保持阻断
  '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }
  ],

  ...tsNoiseOffRules
};
