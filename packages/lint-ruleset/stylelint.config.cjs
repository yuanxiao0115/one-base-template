/**
 * 无服务端模式：通过 Stylelint 近似覆盖 Sonar CSS + Csslint 规则。
 * 说明：CSSLint 中部分历史规范无 1:1 规则，需保留人工评审或自定义插件。
 */
const STYLELINT_CSS244_CORE_FULL_COVERAGE_RULES = [
  'at-rule-allowed-list',
  'at-rule-disallowed-list',
  'at-rule-property-required-list',
  'color-hex-alpha',
  'color-no-hex',
  'comment-pattern',
  'comment-word-disallowed-list',
  'declaration-no-important',
  'declaration-property-max-values',
  'declaration-property-unit-allowed-list',
  'declaration-property-unit-disallowed-list',
  'declaration-property-value-allowed-list',
  'declaration-property-value-disallowed-list',
  'font-weight-notation',
  'function-allowed-list',
  'function-url-no-scheme-relative',
  'function-url-scheme-allowed-list',
  'function-url-scheme-disallowed-list',
  'max-nesting-depth',
  'media-feature-name-allowed-list',
  'media-feature-name-disallowed-list',
  'media-feature-name-value-allowed-list',
  'no-unknown-animations',
  'property-allowed-list',
  'property-disallowed-list',
  'rule-selector-property-disallowed-list',
  'selector-attribute-name-disallowed-list',
  'selector-attribute-operator-allowed-list',
  'selector-attribute-operator-disallowed-list',
  'selector-combinator-allowed-list',
  'selector-combinator-disallowed-list',
  'selector-disallowed-list',
  'selector-max-attribute',
  'selector-max-class',
  'selector-max-combinators',
  'selector-max-compound-selectors',
  'selector-max-id',
  'selector-max-pseudo-class',
  'selector-max-specificity',
  'selector-max-type',
  'selector-max-universal',
  'selector-nested-pattern',
  'selector-pseudo-class-allowed-list',
  'selector-pseudo-class-disallowed-list',
  'selector-pseudo-element-allowed-list',
  'selector-pseudo-element-disallowed-list',
  'time-min-milliseconds',
  'unit-allowed-list',
  'unit-disallowed-list'
];

const STYLELINT_CSS244_STYLISTIC_FULL_COVERAGE_RULES = [
  'at-rule-name-case',
  'at-rule-name-newline-after',
  'at-rule-name-space-after',
  'at-rule-semicolon-newline-after',
  'at-rule-semicolon-space-before',
  'block-closing-brace-empty-line-before',
  'block-closing-brace-newline-after',
  'block-closing-brace-newline-before',
  'block-closing-brace-space-after',
  'block-closing-brace-space-before',
  'block-opening-brace-newline-after',
  'block-opening-brace-newline-before',
  'block-opening-brace-space-after',
  'color-hex-case',
  'declaration-bang-space-after',
  'declaration-bang-space-before',
  'declaration-block-semicolon-newline-before',
  'declaration-block-semicolon-space-after',
  'declaration-block-semicolon-space-before',
  'declaration-colon-newline-after',
  'function-comma-newline-after',
  'function-comma-newline-before',
  'function-comma-space-after',
  'function-comma-space-before',
  'function-max-empty-lines',
  'function-parentheses-newline-inside',
  'function-parentheses-space-inside',
  'function-whitespace-after',
  'indentation',
  'linebreaks',
  'max-empty-lines',
  'media-feature-colon-space-after',
  'media-feature-colon-space-before',
  'media-feature-name-case',
  'media-feature-parentheses-space-inside',
  'media-feature-range-operator-space-after',
  'media-feature-range-operator-space-before',
  'media-query-list-comma-newline-before',
  'media-query-list-comma-space-after',
  'media-query-list-comma-space-before',
  'no-empty-first-line',
  'no-eol-whitespace',
  'no-missing-end-of-source-newline',
  'number-no-trailing-zeros',
  'property-case',
  'selector-attribute-brackets-space-inside',
  'selector-attribute-operator-space-after',
  'selector-attribute-operator-space-before',
  'selector-descendant-combinator-no-non-space',
  'selector-list-comma-newline-before',
  'selector-list-comma-space-after',
  'selector-list-comma-space-before',
  'selector-max-empty-lines',
  'selector-pseudo-class-case',
  'selector-pseudo-class-parentheses-space-inside',
  'selector-pseudo-element-case',
  'unicode-bom',
  'unit-case',
  'value-list-comma-newline-after',
  'value-list-comma-newline-before',
  'value-list-comma-space-before',
  'value-list-max-empty-lines'
];

