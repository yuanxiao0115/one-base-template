/**
 * 无服务端模式：通过 Stylelint 近似覆盖 Sonar CSS + Csslint 规则。
 * 说明：
 * 1) Stylelint 17 下已清理废弃/失效规则；
 * 2) 先保证规则可执行，再按项目逐步收紧。
 */
const CUSTOM_CSSLINT_SEVERITY = {
  css036: 'warning',
  css037: 'error',
  css041: 'error',
  css046: 'warning'
};
const DIRECT_BOOLEAN_GAP_STYLELINT_RULES = [
  'annotation-no-unknown',
  'at-rule-no-vendor-prefix',
  'custom-property-no-missing-var-function',
  'declaration-block-no-duplicate-custom-properties',
  'declaration-block-no-redundant-longhand-properties',
  'declaration-no-important',
  'function-no-unknown',
  'function-url-no-scheme-relative',
  'keyframe-block-no-duplicate-selectors',
  'media-feature-name-no-vendor-prefix',
  'named-grid-areas-no-invalid',
  'no-invalid-position-at-import-rule',
  'no-irregular-whitespace',
  'no-unknown-animations',
  'property-no-vendor-prefix',
  'selector-no-vendor-prefix',
  'shorthand-property-no-redundant-values',
  'value-no-vendor-prefix'
];
const DIRECT_OPTION_GAP_STYLELINT_RULES = {
  'alpha-value-notation': 'number',
  'at-rule-empty-line-before': 'always',
  'color-function-notation': 'modern',
  'color-hex-alpha': 'never',
  'color-named': 'never',
  'comment-empty-line-before': 'always',
  'comment-pattern': '.*',
  'comment-whitespace-inside': 'always',
  'custom-media-pattern': '^[a-z][a-z0-9-]+$',
  'custom-property-empty-line-before': 'always',
  'custom-property-pattern': '^[a-z][a-z0-9-]+$',
  'declaration-block-single-line-max-declarations': 1,
  'declaration-empty-line-before': 'never',
  'font-family-name-quotes': 'always-where-recommended',
  'font-weight-notation': 'numeric',
  'function-name-case': 'lower',
  'hue-degree-notation': 'angle',
  'import-notation': 'string',
  'keyframe-selector-notation': 'percentage-unless-within-keyword-only-block',
  'keyframes-name-pattern': '^[a-z][a-z0-9-]+$',
  'max-nesting-depth': 4,
  'media-feature-range-notation': 'context',
  'number-max-precision': 4,
  'rule-empty-line-before': 'always-multi-line',
  'selector-id-pattern': '^[a-z][a-z0-9-]+$',
  'selector-max-attribute': 3,
  'selector-max-class': 4,
  'selector-max-combinators': 4,
  'selector-max-compound-selectors': 4,
  'selector-max-id': 1,
  'selector-max-pseudo-class': 4,
  // 历史样式（含 Element Plus 覆盖）存在较多复合选择器，先放宽到 1,3,0 做渐进治理。
  'selector-max-specificity': '1,3,0',
  'selector-max-type': 3,
  'selector-max-universal': 1,
  'selector-nested-pattern': '^[a-z][a-z0-9-]+$',
  'selector-not-notation': 'complex',
  'selector-pseudo-element-colon-notation': 'double',
  'selector-type-case': 'lower',
  'time-min-milliseconds': 100,
  'value-keyword-case': 'lower'
};
const REMAINING_OPTION_TEMPLATE_GAP_STYLELINT_RULES = {
  // 这 30 条来自 gap-catalog 的 needsOptions 清单：
  // 先给“团队默认模板参数”（warning），后续再按业务域逐步收紧。
  'at-rule-allowed-list': [/^-?[a-z][a-z0-9-]*$/],
  'at-rule-disallowed-list': ['debug'],
  'at-rule-property-required-list': {
    'font-face': ['font-family', 'src']
  },
  'comment-word-disallowed-list': ['TODO', 'FIXME', 'XXX'],
  'declaration-property-max-values': {
    '/^(margin|padding|border-radius)$/': 4,
    'box-shadow': 4
  },
  'declaration-property-unit-allowed-list': {
    '/^(font-size|line-height|letter-spacing)$/': ['px', 'rem', 'em', '%'],
    '/^(margin|padding|top|right|bottom|left|gap|width|height|min-width|min-height|max-width|max-height)$/':
      ['px', 'rem', 'em', '%', 'vw', 'vh', 'vmin', 'vmax']
  },
  'declaration-property-unit-disallowed-list': {
    '/^(font-size|line-height|letter-spacing)$/': ['pt'],
    '/^(width|height|min-width|min-height|max-width|max-height)$/': ['cm', 'mm', 'in', 'pc', 'pt']
  },
  'declaration-property-value-allowed-list': {
    display: ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'none'],
    position: ['static', 'relative', 'absolute', 'fixed', 'sticky']
  },
  'declaration-property-value-disallowed-list': {
    outline: ['none']
  },
  // Vue + CSS 生态中存在 translateY/scale3d 等大小写混合函数名，使用不区分大小写的模板避免误报。
  'function-allowed-list': [/^-?[a-z][a-z0-9-]*$/i],
  'function-url-scheme-allowed-list': ['https', 'data'],
  'function-url-scheme-disallowed-list': ['http'],
  'media-feature-name-allowed-list': [/^[a-z-]+$/],
  'media-feature-name-disallowed-list': ['device-width', 'device-height', 'device-aspect-ratio'],
  'media-feature-name-value-allowed-list': {
    orientation: ['portrait', 'landscape'],
    'prefers-color-scheme': ['light', 'dark'],
    'prefers-reduced-motion': ['reduce', 'no-preference']
  },
  'property-allowed-list': [/^[a-z-]+$/],
  'property-disallowed-list': ['behavior'],
  'rule-selector-property-disallowed-list': {
    '/^:root$/': ['z-index']
  },
  'selector-attribute-name-disallowed-list': ['style'],
  'selector-attribute-operator-allowed-list': ['=', '~=', '|=', '^=', '$=', '*='],
  // 与 allowed-list 保持一致：不再额外配置冲突型 disallowed-list（此前 /=/ 会覆盖全部常见操作符）。
  'selector-attribute-operator-disallowed-list': [],
  'selector-combinator-allowed-list': [' ', '>', '+', '~', '||'],
  'selector-combinator-disallowed-list': ['>>>', '/deep/'],
  'selector-disallowed-list': [/^$/],
  'selector-pseudo-class-allowed-list': [/^[a-z-]+$/],
  // Vue SFC scoped 样式需要 :global()，禁止它会与 vue-best-practices 冲突。
  'selector-pseudo-class-disallowed-list': ['host-context'],
  'selector-pseudo-element-allowed-list': [/^[a-z-]+$/],
  'selector-pseudo-element-disallowed-list': [/^$/],
  'unit-allowed-list': [
    '%',
    'ch',
    'cqb',
    'cqh',
    'cqi',
    'cqmax',
    'cqmin',
    'cqw',
    'deg',
    'dppx',
    'dvh',
    'dvw',
    'em',
    'ex',
    'fr',
    'Hz',
    'kHz',
    'lh',
    'lvh',
    'lvw',
    'ms',
    'px',
    'rad',
    'rem',
    'rlh',
    's',
    'svh',
    'svw',
    'turn',
    'vb',
    'vh',
    'vi',
    'vmax',
    'vmin',
    'vw'
  ],
  'unit-disallowed-list': ['cm', 'in', 'mm', 'pc', 'pt']
};
const STYLISTIC_MIGRATED_GAP_STYLELINT_RULES = {
  '@stylistic/at-rule-name-case': 'lower',
  '@stylistic/at-rule-name-newline-after': 'always-multi-line',
  '@stylistic/at-rule-name-space-after': 'always-single-line',
  '@stylistic/at-rule-semicolon-newline-after': 'always',
  '@stylistic/at-rule-semicolon-space-before': 'never',
  '@stylistic/block-closing-brace-empty-line-before': 'never',
  '@stylistic/block-closing-brace-newline-after': 'always-multi-line',
  '@stylistic/block-closing-brace-newline-before': 'always-multi-line',
  '@stylistic/block-closing-brace-space-after': 'always-single-line',
  '@stylistic/block-closing-brace-space-before': 'always-single-line',
  '@stylistic/block-opening-brace-newline-after': 'always-multi-line',
  '@stylistic/block-opening-brace-newline-before': 'never-single-line',
  '@stylistic/block-opening-brace-space-after': 'always-single-line',
  '@stylistic/color-hex-case': 'lower',
  '@stylistic/declaration-bang-space-after': 'never',
  '@stylistic/declaration-bang-space-before': 'always',
  // 多行声明块中分号前不强制换行，避免将常规 `prop: value;` 风格误报为噪声
  '@stylistic/declaration-block-semicolon-newline-before': 'never-multi-line',
  '@stylistic/declaration-block-semicolon-space-after': 'always-single-line',
  '@stylistic/declaration-block-semicolon-space-before': 'never',
  '@stylistic/declaration-colon-newline-after': 'always-multi-line',
  '@stylistic/function-comma-newline-after': 'always-multi-line',
  '@stylistic/function-comma-newline-before': 'never-multi-line',
  '@stylistic/function-comma-space-after': 'always-single-line',
  '@stylistic/function-comma-space-before': 'never',
  '@stylistic/function-max-empty-lines': 0,
  '@stylistic/function-parentheses-newline-inside': 'always-multi-line',
  '@stylistic/function-parentheses-space-inside': 'never-single-line',
  '@stylistic/function-whitespace-after': 'always',
  '@stylistic/indentation': 2,
  '@stylistic/linebreaks': 'unix',
  '@stylistic/max-empty-lines': 1,
  '@stylistic/media-feature-colon-space-after': 'always',
  '@stylistic/media-feature-colon-space-before': 'never',
  '@stylistic/media-feature-name-case': 'lower',
  '@stylistic/media-feature-parentheses-space-inside': 'never',
  '@stylistic/media-feature-range-operator-space-after': 'always',
  '@stylistic/media-feature-range-operator-space-before': 'always',
  '@stylistic/media-query-list-comma-newline-before': 'never-multi-line',
  '@stylistic/media-query-list-comma-space-after': 'always-single-line',
  '@stylistic/media-query-list-comma-space-before': 'never',
  '@stylistic/no-empty-first-line': true,
  '@stylistic/no-eol-whitespace': true,
  '@stylistic/no-extra-semicolons': true,
  '@stylistic/no-missing-end-of-source-newline': true,
  '@stylistic/number-no-trailing-zeros': true,
  '@stylistic/property-case': 'lower',
  '@stylistic/selector-attribute-brackets-space-inside': 'never',
  '@stylistic/selector-attribute-operator-space-after': 'never',
  '@stylistic/selector-attribute-operator-space-before': 'never',
  '@stylistic/selector-descendant-combinator-no-non-space': true,
  '@stylistic/selector-list-comma-newline-before': 'never-multi-line',
  '@stylistic/selector-list-comma-space-after': 'always-single-line',
  '@stylistic/selector-list-comma-space-before': 'never',
  '@stylistic/selector-max-empty-lines': 0,
  '@stylistic/selector-pseudo-class-case': 'lower',
  '@stylistic/selector-pseudo-class-parentheses-space-inside': 'never',
  '@stylistic/selector-pseudo-element-case': 'lower',
  '@stylistic/unicode-bom': 'never',
  '@stylistic/unit-case': 'lower',
  '@stylistic/value-list-comma-newline-after': 'always-multi-line',
  '@stylistic/value-list-comma-newline-before': 'never-multi-line',
  '@stylistic/value-list-comma-space-before': 'never',
  '@stylistic/value-list-max-empty-lines': 0
};
const DIRECT_BOOLEAN_GAP_STYLELINT_WARN_RULES = Object.fromEntries(
  DIRECT_BOOLEAN_GAP_STYLELINT_RULES.map((ruleName) => [ruleName, [true, { severity: 'warning' }]])
);
const DIRECT_OPTION_GAP_STYLELINT_WARN_RULES = Object.fromEntries(
  Object.entries(DIRECT_OPTION_GAP_STYLELINT_RULES).map(([ruleName, primaryOption]) => [
    ruleName,
    [primaryOption, { severity: 'warning' }]
  ])
);
const REMAINING_OPTION_TEMPLATE_GAP_STYLELINT_WARN_RULES = Object.fromEntries(
  Object.entries(REMAINING_OPTION_TEMPLATE_GAP_STYLELINT_RULES).map(([ruleName, primaryOption]) => [
    ruleName,
    [primaryOption, { severity: 'warning' }]
  ])
);
const STYLISTIC_MIGRATED_GAP_STYLELINT_WARN_RULES = Object.fromEntries(
  Object.entries(STYLISTIC_MIGRATED_GAP_STYLELINT_RULES).map(([ruleName, primaryOption]) => [
    ruleName,
    [primaryOption, { severity: 'warning' }]
  ])
);

