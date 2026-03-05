import lintRuleset from '@one-base-template/lint-ruleset/eslint';
import projectOverrides from './eslint.project-overrides.mjs';

export default [
  ...lintRuleset,
  {
    ignores: ['dist/**', 'node_modules/**', '.vite/**', 'public/fonts/**/iconfont.js']
  },
  ...projectOverrides
];
