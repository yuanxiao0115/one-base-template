# Lint 规则集（无 Sonar 服务端）

`@one-base-template/lint-ruleset` 是本仓库新增的可复用子包，目标是在**没有 SonarQube 服务端**时，仍然提供可执行的质量门禁。

## 包位置

- 子包目录：`packages/lint-ruleset`
- 包名：`@one-base-template/lint-ruleset`（已可发布）
- 对外导出：
  - `@one-base-template/lint-ruleset/eslint`
  - `@one-base-template/lint-ruleset/stylelint`

## 覆盖策略

基于导出规则做了分层替代：

- 前端全量口径（不含 Node）：`1968` 条（Vue/TS/JS/CSS）
  - `ESLint-缺陷`: 1120
  - `ESLint-规范`: 50
  - `Sonar`: 579
  - `Stylelint`: 195
  - `Csslint`: 24
- 前端全量映射结果：
  - `direct`: 1295
  - `partial`: 669
  - `none`: 4
  - 可治理 `none`（排除 Vue deprecated）：0
  - 详见：`mappings/full-frontend-*.csv` 与 `mappings/full-frontend-summary.json`

- Stylelint 规则源（195）覆盖状态：
  - `direct`: 123
  - `partial`: 72
  - `none`: 0
- CSS 244（Stylelint + Sonar(CSS) + Csslint）覆盖状态：
  - `direct`: 157
  - `partial`: 87
  - `none`: 0

自定义 Csslint 规则（单档）：

- `ob-csslint/css036-font-family-case-consistent`：`warning`
- `ob-csslint/css037-min-font-size`：`error`（固定最小字号 `12px`）
- `ob-csslint/css041-require-transition-property`：`error`
- `ob-csslint/css046-vendor-prefix-order`：`warning`（默认不强制无前缀兜底）

Sonar + Csslint 子集（历史映射口径）：

- Sonar + Csslint 共 `603` 条
- 已替代（`direct + partial`）：`603` 条
- 暂不可 1:1 替代：`0` 条（`mappings/unmapped-rules.csv` 已清空）

## 汇报口径说明（唯一数据源）

为避免“同一汇报出现多套数字”，跨文档汇报时统一按以下数据源取数：

- 总口径与来源口径：`packages/lint-ruleset/mappings/full-frontend-summary.json`
- Vue 基线治理口径：`packages/lint-ruleset/mappings/vue-priority-summary.json`
- 语言维度（Vue/JS/TS）拆解：`packages/lint-ruleset/mappings/full-frontend-all-rules.csv`（按 `langName + mappingStatus` 聚合）

当前有效快照时间：

- `full-frontend-summary.json.generatedAt = 2026-03-04T01:13:27.882Z`
- `vue-priority-summary.json.generatedAt = 2026-03-04T01:13:27.883Z`

执行原则：

- 若文档中的统计数字与以上文件不一致，以 JSON/CSV 产物为准；
- 对外汇报前先重跑映射脚本并同步文档：`pnpm -C packages/lint-ruleset mapping:full`。

危险等级约定：

- `ruleLevel=1`：高危（必须阻断）
- `ruleLevel=2`：中危（默认阻断，可灰度）
- `ruleLevel=3`：低危（告警）

## Vue 规则基线（Base/A/B 顺序）

Vue 规则治理按 `eslint-plugin-vue` 官方 Base/A/B 顺序对齐：

1. Base Rules
2. Priority A: Essential
3. Priority A: Essential for Vue.js 3.x
4. Priority B: Strongly Recommended
5. Priority B: Strongly Recommended for Vue.js 3.x

团队默认基线是 **Vue3 优先**：`base + vue3-essential + vue3-strongly-recommended`。

对应产物：

- `mappings/vue-priority-baseline.csv`
- `mappings/vue-priority-summary.json`

### Deprecated 规则策略

以下 4 条规则在 `eslint-plugin-vue` 官方已废弃，统一“标记并排除”，不纳入 Vue3 基线整改缺口：

- `vue/no-v-for-template-key`
- `vue/no-v-model-argument`
- `vue/valid-model-definition`
- `vue/valid-v-bind-sync`

说明：保留历史追溯信息，避免把废弃规则当作有效整改目标。

## ESLint 规则维护方式（按语言拆分）

`@one-base-template/lint-ruleset` 已将 ESLint 规则按语言拆分维护，并在 `eslint.config.mjs` 中统一引入：

- `rules/eslint/js-rules.mjs`
- `rules/eslint/ts-rules.mjs`
- `rules/eslint/vue-rules.mjs`
- `rules/eslint/js-standard-rule-map.mjs`

维护策略：

- JS / TS / Vue 规则各自维护，便于和平台抓取清单逐项对齐；
- 平台抓取规则默认按 `warn` 收敛，高价值规则单独升阶 `error`；
- Vue deprecated 规则自动排除，不纳入整改缺口。

## 在其他项目接入

### 1) 安装依赖

```bash
pnpm add -D @one-base-template/lint-ruleset
```

### 2) ESLint 接入

```js
// eslint.config.mjs
import preset from '@one-base-template/lint-ruleset/eslint';

export default [...preset];
```

### 3) Stylelint 接入

```js
// stylelint.config.cjs
module.exports = require('@one-base-template/lint-ruleset/stylelint');
```

如果是 ESM 风格：

```js
// stylelint.config.mjs
import preset from '@one-base-template/lint-ruleset/stylelint';

export default preset;
```

### 4) 脚本建议

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

## 无服务端 SonarQube for IDE 使用

在 VS Code 中：

1. 安装 `SonarQube for IDE`
2. 不配置 Connected Mode（保持 standalone）
3. 打开 JS/TS/CSS/Vue 文件，保存后在编辑器与 Problems 面板查看问题

说明：standalone 模式不能同步团队 Quality Profile，建议以 `lint:all` 作为 CI 主门禁。

## 本仓库内自检

```bash
pnpm -C packages/lint-ruleset lint:all
```

## 发布步骤（维护者）

```bash
# 1) 校验
pnpm -C packages/lint-ruleset lint:all

# 2) 预览打包产物
pnpm -C packages/lint-ruleset pack

# 3) 发布（根据组织私服策略补 --registry）
pnpm -C packages/lint-ruleset publish --access public --no-git-checks
```

团队统一的版本控制与发布节奏，见：`/guide/package-release`。

如果需要做跨团队宣贯，可直接复用：`/guide/lint-ruleset-briefing`。
