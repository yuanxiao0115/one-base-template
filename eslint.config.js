import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.turbo/**', '**/.vite/**']
  },
  {
    files: ['**/*.{ts,tsx,vue}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      // 统一为单引号，避免引号风格混乱
      quotes: ['error', 'single', { avoidEscape: true }],
      // TypeScript 已能识别未定义变量；该规则在 TS/Vue SFC 下容易产生误报
      'no-undef': 'off',
      // 作为脚手架，允许单词组件名（方便 Demo）
      'vue/multi-word-component-names': 'off'
    }
  },
  {
    // 让 ESLint 正确解析 <script setup lang="ts"> 的类型语法
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
  },
  {
    // 类型声明文件允许更宽松（避免脚手架被 d.ts 细节卡住）
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off'
    }
  },
  {
    // 约束：环境变量解析必须集中到 apps/admin/src/infra/env.ts，避免散落 import.meta.env 产生不一致
    files: ['apps/admin/src/**/*.{ts,tsx,vue}'],
    ignores: ['apps/admin/src/infra/env.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[object.type='MetaProperty'][object.meta.name='import'][object.property.name='meta'][property.name='env']",
          message: "禁止直接使用 import.meta.env，请通过 '@/infra/env' 的 appEnv 读取环境变量。"
        }
      ]
    }
  },
  {
    // 约束：全局插件/组件只能在 bootstrap 层安装，避免业务模块到处 app.use() 造成启动链路不可控
    files: ['apps/admin/src/**/*.{ts,tsx,vue}'],
    ignores: ['apps/admin/src/infra/env.ts', 'apps/admin/src/bootstrap/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'vue',
              importNames: ['createApp'],
              message: '禁止在业务模块创建 Vue App，请在 apps/admin/src/bootstrap 中集中处理启动逻辑。'
            },
            {
              name: 'pinia',
              importNames: ['createPinia', 'setActivePinia'],
              message: '禁止在业务模块初始化 Pinia，请在 apps/admin/src/bootstrap 中集中安装。'
            },
            {
              name: 'vue-router',
              importNames: ['createRouter', 'createWebHistory'],
              message: '禁止在业务模块创建 Router，请在 apps/admin/src/bootstrap/router.ts 中创建。'
            }
          ]
        }
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.type='MemberExpression'][callee.object.name='app'][callee.property.name=/^(use|component|directive|mixin|provide)$/]",
          message: '禁止在业务模块调用 app.use/app.component/... 安装全局能力，请到 apps/admin/src/bootstrap 中统一安装。'
        }
      ]
    }
  },
  {
    // 作为脚手架，降低模板噪音（格式类规则交给 Prettier）
    rules: {
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off'
    }
  }
];
