import { getPlatformRuleNames, toWarnRulesWithDefaultOptions } from './platform-rule-source.mjs';

export const jsPlatformRuleNames = getPlatformRuleNames({
  langName: 'JavaScript',
  includePrefixes: ['(core)', 'import/']
});

const jsPlatformRules = toWarnRulesWithDefaultOptions(jsPlatformRuleNames);
const JS_OBJECT_OPTION_TEMPLATE_RULE_NAMES = [
  'arrow-spacing',
  'comma-dangle',
  'func-name-matching',
  'function-paren-newline',
  'generator-star-spacing',
  'import/named',
  'import/no-absolute-path',
  'import/no-cycle',
  'import/no-duplicates',
  'import/no-dynamic-require',
  'import/no-extraneous-dependencies',
  'import/no-import-module-exports',
  'import/no-relative-packages',
  'import/no-useless-path-segments',
  'line-comment-position',
  'max-classes-per-file',
  'max-depth',
  'max-lines',
  'max-lines-per-function',
  'max-nested-callbacks',
  'max-params',
  'max-statements',
  'newline-per-chained-call',
  'no-confusing-arrow',
  'no-duplicate-imports',
  'no-eval',
  'no-magic-numbers',
  'no-mixed-operators',
  'no-multi-spaces',
  'no-restricted-exports',
  'no-restricted-imports',
  'no-tabs',
  'no-unused-vars',
  'object-property-newline',
  'prefer-const',
  'space-before-function-paren',
  'switch-colon-spacing',
  'yield-star-spacing'
];
const jsObjectOptionTemplateRules = Object.fromEntries(
  JS_OBJECT_OPTION_TEMPLATE_RULE_NAMES.map((ruleName) => [ruleName, ['warn', {}]])
);
const jsNoiseOffRules = {
  // 迁移阶段噪声规则收敛：优先保障“error 阻断”的有效性，关闭低信噪比 warning。
  indent: 'off',
  'max-statements': 'off',
  'max-lines-per-function': 'off',
  'max-len': 'off',
  'id-length': 'off',
  'no-magic-numbers': 'off',
  'no-unused-vars': 'off',
  'no-undefined': 'off',
  'sort-imports': 'off',
  'no-void': 'off',
  'line-comment-position': 'off',
  'no-inline-comments': 'off',
  'require-unicode-regexp': 'off',
  'require-atomic-updates': 'off',
  'import/no-extraneous-dependencies': 'off',
  'no-eq-null': 'off',
  'no-use-before-define': 'off',
  'no-nested-ternary': 'off',
  'no-console': 'off',
  radix: 'off',
  'no-plusplus': 'off',
  'no-continue': 'off',
  'no-empty-function': 'off',
  'init-declarations': 'off',
  'max-lines': 'off',
  'max-params': 'off',
  'no-duplicate-imports': 'off',
  'import/no-duplicates': 'off',
  'import/newline-after-import': 'off',
  'no-useless-return': 'off',
  'no-else-return': 'off',
  'no-mixed-operators': 'off',
  'consistent-return': 'off',
  complexity: 'off',
  'prefer-destructuring': 'off',
  'prefer-named-capture-group': 'off',
  'no-negated-condition': 'off',
  'import/no-named-as-default': 'off',
  'no-underscore-dangle': 'off',
  'prefer-promise-reject-errors': 'off',
  'no-await-in-loop': 'off',
  'no-shadow': 'off',
  'no-param-reassign': 'off'
};

/**
 * JS 规则默认从平台抓取清单映射为 warn，再对关键规则升阶到 error。
 * 这样可以保证“平台规则全量可追踪”，并对高风险规则保持阻断。
 */
