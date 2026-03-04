# @one-base-template/lint-ruleset

`one-base-template` 的前端 lint 规则子包，面向**无 Sonar 服务端**场景。

## 目标

- 用 ESLint + Stylelint + Csslint 在本地/CI 落地可执行质量门禁。
- 尽量替代导出的 Sonar/Csslint 规则。
- 保留不可 1:1 替代规则清单，避免误判“已全覆盖”。

## 规则产物

- `eslint.config.mjs`：JS/TS/Vue 规则集（含 SonarJS 近似替代）
- `stylelint.config.cjs`：CSS/SCSS/Vue style 规则集（含 Sonar CSS + Csslint 替代）
- `mappings/replaced-rules.csv`：已替代（direct + partial）规则
- `mappings/unmapped-rules.csv`：暂不可 1:1 替代规则
- `mappings/full-frontend-*.csv`：前端全量（排除 Node.js）映射拆分清单（direct / partial / none）
- `mappings/full-frontend-summary.json`：全量映射统计结果
- `mappings/vue-priority-baseline.csv`：Vue 规则基线治理清单（含 officialCategory/deprecated/baselineIncluded）
- `mappings/vue-priority-summary.json`：Vue3 基线治理统计（不把 deprecated 计入缺口）
- `rules/eslint/js-rules.mjs`：JavaScript 平台规则集合（与平台抓取规则对齐）
- `rules/eslint/ts-rules.mjs`：TypeScript 平台规则集合
- `rules/eslint/vue-rules.mjs`：Vue 平台规则集合（自动排除 deprecated）
- `rules/eslint/js-standard-rule-map.mjs`：`ESLint-规范(JSxxx)` 映射字典

## 覆盖进展（2026-03-04）

- 前端全量（排除 Node.js）仍为 `1968` 条：
  - `direct`: 1295
  - `partial`: 669
  - `none`: 4
  - 可治理 `none`（排除 Vue deprecated）：0
- Stylelint 规则源（195 条）覆盖状态：
  - `direct`: 123
  - `partial`: 72
  - `none`: 0
- CSS 244（Stylelint + Sonar(CSS) + Csslint）覆盖状态：
  - `direct`: 157
  - `partial`: 87
  - `none`: 0

## 自定义 Csslint 规则参数（单档）

`stylelint.config.cjs` 已内置 4 条自定义规则，统一采用单档策略：

- `ob-csslint/css036-font-family-case-consistent`: `warning`
- `ob-csslint/css037-min-font-size`: `error`（固定 `minPx=12`）
- `ob-csslint/css041-require-transition-property`: `error`
- `ob-csslint/css046-vendor-prefix-order`: `warning`（默认不强制无前缀兜底）

## Vue 规则基线（Base/A/B 顺序）

本包在 Vue 规则治理上采用官方分类顺序，并默认使用 **Vue3 优先**基线：

1. Base Rules
2. Priority A: Essential
3. Priority A: Essential for Vue.js 3.x
4. Priority B: Strongly Recommended
5. Priority B: Strongly Recommended for Vue.js 3.x

默认纳入基线：`base + vue3-essential + vue3-strongly-recommended`。

### Deprecated 规则处理策略

以下 4 条规则为 `eslint-plugin-vue` 官方 deprecated，统一标记并排除，不纳入整改缺口：

- `vue/no-v-for-template-key`
- `vue/no-v-model-argument`
- `vue/valid-model-definition`
- `vue/valid-v-bind-sync`

原因：避免把已废弃规则当作有效整改目标，保留历史追溯即可。

## ESLint 规则拆分维护（JS / TS / Vue）

`eslint.config.mjs` 已改为从三份语言规则文件引入：

- `rules/eslint/js-rules.mjs`
- `rules/eslint/ts-rules.mjs`
- `rules/eslint/vue-rules.mjs`

维护原则：

- 平台抓取规则按语言拆分维护，默认映射为 `warn`；
- 高价值规则在语言文件中显式升阶为 `error`；
- Vue 的 deprecated 规则自动排除，不计入整改缺口。

## 在其他项目使用

### 1. 安装依赖

```bash
pnpm add -D @one-base-template/lint-ruleset
```

### 2. ESLint（Flat Config）接入

```js
// eslint.config.mjs
import preset from '@one-base-template/lint-ruleset/eslint';

export default [...preset];
```

### 3. Stylelint 接入

```js
// stylelint.config.cjs
module.exports = require('@one-base-template/lint-ruleset/stylelint');
```

如果你的项目使用 ESM 版 Stylelint 配置：

```js
// stylelint.config.mjs
import preset from '@one-base-template/lint-ruleset/stylelint';

export default preset;
```

### 4. 脚本建议

```json
{
  "scripts": {
    "lint:code": "eslint .",
    "lint:style": "stylelint \"src/**/*.{css,scss,vue}\" --allow-empty-input",
    "lint:legacy:css": "csslint \"src/**/*.css\" --quiet",
    "lint:all": "pnpm lint:code && pnpm lint:style && pnpm lint:legacy:css"
  }
}
```

## 危险等级约定

- `ruleLevel=1`：高危（必须阻断）
- `ruleLevel=2`：中危（默认阻断，可灰度）
- `ruleLevel=3`：低危（告警）

## 本包自检

```bash
pnpm -C packages/lint-ruleset lint:all
```

## 发布此子包

```bash
# 1) 先在仓库根目录完成质量校验
pnpm -C packages/lint-ruleset lint:all

# 2) 可选：查看即将发布的包内容
pnpm -C packages/lint-ruleset pack

# 3) 发布（按实际 registry 决定是否加 --registry）
pnpm -C packages/lint-ruleset publish --access public --no-git-checks
```

## 生成前端全量映射（排除 Node.js）

```bash
node ./packages/lint-ruleset/scripts/generate-full-mapping.mjs \
  --multi /tmp/rules-out-multi/rules-20260303-211347.json \
  --css /tmp/rules-out-css/rules-20260303-211416.json
```

执行后会生成：

- `packages/lint-ruleset/mappings/full-frontend-all-rules.csv`
- `packages/lint-ruleset/mappings/full-frontend-direct-rules.csv`
- `packages/lint-ruleset/mappings/full-frontend-partial-rules.csv`
- `packages/lint-ruleset/mappings/full-frontend-none-rules.csv`
- `packages/lint-ruleset/mappings/full-frontend-summary.json`
- `packages/lint-ruleset/mappings/vue-priority-baseline.csv`
- `packages/lint-ruleset/mappings/vue-priority-summary.json`
