import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix'
  },
  lint: {
    plugins: ['oxc', 'typescript', 'unicorn', 'react', 'vue'],
    categories: {
      correctness: 'warn'
    },
    env: {
      builtin: true
    },
    rules: {
      'constructor-super': 'error',
      'for-direction': 'error',
      'getter-return': 'error',
      'no-async-promise-executor': 'error',
      'no-case-declarations': 'error',
      'no-class-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': 'error',
      'no-const-assign': 'error',
      'no-constant-binary-expression': 'error',
      'no-constant-condition': 'error',
      'no-control-regex': 'error',
      'no-debugger': 'error',
      'no-delete-var': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-else-if': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-empty': 'error',
      'no-empty-character-class': 'error',
      'no-empty-pattern': 'error',
      'no-empty-static-block': 'error',
      'no-ex-assign': 'error',
      'no-extra-boolean-cast': 'error',
      'no-fallthrough': 'error',
      'no-func-assign': 'error',
      'no-global-assign': 'error',
      'no-import-assign': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-loss-of-precision': 'error',
      'no-misleading-character-class': 'error',
      'no-new-native-nonconstructor': 'error',
      'no-nonoctal-decimal-escape': 'error',
      'no-obj-calls': 'error',
      'no-prototype-builtins': 'error',
      'no-redeclare': 'error',
      'no-regex-spaces': 'error',
      'no-self-assign': 'error',
      'no-setter-return': 'error',
      'no-shadow-restricted-names': 'error',
      'no-sparse-arrays': 'error',
      'no-this-before-super': 'error',
      'no-unassigned-vars': 'error',
      'no-undef': 'error',
      'no-unexpected-multiline': 'error',
      'no-unreachable': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-labels': 'error',
      'no-unused-private-class-members': 'error',
      'no-unused-vars': 'error',
      'no-useless-backreference': 'error',
      'no-useless-catch': 'error',
      'no-useless-escape': 'error',
      'no-with': 'error',
      'preserve-caught-error': 'error',
      'require-yield': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      'no-array-constructor': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-extra-non-null-assertion': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      '@typescript-eslint/no-unsafe-declaration-merging': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      'no-unused-expressions': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',
      '@typescript-eslint/triple-slash-reference': 'error',
      'vue/no-arrow-functions-in-watch': 'error',
      'vue/no-deprecated-destroyed-lifecycle': 'error',
      'vue/no-export-in-script-setup': 'error',
      'vue/no-lifecycle-after-await': 'error',
      'vue/prefer-import-from-vue': 'error',
      'vue/valid-define-emits': 'error',
      'vue/valid-define-props': 'error',
      'vue/no-multiple-slot-args': 'warn',
      'vue/no-required-prop-with-default': 'warn'
    },
    ignorePatterns: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.vite/**',
      '**/.vitepress/cache/**',
      '**/public/fonts/**/iconfont.js'
    ],
    overrides: [
      {
        files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
        rules: {
          'constructor-super': 'off',
          'getter-return': 'off',
          'no-class-assign': 'off',
          'no-const-assign': 'off',
          'no-dupe-class-members': 'off',
          'no-dupe-keys': 'off',
          'no-func-assign': 'off',
          'no-import-assign': 'off',
          'no-new-native-nonconstructor': 'off',
          'no-obj-calls': 'off',
          'no-redeclare': 'off',
          'no-setter-return': 'off',
          'no-this-before-super': 'off',
          'no-undef': 'off',
          'no-unreachable': 'off',
          'no-unsafe-negation': 'off',
          'no-var': 'error',
          'no-with': 'off',
          'prefer-const': 'error',
          'prefer-rest-params': 'error',
          'prefer-spread': 'error'
        }
      },
      {
        files: ['scripts/**/*.{js,mjs,cjs}'],
        globals: {
          console: 'readonly',
          process: 'readonly'
        }
      },
      {
        files: ['**/*.{ts,tsx,vue}'],
        rules: {
          'no-undef': 'off'
        }
      },
      {
        files: ['**/*.d.ts'],
        rules: {
          '@typescript-eslint/no-explicit-any': 'off',
          '@typescript-eslint/no-empty-object-type': 'off'
        }
      },
      {
        files: [
          'apps/admin/src/modules/portal/materials/**/*.{ts,tsx,vue}',
          'packages/portal-engine/src/materials/**/*.{ts,tsx,vue}',
          'packages/portal-engine/src/registry/**/*.{ts,tsx,vue}'
        ],
        rules: {
          '@typescript-eslint/no-explicit-any': 'off'
        }
      },
      {
        files: ['packages/utils/src/**/*.{ts,tsx,vue}'],
        rules: {
          '@typescript-eslint/no-explicit-any': 'off',
          '@typescript-eslint/no-unsafe-function-type': 'off',
          'no-control-regex': 'off'
        }
      },
      {
        files: ['packages/tag/src/**/*.{ts,tsx,vue}'],
        rules: {
          '@typescript-eslint/no-explicit-any': 'off',
          'no-unused-vars': 'off'
        }
      },
      {
        files: ['apps/admin/src/modules/**/*.{ts,tsx,vue}'],
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
        files: [
          'apps/admin/src/pages/**/*.{ts,tsx,vue}',
          'apps/admin/src/components/**/*.{ts,tsx,vue}',
          'apps/admin/src/modules/**/pages/**/*.{ts,tsx,vue}',
          'apps/admin/src/modules/**/components/**/*.{ts,tsx,vue}',
          'apps/admin/src/modules/**/stores/**/*.{ts,tsx,vue}'
        ],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              paths: [
                {
                  name: '@/infra/http',
                  message:
                    '禁止在页面/组件/store 直接引用 infra/http，请改用 service 或 types/api。'
                }
              ]
            }
          ]
        }
      },
      {
        files: ['apps/admin/src/**/*.{ts,tsx,vue}'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              paths: [
                {
                  name: 'vue',
                  importNames: ['createApp'],
                  message:
                    '禁止在业务模块创建 Vue App，请在 apps/admin/src/bootstrap 中集中处理启动逻辑。'
                },
                {
                  name: 'pinia',
                  importNames: ['createPinia', 'setActivePinia'],
                  message: '禁止在业务模块初始化 Pinia，请在 apps/admin/src/bootstrap 中集中安装。'
                },
                {
                  name: 'vue-router',
                  importNames: ['createRouter', 'createWebHistory'],
                  message:
                    '禁止在业务模块创建 Router，请在 apps/admin/src/bootstrap/router.ts 中创建。'
                }
              ]
            }
          ]
        }
      },
      {
        files: ['apps/admin/src/bootstrap/**/*.{ts,tsx,vue}'],
        rules: {
          'no-restricted-imports': 'off'
        }
      },
      {
        files: [
          'apps/admin/src/bootstrap/**/*.{ts,tsx,vue}',
          'apps/admin/src/router/**/*.{ts,tsx,vue}',
          'apps/admin/src/config/**/*.{ts,tsx,vue}',
          'apps/admin/src/services/**/*.{ts,tsx,vue}',
          'apps/admin/src/types/**/*.{ts,tsx,vue}'
        ],
        rules: {
          'max-lines': [
            'warn',
            {
              max: 220,
              skipBlankLines: true,
              skipComments: true
            }
          ]
        }
      },
      {
        files: [
          'apps/admin/src/modules/**/*.{ts,tsx,vue}',
          'apps/admin/src/pages/**/*.{ts,tsx,vue}'
        ],
        rules: {
          'max-lines': [
            'warn',
            {
              max: 360,
              skipBlankLines: true,
              skipComments: true
            }
          ]
        }
      }
    ],
    options: {
      typeAware: false,
      typeCheck: false
    }
  },
  fmt: {
    semi: true,
    singleQuote: true,
    trailingComma: 'none',
    printWidth: 100,
    tabWidth: 2,
    sortPackageJson: false,
    ignorePatterns: []
  }
});