export const jsRules = {
  ...jsPlatformRules,
  // 对“对象参数型”规则统一显式补齐空对象模板，避免仅级别配置带来的参数歧义。
  ...jsObjectOptionTemplateRules,

  // antfu + 团队约束：补齐 JS 高频规则参数模板，避免仅靠隐式默认值。
  'space-before-blocks': ['warn', 'always'],
  'space-infix-ops': ['warn', { int32Hint: false }],
  'space-unary-ops': ['warn', { words: true, nonwords: false }],
  'keyword-spacing': ['warn', { before: true, after: true }],
  'arrow-parens': ['warn', 'always', { requireForBlockBody: false }],
  'block-spacing': ['warn', 'always'],
  'brace-style': ['warn', '1tbs', { allowSingleLine: false }],
  'computed-property-spacing': ['warn', 'never', { enforceForClassMembers: true }],
  'dot-location': ['warn', 'property'],
  'eol-last': ['warn', 'always'],
  'function-call-argument-newline': ['warn', 'consistent'],
  'implicit-arrow-linebreak': ['warn', 'beside'],
  'key-spacing': ['warn', { beforeColon: false, afterColon: true, mode: 'strict' }],
  'comma-spacing': ['warn', { before: false, after: true }],
  'semi-spacing': ['warn', { before: false, after: true }],
  'linebreak-style': ['warn', 'unix'],
  'new-parens': ['warn', 'always'],
  'one-var-declaration-per-line': ['warn', 'always'],
  'rest-spread-spacing': ['warn', 'never'],
  'semi-style': ['warn', 'last'],
  'template-curly-spacing': ['warn', 'never'],
  'template-tag-spacing': ['warn', 'never'],
  'space-in-parens': ['warn', 'never'],
  'array-bracket-spacing': [
    'warn',
    'never',
    {
      singleValue: false,
      objectsInArrays: false,
      arraysInArrays: false
    }
  ],
  'object-curly-spacing': [
    'warn',
    'always',
    {
      arraysInObjects: true,
      objectsInObjects: true
    }
  ],
  'no-trailing-spaces': ['warn', { skipBlankLines: false, ignoreComments: false }],
  camelcase: [
    'warn',
    {
      properties: 'never',
      ignoreDestructuring: false,
      ignoreImports: false,
      ignoreGlobals: false,
      allow: []
    }
  ],
  'id-match': [
    'warn',
    '^[A-Za-z_$][A-Za-z0-9_$]*$',
    {
      properties: false,
      classFields: false,
      onlyDeclarations: false,
      ignoreDestructuring: false
    }
  ],
  'new-cap': [
    'warn',
    {
      newIsCap: true,
      capIsNew: false,
      properties: true
    }
  ],
  'lines-around-comment': [
    'warn',
    {
      beforeBlockComment: true,
      afterBlockComment: false,
      beforeLineComment: false,
      afterLineComment: false,
      allowBlockStart: true,
      allowBlockEnd: true,
      allowObjectStart: true,
      allowObjectEnd: true,
      allowArrayStart: true,
      allowArrayEnd: true
    }
  ],
  'no-use-before-define': [
    'warn',
    {
      functions: false,
      classes: true,
      variables: true,
      allowNamedExports: false
    }
  ],
  radix: ['warn', 'always'],
  'no-extend-native': ['warn', { exceptions: [] }],
  // 限制名单需由团队提供真实清单；占位值会造成“看似启用、实则无效”的误导。
  'id-denylist': 'off',
  'lines-around-directive': ['warn', 'always'],
  'lines-between-class-members': ['warn', 'always', { exceptAfterSingleLine: false }],
  'logical-assignment-operators': ['warn', 'always', { enforceForIfStatements: false }],
  'no-mixed-spaces-and-tabs': ['warn', false],
  'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1, maxBOF: 0 }],
  'no-param-reassign': ['warn', { props: false }],
  'no-restricted-globals': 'off',
  'no-restricted-properties': 'off',
  'no-restricted-syntax': 'off',
  'nonblock-statement-body-position': ['warn', 'beside'],
  'object-curly-newline': ['warn', { multiline: true, consistent: true }],
  'padded-blocks': ['warn', 'never'],
  'prefer-destructuring': [
    'warn',
    { array: true, object: true },
    { enforceForRenamedProperties: false }
  ],
  'import/first': ['error', 'disable-absolute-first'],
  'func-call-spacing': ['warn', 'never'],
  'init-declarations': ['warn', 'always'],
  indent: ['warn', 2, { SwitchCase: 1 }],
  'multiline-comment-style': ['warn', 'starred-block'],
  'capitalized-comments': [
    'warn',
    'never',
    { ignoreInlineComments: true, ignoreConsecutiveComments: true }
  ],
  'no-eval': ['warn', { allowIndirect: false }],
  'no-duplicate-imports': ['error', { includeExports: false, allowSeparateTypeImports: false }],
  'prefer-const': ['error', { destructuring: 'any', ignoreReadBeforeAssign: false }],
  'dot-notation': ['warn', { allowKeywords: true }],
  // 对齐 @antfu/eslint-config 的“可读性优先”取向：
  // 对象键排序在业务代码中改动面大且收益有限，先关闭以降低历史噪声。
  'sort-keys': 'off',

  // JSxxx 规范字典对应的核心规则补齐（默认 warn，按需可升阶）
  'max-statements-per-line': ['warn', { max: 1 }],
  'max-len': ['warn', { code: 120, ignoreUrls: true, ignoreTemplateLiterals: true }],
  'operator-linebreak': ['warn', 'before'],
  'comma-style': ['warn', 'last'],
  semi: ['warn', 'always'],
  'wrap-iife': ['warn', 'outside'],
  'spaced-comment': ['warn', 'always'],
  'one-var': ['warn', 'never'],
  quotes: ['warn', 'single', { avoidEscape: true }],
  'no-new-object': 'warn',
  'quote-props': ['warn', 'as-needed'],
  'no-array-constructor': 'warn',
  'no-this-before-super': 'warn',
  // antfu 工程实践：函数风格优先可读性，不强推“只能表达式”。
  'func-style': ['warn', 'declaration', { allowArrowFunctions: true }],
  // 与 import/order 存在职责重叠，迁移期先关闭避免循环修复。
  'sort-imports': 'off',
  // legacy 代码里存在大量“故意 async”的门面函数，require-await 当前阶段收益低于噪声。
  'require-await': 'off',
  // 三元表达式在前端模板与状态映射场景普遍可读，先关闭禁用约束。
  'no-ternary': 'off',
  // legacy 迁移代码常量分布广，当前阶段先关闭并由 error 规则兜底。
  'no-magic-numbers': 'off',

  // 核心质量门禁（阻断）
  'no-var': 'error',
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  curly: ['error', 'all'],
  'object-shorthand': ['error', 'always'],

  ...jsNoiseOffRules
};
