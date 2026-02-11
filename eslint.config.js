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
  }
  ,
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
    // 作为脚手架，降低模板噪音（格式类规则交给 Prettier）
    rules: {
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off'
    }
  }
];
