import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tsTypeAwareWarnRules } from '@one-base-template/lint-ruleset/eslint-type-aware';

const ADMIN_ROOT = path.dirname(fileURLToPath(import.meta.url));
const TYPE_AWARE_LANGUAGE_OPTIONS = {
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: ADMIN_ROOT
  }
};
const TYPE_AWARE_PHASE1_FILES = [
  'src/modules/home/**/*.{ts,tsx}',
  'src/modules/b/**/*.{ts,tsx}',
  'src/modules/LogManagement/**/*.{ts,tsx}',
  'src/modules/SystemManagement/**/*.{ts,tsx}'
];
const TYPE_AWARE_PHASE2_FILES = [
  'src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx}',
  'src/modules/{UserManagement,demo,portal}/**/*.{ts,tsx}'
];
const TYPE_AWARE_PHASE1_RECOVERY_RULES = {
  '@typescript-eslint/no-floating-promises': 'warn',
  '@typescript-eslint/no-unnecessary-condition': 'warn',
  '@typescript-eslint/no-unsafe-assignment': 'warn',
  '@typescript-eslint/no-unsafe-member-access': 'warn',
  '@typescript-eslint/no-unsafe-return': 'warn',
  '@typescript-eslint/strict-boolean-expressions': [
    'warn',
    {
      allowString: true,
      allowNumber: true,
      allowNullableObject: true,
      allowNullableBoolean: true,
      allowNullableString: true,
      allowNullableNumber: true,
      allowAny: false
    }
  ]
};

export default [
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
    // 类型声明文件允许更宽松（避免脚手架被 d.ts 细节卡住）
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off'
    }
  },
  {
    // 门户设计器物料组件（迁移自老项目）：schema 本身是动态 JSON，且 defineOptions.name 需与配置对齐
    files: ['src/modules/portal/materials/**/*.{ts,tsx,vue}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/component-definition-name-casing': 'off'
    }
  },
  {
    // type-aware phase1：warning 可见（与 lint:code:phase1 模块保持一致）
    files: TYPE_AWARE_PHASE1_FILES,
    ignores: ['**/*.d.ts'],
    languageOptions: TYPE_AWARE_LANGUAGE_OPTIONS,
    rules: {
      ...tsTypeAwareWarnRules,
      ...TYPE_AWARE_PHASE1_RECOVERY_RULES
    }
  },
  {
    // type-aware phase2：先覆盖其余模块，配合 lint:code:phase2 --quiet 仅做 error 阻断
    files: TYPE_AWARE_PHASE2_FILES,
    ignores: ['**/*.d.ts'],
    languageOptions: TYPE_AWARE_LANGUAGE_OPTIONS,
    rules: tsTypeAwareWarnRules
  },
  {
    // 约束：模块间默认禁止直接互相 import，公共能力需上移到 shared/core/ui
    files: ['src/modules/**/*.{ts,tsx,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/modules/*'],
              message: '禁止模块间直接依赖，请通过 shared/core/ui 暴露公共能力。'
            }
          ]
        }
      ]
    }
  },
  {
    // 约束：页面/组件/store 禁止直接依赖 infra/http，必须经过模块 API 或 shared API 封装
    files: [
      'src/pages/**/*.{ts,tsx,vue}',
      'src/components/**/*.{ts,tsx,vue}',
      'src/modules/**/pages/**/*.{ts,tsx,vue}',
      'src/modules/**/components/**/*.{ts,tsx,vue}',
      'src/modules/**/stores/**/*.{ts,tsx,vue}'
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/infra/http',
              message: '禁止在页面/组件/store 直接引用 infra/http，请改用 service 或 shared/api。'
            }
          ]
        }
      ]
    }
  },
  {
    // 约束：环境变量解析必须集中到 src/infra/env.ts，避免散落 import.meta.env 产生不一致
    files: ['src/**/*.{ts,tsx,vue}'],
    ignores: ['src/infra/env.ts'],
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
    files: ['src/**/*.{ts,tsx,vue}'],
    ignores: ['src/infra/env.ts', 'src/bootstrap/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'vue',
              importNames: ['createApp'],
              message: '禁止在业务模块创建 Vue App，请在 src/bootstrap 中集中处理启动逻辑。'
            },
            {
              name: 'pinia',
              importNames: ['createPinia', 'setActivePinia'],
              message: '禁止在业务模块初始化 Pinia，请在 src/bootstrap 中集中安装。'
            },
            {
              name: 'vue-router',
              importNames: ['createRouter', 'createWebHistory'],
              message: '禁止在业务模块创建 Router，请在 src/bootstrap/router.ts 中创建。'
            }
          ]
        }
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.type='MemberExpression'][callee.object.name='app'][callee.property.name=/^(use|component|directive|mixin|provide)$/]",
          message: '禁止在业务模块调用 app.use/app.component/... 安装全局能力，请到 src/bootstrap 中统一安装。'
        }
      ]
    }
  },
  {
    // 迁移阶段先关闭长度类噪声，后续在模块稳定后再逐步恢复阈值约束。
    files: [
      'src/bootstrap/**/*.{ts,tsx,vue}',
      'src/router/**/*.{ts,tsx,vue}',
      'src/config/**/*.{ts,tsx,vue}',
      'src/shared/**/*.{ts,tsx,vue}'
    ],
    rules: {
      'max-lines': 'off'
    }
  },
  {
    // 页面与模块长度阈值同样暂时关闭，避免历史迁移代码持续告警。
    files: ['src/modules/**/*.{ts,tsx,vue}', 'src/pages/**/*.{ts,tsx,vue}'],
    rules: {
      'max-lines': 'off'
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