const STYLELINT_CSS244_FULL_COVERAGE_RULES = {
  ...Object.fromEntries(STYLELINT_CSS244_CORE_FULL_COVERAGE_RULES.map((ruleName) => [ruleName, true])),
  ...Object.fromEntries(
    STYLELINT_CSS244_STYLISTIC_FULL_COVERAGE_RULES.map((ruleName) => [`@stylistic/${ruleName}`, true])
  )
};

const CUSTOM_CSSLINT_SEVERITY = {
  css036: 'warning',
  css037: 'error',
  css041: 'error',
  css046: 'warning'
};

module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-recommended-vue/scss'
  ],
  plugins: ['@stylistic/stylelint-plugin', './rules/stylelint/csslint-compat-rules.mjs'],
  ignoreFiles: [
    '**/dist/**',
    '**/build/**',
    '**/node_modules/**',
    '**/.turbo/**',
    '**/.vite/**',
    '**/.vitepress/cache/**',
    '**/coverage/**',
    '**/public/fonts/**',
    '**/assets/iconfont/**'
  ],
  rules: {
    // Sonar(CSS) -> Stylelint 直接替换（24/25）
    'at-rule-no-unknown': true,
    'block-no-empty': true,
    'color-no-invalid-hex': true,
    'comment-no-empty': true,
    'declaration-block-no-duplicate-properties': true,
    'declaration-block-no-shorthand-property-overrides': true,
    'font-family-no-duplicate-names': true,
    'font-family-no-missing-generic-family-keyword': true,
    'function-calc-no-unspaced-operator': true,
    'function-linear-gradient-no-nonstandard-direction': true,
    'keyframe-declaration-no-important': true,
    'media-feature-name-no-unknown': true,
    'no-descending-specificity': true,
    'no-duplicate-at-import-rules': true,
    'no-duplicate-selectors': true,
    'no-empty-source': true,
    'no-extra-semicolons': true,
    'no-invalid-double-slash-comments': true,
    'property-no-unknown': true,
    'selector-pseudo-class-no-unknown': true,
    'selector-pseudo-element-no-unknown': true,
    'selector-type-no-unknown': true,
    'string-no-newline': true,
    'unit-no-unknown': true,

    // Sonar(CSS) 部分替换（FunctionCalcNoInvalid）
    // 通过禁止未知属性值来近似替代，仍建议保留人工/平台复核。
    'declaration-property-value-no-unknown': true,

    // Csslint 直接替换（10/24）
    'max-line-length': 120,
    'selector-attribute-quotes': 'always',
    'selector-no-qualifying-type': [true, { ignore: ['attribute'] }],
    'string-quotes': 'double',
    'number-leading-zero': 'never',
    'function-url-quotes': 'never',
    'length-zero-no-unit': true,
    'color-hex-length': 'short',
    'color-named': 'never',
    'function-disallowed-list': ['expression'],

    // Csslint 部分替换（10/24，需要 @stylistic/stylelint-plugin）
    '@stylistic/block-opening-brace-space-before': 'always',
    '@stylistic/declaration-colon-space-before': 'never',
    '@stylistic/declaration-colon-space-after': 'always-single-line',
    '@stylistic/value-list-comma-space-after': 'always-single-line',
    '@stylistic/selector-list-comma-newline-after': 'always-multi-line',
    '@stylistic/selector-combinator-space-before': 'always',
    '@stylistic/selector-combinator-space-after': 'always',
    '@stylistic/declaration-block-semicolon-newline-after': 'always-multi-line',
    '@stylistic/declaration-block-trailing-semicolon': 'always',
    '@stylistic/media-query-list-comma-newline-after': 'always-multi-line',

    // Csslint 历史缺口补齐（4/24，自定义规则）
    'ob-csslint/css036-font-family-case-consistent': [
      true,
      { ignoreDynamicValues: true, severity: CUSTOM_CSSLINT_SEVERITY.css036 }
    ],
    'ob-csslint/css037-min-font-size': [
      true,
      {
        minPx: 12,
        rootFontSize: 16,
        ignoreZero: true,
        severity: CUSTOM_CSSLINT_SEVERITY.css037
      }
    ],
    'ob-csslint/css041-require-transition-property': [true, { severity: CUSTOM_CSSLINT_SEVERITY.css041 }],
    'ob-csslint/css046-vendor-prefix-order': [
      true,
      {
        requireUnprefixedFallback: false,
        severity: CUSTOM_CSSLINT_SEVERITY.css046
      }
    ],

    // CSS 244 全量覆盖补齐：
    // - 补齐 sourceTool=Stylelint 且 mappingStatus=none 的 111 条规则
    // - 先统一启用为 true，后续再按业务噪音逐条收紧阈值
    ...STYLELINT_CSS244_FULL_COVERAGE_RULES
  }
};
