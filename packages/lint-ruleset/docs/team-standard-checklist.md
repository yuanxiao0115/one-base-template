# 团队规范清单（基于导出规则）

## 危险等级映射

- `ruleLevel=1`：高危（必须阻断）
- `ruleLevel=2`：中危（默认阻断，可灰度）
- `ruleLevel=3`：低危（告警）

## 规则覆盖结论

- 前端全量（排除 Node.js）：1968 条
  - ESLint-缺陷：1120
  - ESLint-规范：50
  - Sonar：579
  - Stylelint：195
  - Csslint：24
- 全量映射结果（见 `mappings/full-frontend-summary.json`）：
  - direct：1295
  - partial：669
  - none：4
  - 可治理 none（排除 Vue deprecated）：0
  - Stylelint（195）已收敛至：direct 123 / partial 72 / none 0

## Vue 规则治理口径（Base/A/B）

Vue 规则对齐顺序（与 eslint-plugin-vue 官方一致）：

1. Base Rules
2. Priority A: Essential
3. Priority A: Essential for Vue.js 3.x
4. Priority B: Strongly Recommended
5. Priority B: Strongly Recommended for Vue.js 3.x

团队默认基线：**Vue3 优先**（`base + vue3-essential + vue3-strongly-recommended`）。

对应产物：

- `mappings/vue-priority-baseline.csv`
- `mappings/vue-priority-summary.json`
- `rules/eslint/js-rules.mjs`
- `rules/eslint/ts-rules.mjs`
- `rules/eslint/vue-rules.mjs`
- `rules/eslint/js-standard-rule-map.mjs`

### Deprecated 4 条处理策略

以下规则官方已废弃，统一“标记并排除”，不纳入 Vue3 基线缺口：

- `vue/no-v-for-template-key`
- `vue/no-v-model-argument`
- `vue/valid-model-definition`
- `vue/valid-v-bind-sync`

说明：仅保留历史追溯，避免把废弃规则当作有效整改目标。

其中 Sonar + Csslint 子集仍保持：

- Sonar + Csslint：603 条
- 已替代（direct + partial）：603 条
- 暂不可替代（none）：0 条

自定义 Csslint 兼容规则采用单档策略：

- `css037` 最小字号固定 `12px`
- 不启用严格档环境变量切换

## 阻断策略建议

- ESLint 与 Stylelint 中映射为 `direct` 的规则：统一 `error`
- 映射为 `partial` 的规则：
  - 默认 `error`
  - 若历史项目噪音过高，可临时降为 `warn` 并设置治理计划
- `none` 规则：保持人工复核或平台扫描

建议先治理高危 `none` 规则（`ruleLevel=1` 且 `mappingStatus=none`），再收敛中低危长尾。

## 最低执行门槛

在目标仓库 CI 中至少执行：

```bash
npm run lint:code
npm run lint:style
npm run lint:legacy:css
```

并要求以上命令全部通过。
