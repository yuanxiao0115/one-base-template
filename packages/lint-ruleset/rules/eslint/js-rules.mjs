import { getPlatformRuleNames, toWarnRules } from './platform-rule-source.mjs';

export const jsPlatformRuleNames = getPlatformRuleNames({
  langName: 'JavaScript',
  includePrefixes: ['(core)', 'import/']
});

const jsPlatformRules = toWarnRules(jsPlatformRuleNames);

/**
 * JS 规则默认从平台抓取清单映射为 warn，再对关键规则升阶到 error。
 * 这样可以保证“平台规则全量可追踪”，并对高风险规则保持阻断。
 */
export const jsRules = {
  ...jsPlatformRules,

  // JSxxx 规范字典对应的核心规则补齐（默认 warn，按需可升阶）
  'space-before-blocks': 'warn',
  'space-infix-ops': 'warn',
  'space-unary-ops': 'warn',
  'keyword-spacing': 'warn',
  'key-spacing': 'warn',
  'comma-spacing': 'warn',
  'semi-spacing': 'warn',
  'space-in-parens': 'warn',
  'array-bracket-spacing': 'warn',
  'object-curly-spacing': 'warn',
  'no-trailing-spaces': 'warn',
  'one-statement-per-line': 'warn',
  'max-len': ['warn', { code: 120, ignoreUrls: true, ignoreTemplateLiterals: true }],
  'operator-linebreak': ['warn', 'before'],
  'comma-style': ['warn', 'last'],
  semi: ['warn', 'always'],
  'wrap-iife': ['warn', 'outside'],
  camelcase: 'warn',
  'id-match': 'warn',
  'new-cap': 'warn',
  'spaced-comment': ['warn', 'always'],
  'lines-around-comment': 'warn',
  'no-use-before-define': 'warn',
  'one-var': ['warn', 'never'],
  radix: 'warn',
  quotes: ['warn', 'single', { avoidEscape: true }],
  'no-new-object': 'warn',
  'quote-props': ['warn', 'as-needed'],
  'no-extend-native': 'warn',
  'no-array-constructor': 'warn',
  'no-this-before-super': 'warn',
  'no-eval': 'warn',

  // 核心质量门禁（阻断）
  'no-var': 'error',
  'prefer-const': 'error',
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  curly: ['error', 'all'],
  'no-duplicate-imports': 'error',
  'object-shorthand': ['error', 'always'],
  'no-else-return': ['error', { allowElseIf: false }],
  'no-useless-return': 'error',
  'import/first': 'error',
  'import/newline-after-import': ['error', { count: 1 }],
  'import/no-duplicates': 'error'
};
