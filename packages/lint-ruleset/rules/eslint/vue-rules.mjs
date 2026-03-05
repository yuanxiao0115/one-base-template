import { getPlatformRuleNames, toWarnRulesWithDefaultOptions } from './platform-rule-source.mjs';

export const vuePlatformRuleNames = getPlatformRuleNames({
  langName: 'Vue',
  includePrefixes: ['vue/']
});

const vuePlatformRules = toWarnRulesWithDefaultOptions(vuePlatformRuleNames);
const VUE_OBJECT_OPTION_TEMPLATE_RULE_NAMES = [
  'vue/array-bracket-newline',
  'vue/array-element-newline',
  'vue/arrow-spacing',
  'vue/attributes-order',
  'vue/block-order',
  'vue/block-tag-newline',
  'vue/comma-dangle',
  'vue/comma-spacing',
  'vue/comment-directive',
  'vue/define-macros-order',
  'vue/enforce-style-attribute',
  'vue/first-attribute-linebreak',
  'vue/html-button-has-type',
  'vue/html-closing-bracket-newline',
  'vue/html-closing-bracket-spacing',
  'vue/html-comment-content-newline',
  'vue/html-self-closing',
  'vue/key-spacing',
  'vue/keyword-spacing',
  'vue/match-component-file-name',
  'vue/max-attributes-per-line',
  'vue/max-len',
  'vue/max-lines-per-block',
  'vue/multi-word-component-names',
  'vue/multiline-html-element-content-newline',
  'vue/new-line-between-multi-line-property',
  'vue/no-async-in-computed-properties',
  'vue/no-bare-strings-in-template',
  'vue/no-deprecated-model-definition',
  'vue/no-deprecated-router-link-tag-prop',
  'vue/no-deprecated-slot-attribute',
  'vue/no-dupe-keys',
  'vue/no-duplicate-attr-inheritance',
  'vue/no-duplicate-attributes',
  'vue/no-irregular-whitespace',
  'vue/no-lone-template',
  'vue/no-multi-spaces',
  'vue/no-multiple-template-root',
  'vue/no-mutating-props',
  'vue/no-parsing-error',
  'vue/no-potential-component-option-typo',
  'vue/no-required-prop-with-default',
  'vue/no-reserved-component-names',
  'vue/no-reserved-keys',
  'vue/no-static-inline-styles',
  'vue/no-template-shadow',
  'vue/no-undef-components',
  'vue/no-undef-properties',
  'vue/no-unsupported-features',
  'vue/no-unused-components',
  'vue/no-unused-properties',
  'vue/no-unused-vars',
  'vue/no-useless-mustaches',
  'vue/no-useless-v-bind',
  'vue/no-v-html',
  'vue/no-v-text-v-html-on-component',
  'vue/object-property-newline',
  'vue/order-in-components',
  'vue/padding-lines-in-component-definition',
  'vue/require-direct-export',
  'vue/require-explicit-emits',
  'vue/require-macro-variable-name',
  'vue/require-prop-comment',
  'vue/require-toggle-inside-transition',
  'vue/return-in-computed-property',
  'vue/singleline-html-element-content-newline',
  'vue/space-infix-ops',
  'vue/space-unary-ops',
  'vue/valid-v-for',
  'vue/valid-v-on',
  'vue/valid-v-slot'
];
const VUE_ARRAY_OPTION_TEMPLATE_RULE_NAMES = [
  'vue/padding-line-between-tags'
];
const vueObjectOptionTemplateRules = Object.fromEntries(
  VUE_OBJECT_OPTION_TEMPLATE_RULE_NAMES.map((ruleName) => [ruleName, ['warn', {}]])
);
const vueArrayOptionTemplateRules = Object.fromEntries(
  VUE_ARRAY_OPTION_TEMPLATE_RULE_NAMES.map((ruleName) => [ruleName, ['warn', []]])
);
const vueNoiseOffRules = {
  // 迁移阶段噪声规则收敛。
  'vue/script-indent': 'off',
  'vue/v-on-handler-style': 'off',
  'vue/no-static-inline-styles': 'off',
  'vue/require-emit-validator': 'off',
  'vue/require-typed-object-prop': 'off',
  'vue/require-explicit-slots': 'off',
  'vue/no-setup-props-reactivity-loss': 'off',
  'vue/no-multiple-template-root': 'off',
  'vue/require-direct-export': 'off',
  'vue/prefer-true-attribute-shorthand': 'off',
  'vue/no-ref-object-reactivity-loss': 'off',
  'vue/no-boolean-default': 'off',
  'vue/no-unused-properties': 'off',
  'vue/require-typed-ref': 'off',
  'vue/no-v-text': 'off',
  'vue/no-template-target-blank': 'off',
  'vue/no-duplicate-attr-inheritance': 'off',
  'vue/require-expose': 'off'
};

