import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import tsParser from '@typescript-eslint/parser';
import sonarjs from 'eslint-plugin-sonarjs';
import security from 'eslint-plugin-security';
import importPlugin from 'eslint-plugin-import';
import n from 'eslint-plugin-n';
import globals from 'globals';
import { jsRules } from './rules/eslint/js-rules.mjs';
import { tsRules } from './rules/eslint/ts-rules.mjs';
import { vueRules } from './rules/eslint/vue-rules.mjs';

/**
 * 无服务端模式：通过 ESLint + 插件尽可能覆盖 Sonar JS/TS 规则。
 * 说明：这不是 1:1 等价替代，复杂数据流/安全语义规则仍建议保留 Sonar 扫描平台。
 */
export default [
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/.vite/**',
      '**/.output/**',
      '**/coverage/**',
      '**/__tests__/**',
      '**/*.{test,spec}.{js,jsx,ts,tsx,vue,mjs,cjs}'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  sonarjs.configs.recommended,
  {
    files: ['**/*.{js,ts,tsx,vue}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2024
      }
    },
    plugins: {
      import: importPlugin,
      n,
      security
    },
    rules: {
      // 平台抓取规则按语言拆分维护：JS / TS / Vue
      ...jsRules,
      ...tsRules,
      ...vueRules,

      // 迁移阶段关闭高噪声 Sonar warning，避免与业务门禁目标冲突。
      'sonarjs/no-nested-conditional': 'off',
      'sonarjs/void-use': 'off',
      'sonarjs/pseudo-random': 'off',
      'sonarjs/concise-regex': 'off',
      'sonarjs/regex-complexity': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/use-type-alias': 'off',
      'sonarjs/no-identical-functions': 'off',
      'sonarjs/no-invariant-returns': 'off',
      'sonarjs/duplicates-in-character-class': 'off',
      'sonarjs/no-redundant-jump': 'off',
      'sonarjs/slow-regex': 'off',
      // eslint-disable-next-line sonarjs/no-hardcoded-passwords
      'sonarjs/no-hardcoded-passwords': 'off',
      'sonarjs/redundant-type-aliases': 'off',

      // Node/包生态健壮性
      'n/no-deprecated-api': 'error',

      // 安全补充（近似 Sonar security 子集）
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-child-process': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-eval-with-expression': 'error'
    }
  },
  {
    // mjs/cjs 常用于脚本或配置，避免把格式化类约束强行施加到工具脚本。
    files: ['**/*.{mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2024
      }
    },
    plugins: {
      import: importPlugin,
      security
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/slow-regex': 'off',
      'import/named': 'warn',
      'import/export': 'warn',
      'import/no-named-as-default': 'warn',
      'import/no-named-as-default-member': 'warn',
      'import/no-extraneous-dependencies': 'warn',
      'import/no-mutable-exports': 'warn',
      'import/no-amd': 'warn',
      'import/order': 'warn',
      'import/no-absolute-path': 'warn',
      'import/no-dynamic-require': 'warn',
      'import/no-webpack-loader-syntax': 'warn',
      'import/no-named-default': 'warn',
      'import/no-self-import': 'warn',
      'import/no-cycle': 'warn',
      'import/no-useless-path-segments': 'warn',
      'import/no-import-module-exports': 'warn',
      'import/no-relative-packages': 'warn',
      // 当前团队代码中动态键访问场景较多，误报远高于收益；统一关闭并在台账保留后续回收入口。
      'security/detect-object-injection': 'off',
      'array-callback-return': 'warn',
      'default-case-last': 'warn',
      'default-param-last': 'warn',
      'grouped-accessor-pairs': 'warn',
      'max-classes-per-file': 'warn',
      'no-caller': 'warn',
      'no-constructor-return': 'warn',
      'no-extra-label': 'warn',
      'no-extra-semi': 'warn',
      'no-lonely-if': 'warn',
      'no-new': 'warn',
      'no-promise-executor-return': 'warn',
      'no-restricted-exports': 'warn',
      'no-return-assign': 'warn',
      'no-return-await': 'warn',
      'no-sequences': 'warn',
      'no-unreachable-loop': 'warn',
      'no-useless-computed-key': 'warn',
      'no-useless-rename': 'warn',
      'no-void': 'warn',
      'prefer-exponentiation-operator': 'warn',
      'prefer-object-spread': 'warn',
      'prefer-regex-literals': 'warn',
      'lines-around-directive': 'warn'
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue']
      }
    }
  }
];