module.exports = {
  // 参考 stylelint 官方与 recommended-vue 的最佳实践：
  // - 以 standard-scss 作为通用规范基线；
  // - recommended-vue/scss 必须放在 extends 最后，确保 Vue SFC 解析正常。
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recommended-vue/scss'],
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
    // Sonar(CSS) -> Stylelint 直接替换（保留稳定可执行子集）
    'at-rule-no-unknown': [true, { ignoreAtRules: ['source'] }],
    'scss/at-rule-no-unknown': [true, { ignoreAtRules: ['source'] }],
    'block-no-empty': true,
    'color-no-invalid-hex': true,
    // 采用 modern 语法治理路径：先告警可见，避免历史 rgba() 一次性阻断。
    'color-function-alias-notation': ['without-alpha', { severity: 'warning' }],
    'comment-no-empty': true,
    'declaration-block-no-duplicate-properties': true,
    'declaration-block-no-shorthand-property-overrides': true,
    'font-family-no-duplicate-names': true,
    'font-family-no-missing-generic-family-keyword': true,
    'function-calc-no-unspaced-operator': true,
    'function-linear-gradient-no-nonstandard-direction': true,
    'keyframe-declaration-no-important': true,
    'media-feature-name-no-unknown': true,
    'no-duplicate-at-import-rules': true,
    'no-duplicate-selectors': true,
    'no-empty-source': true,
    'no-invalid-double-slash-comments': true,
    'property-no-unknown': true,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'global']
      }
    ],
    'selector-pseudo-element-no-unknown': true,
    'selector-type-no-unknown': true,
    'string-no-newline': true,
    'unit-no-unknown': true,

    // Sonar(CSS) 部分替换（FunctionCalcNoInvalid）
    'declaration-property-value-no-unknown': true,

    // Csslint 直接替换（兼容 Stylelint 17）
    '@stylistic/max-line-length': 120,
    'selector-attribute-quotes': 'always',
    'selector-no-qualifying-type': [true, { ignore: ['attribute'] }],
    '@stylistic/string-quotes': 'double',
    '@stylistic/number-leading-zero': 'never',
    'function-url-quotes': 'never',
    'length-zero-no-unit': true,
    'color-hex-length': 'short',
    'function-disallowed-list': ['expression'],

    // Csslint 部分替换（需要 @stylistic/stylelint-plugin）
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

    // 平台爬取规则缺口：可直接启用或可迁移到 @stylistic 的规则先统一以 warning 启动。
    ...DIRECT_BOOLEAN_GAP_STYLELINT_WARN_RULES,
    ...DIRECT_OPTION_GAP_STYLELINT_WARN_RULES,
    ...REMAINING_OPTION_TEMPLATE_GAP_STYLELINT_WARN_RULES,
    ...STYLISTIC_MIGRATED_GAP_STYLELINT_WARN_RULES,

    // admin 首轮接入优先保证可执行；高噪声规则先关闭，后续按模块分批治理
    'color-no-hex': null,
    'no-descending-specificity': null,
    'selector-class-pattern': null,
    'property-no-deprecated': null
  }
};