export const vueRules = {
  ...vuePlatformRules,
  // 仅补齐参数模板，不改变语义强度；用于收敛“仅规则名”缺口。
  ...vueObjectOptionTemplateRules,
  ...vueArrayOptionTemplateRules,

  // Vue3 最佳实践在新模块按规范执行；迁移模块先关闭高噪声强约束。
  'vue/component-api-style': 'off',
  'vue/define-props-declaration': 'off',
  'vue/define-emits-declaration': 'off',
  'vue/component-definition-name-casing': ['warn', 'PascalCase'],
  'vue/component-name-in-template-casing': ['warn', 'PascalCase', { registeredComponentsOnly: true }],
  'vue/custom-event-name-casing': 'off',
  'vue/attribute-hyphenation': ['warn', 'always'],
  'vue/prop-name-casing': ['warn', 'camelCase'],
  'vue/v-bind-style': ['warn', 'shorthand', { sameNameShorthand: 'always' }],
  'vue/v-on-style': ['warn', 'shorthand'],
  'vue/v-slot-style': [
    'warn',
    {
      atComponent: 'shorthand',
      default: 'shorthand',
      named: 'shorthand'
    }
  ],
  'vue/no-boolean-default': ['warn', 'default-false'],
  'vue/no-reserved-props': ['warn', { vueVersion: 3 }],
  'vue/no-template-target-blank': 'off',
  'vue/block-lang': ['warn', { script: { lang: 'ts' } }],
  'vue/array-bracket-spacing': [
    'warn',
    'never',
    {
      singleValue: false,
      objectsInArrays: false,
      arraysInArrays: false
    }
  ],
  'vue/block-spacing': ['warn', 'always'],
  'vue/brace-style': ['warn', '1tbs', { allowSingleLine: false }],
  'vue/comma-style': ['warn', 'last'],
  'vue/component-options-name-casing': ['warn', 'PascalCase'],
  'vue/dot-location': ['warn', 'property'],
  'vue/eqeqeq': ['warn', 'always', { null: 'ignore' }],
  'vue/func-call-spacing': ['warn', 'never'],
  'vue/html-quotes': ['warn', 'double', { avoidEscape: false }],
  'vue/html-comment-content-spacing': ['warn', 'always', { exceptions: [] }],
  'vue/html-comment-indent': ['warn', 2],
  'vue/html-indent': [
    'warn',
    2,
    {
      attribute: 1,
      baseIndent: 1,
      closeBracket: 0,
      alignAttributesVertically: true,
      ignores: []
    }
  ],
  // Vue SFC 模板文本天然较长（按钮文案、描述文案、路径字符串），放宽长度并忽略文本内容。
  'vue/max-len': 'off',
  'vue/multiline-ternary': ['warn', 'always-multiline'],
  'vue/mustache-interpolation-spacing': ['warn', 'always'],
  'vue/next-tick-style': ['warn', 'promise'],
  'vue/no-child-content': ['warn', { additionalDirectives: ['v-__reserved__'] }],
  'vue/no-extra-parens': ['warn', 'all'],
  // 当前治理阶段不把 i18n 文案纳入 lint 门禁，关闭模板裸字符串检查。
  'vue/no-bare-strings-in-template': 'off',
  // 兼容 Vue 生态常见全局自动注册组件（Element Plus / 团队 Ob 前缀）。
  // 保留规则能力，但避免把已知全局组件误报为未定义。
  'vue/no-undef-components': [
    'warn',
    {
      ignorePatterns: ['^el-', '^ob-']
    }
  ],
  // 同 JS：限制名单没有真实团队输入前不应使用占位模板。
  'vue/no-restricted-block': 'off',
  'vue/no-restricted-call-after-await': 'off',
  'vue/no-restricted-class': 'off',
  'vue/no-restricted-component-names': 'off',
  'vue/no-restricted-component-options': 'off',
  'vue/no-restricted-custom-event': 'off',
  'vue/no-restricted-html-elements': 'off',
  'vue/no-restricted-props': 'off',
  'vue/no-restricted-static-attribute': 'off',
  'vue/no-restricted-syntax': 'off',
  'vue/no-restricted-v-bind': 'off',
  'vue/no-restricted-v-on': 'off',
  'vue/object-shorthand': ['warn', 'always'],
  // 组件 props 注释强制在业务项目中维护成本高，先关闭。
  'vue/require-prop-comment': 'off',
  'vue/object-curly-newline': ['warn', { multiline: true, consistent: true }],
  'vue/object-curly-spacing': [
    'warn',
    'always',
    {
      arraysInObjects: true,
      objectsInObjects: true
    }
  ],
  'vue/operator-linebreak': ['warn', 'before'],
  'vue/padding-line-between-blocks': ['warn', 'always'],
  'vue/prefer-true-attribute-shorthand': ['warn', 'always'],
  'vue/quote-props': ['warn', 'as-needed'],
  'vue/script-indent': ['warn', 2, { baseIndent: 0, switchCase: 1, ignores: [] }],
  // 与 JS 保持一致：关闭对象键强制排序，避免与业务语义顺序冲突。
  'vue/sort-keys': 'off',
  'vue/space-in-parens': ['warn', 'never'],
  'vue/template-curly-spacing': ['warn', 'never'],
  'vue/this-in-template': ['warn', 'never'],
  'vue/v-for-delimiter-style': ['warn', 'in'],
  'vue/v-on-event-hyphenation': ['warn', 'always', { autofix: false, ignore: [], ignoreTags: [] }],
  'vue/v-on-handler-style': ['warn', ['method', 'inline-function'], { ignoreIncludesComment: false }],

  // Vue 关键规则保持阻断
  'vue/no-mutating-props': ['error', { shallowOnly: false }],
  'vue/require-v-for-key': 'error',
  'vue/no-use-v-if-with-v-for': ['error', { allowUsingIterationVar: false }],

  // 风险较高但需要渐进治理，先告警
  'vue/no-v-html': ['warn', { ignorePattern: '^$' }],

  ...vueNoiseOffRules
};
