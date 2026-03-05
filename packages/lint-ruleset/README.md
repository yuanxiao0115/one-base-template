# @one-base-template/lint-ruleset

`one-base-template` 的前端 lint 规则子包，面向**无 Sonar 服务端**场景。

## 目标

- 用 ESLint + Stylelint + Csslint 在本地/CI 落地可执行质量门禁。
- 尽量替代导出的 Sonar/Csslint 规则。
- 保留不可 1:1 替代规则清单，避免误判“已全覆盖”。

## 规则产物

- `eslint.config.mjs`：JS/TS/Vue 规则集（含 SonarJS 近似替代）
- `eslint-type-aware.mjs`：TS type-aware 规则导出（requiresTypeChecking，默认 warning）
- `stylelint.config.cjs`：CSS/SCSS/Vue style 规则集（含 Sonar CSS + Csslint 替代）
- `mappings/replaced-rules.csv`：已替代（direct + partial）规则
- `mappings/unmapped-rules.csv`：暂不可 1:1 替代规则
- `mappings/full-frontend-*.csv`：前端全量（排除 Node.js）映射拆分清单（direct / partial / none）
- `mappings/full-frontend-summary.json`：全量映射统计结果
- `mappings/full-frontend-gap-catalog.json`：`none` 缺口分类清单（可直接启用 / 需参数 / 规则迁移或废弃）
- `mappings/rule-recovery-ledger.json`：规则回收台账（`off -> warn -> error` 状态流转）
- `mappings/vue-priority-baseline.csv`：Vue 规则基线治理清单（含 officialCategory/deprecated/baselineIncluded）
- `mappings/vue-priority-summary.json`：Vue3 基线治理统计（不把 deprecated 计入缺口）
- `rules/eslint/js-rules.mjs`：JavaScript 平台规则集合（与平台抓取规则对齐）
- `rules/eslint/ts-rules.mjs`：TypeScript 平台规则集合
- `rules/eslint/vue-rules.mjs`：Vue 平台规则集合（自动排除 deprecated）
- `rules/eslint/js-standard-rule-map.mjs`：`ESLint-规范(JSxxx)` 映射字典

## 覆盖进展（2026-03-04）

- 前端全量（排除 Node.js）仍为 `1968` 条：
  - `direct`: 1212
  - `partial`: 742
  - `none`: 14
  - 可治理 `none`（排除 Vue deprecated）：10
- Stylelint 规则源（195 条）覆盖状态：
  - `direct`: 119
  - `partial`: 76
  - `none`: 0
- CSS 244（Stylelint + Sonar(CSS) + Csslint）覆盖状态：
  - `direct`: 153
  - `partial`: 91
  - `none`: 0

## 缺口处置进展（2026-03-04）

- 已把 18 条可直接布尔启用 + 40 条可参数化启用 + 63 条 `@stylistic/*` 迁移规则接入团队规则集（先以 `warning` 启动）。
- 已补齐剩余 30 条 Stylelint option 规则的团队默认参数模板（先以 `warning` 启动）。
- 已新增 `@one-base-template/lint-ruleset/eslint-type-aware` 导出，承接 45 条 TS type-aware 规则并支持接入方分模块启用。
- `none` 规则完整分类见：`mappings/full-frontend-gap-catalog.json`。
- 当前缺口主要分三类：
  - 已无 Stylelint 可治理缺口；
  - 已无 Type-Aware 可治理缺口（已按 typed profile 计入 partial）。
- 废弃口径合并：
  - 官方 deprecated：4 条；
  - 规则名移除/重命名：10 条；
  - 合并后废弃：14 条（对应 `actionableNoneMergedDeprecated=0`）。

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
- Vue 的 deprecated 规则自动排除，不计入整改缺口；
- ESLint 10 场景下自动过滤“不存在规则”；主配置默认跳过 type-aware 规则，需通过 `eslint-type-aware` 导出在接入方按模块启用。
- ESLint 默认忽略测试文件：`**/__tests__/**` 与 `**/*.{test,spec}.{js,jsx,ts,tsx,vue,mjs,cjs}`（测试质量由测试命令负责，不纳入 lint 门禁）。

### 爬取规则参数化审计（2026-03-05）

- 平台抓取 ESLint 规则共 `578` 条（JS `283` + TS `64` + Vue `231`）；
- 当前已压缩到 `0` 条“规则支持 options，但当前仅配置了 warn/error 级别”（JS `0` + TS `0` + Vue `0`）；
- ESLint 参数模板以 `@antfu/eslint-config` 的工程实践为参照（显式参数、TS/Vue 优先、渐进收敛），并结合本仓库历史代码做差异化取舍；
- 本轮先补齐高价值参数模板（`antfu` + `vue-best-practices`）：
  - TS：`@typescript-eslint/array-type`、`@typescript-eslint/ban-ts-comment`、`@typescript-eslint/explicit-function-return-type`
  - Vue：`vue/component-api-style`、`vue/define-props-declaration`、`vue/define-emits-declaration`
- 第二批（用户确认后继续）再补齐 20 条（Vue 12 + TS 8）：
  - Vue：`component-definition-name-casing`、`component-name-in-template-casing`、`custom-event-name-casing`、`attribute-hyphenation`、`prop-name-casing`、`v-bind-style`、`v-on-style`、`v-slot-style`、`no-boolean-default`、`no-reserved-props`、`no-template-target-blank`、`block-lang`
  - TS：`consistent-type-definitions`、`consistent-indexed-object-style`、`consistent-generic-constructors`、`consistent-type-assertions`、`class-literal-property-style`、`method-signature-style`、`no-empty-function`、`no-use-before-define`
- 第三批（继续推进）补齐 20 条 JS 高频参数模板（缩进/空格/命名/注释/排序等）。
- 第四批（继续推进）回填 97 条规则的 `defaultOptions`（JS `66` + TS `26` + Vue `5`），将稳定默认行为显式化。
- 第五批（继续推进）补齐 166 条显式参数（JS `69` + Vue `97`）：
  - JS：补齐 `arrow-parens`、`import/first`、`import/no-duplicates`、`lines-around-directive`、`no-multiple-empty-lines`、`prefer-destructuring` 等常用规则参数；
  - Vue：补齐 `array-bracket-spacing`、`brace-style`、`eqeqeq`、`object-curly-spacing`、`sort-keys`、`v-on-event-hyphenation`、`v-on-handler-style` 等规则参数。
- 第六批（继续推进）补齐 6 条 Vue 显式参数：
  - `vue/html-comment-content-spacing`、`vue/html-comment-indent`、`vue/html-indent`
  - `vue/no-extra-parens`、`vue/object-shorthand`、`vue/no-v-html`（`ignorePattern: '^$'`）
- 第七批（继续推进）补齐 17 条“限制名单类”模板参数（JS `4` + Vue `13`）：
  - JS：`id-denylist`、`no-restricted-globals`、`no-restricted-properties`、`no-restricted-syntax`；
  - Vue：`vue/no-child-content` 与 `vue/no-restricted-*` 系列。

说明：

- 这 17 条采用“团队模板占位参数”以消除仅级别配置歧义；
- 后续可按团队规范把占位值替换为真实限制名单，不影响当前门禁策略。

说明：参数显式化以“减少默认值歧义”为目标，不改变现有门禁策略（warning 可见、error 阻断）。

## Stylelint 17 兼容说明

为保证规则集在 Stylelint 17 可执行，已完成两类清理：

- 移除已废弃/失效的历史规则组合（含不可执行的批量 `true` 覆盖）；
- 保留可执行规则子集 + 4 条 `ob-csslint/*` 自定义规则，并允许接入方在项目侧覆写严重级别。
- 基线采用 `stylelint-config-standard-scss + stylelint-config-recommended-vue/scss`，并保证 `recommended-vue/scss` 在 `extends` 最后。

### declaration-block-semicolon 推荐组合（团队默认）

为兼顾可读性与噪声控制，团队默认采用：

- `@stylistic/declaration-block-semicolon-newline-before`: `never-multi-line`
- `@stylistic/declaration-block-semicolon-newline-after`: `always-multi-line`
- `@stylistic/declaration-block-semicolon-space-before`: `never`
- `@stylistic/declaration-block-semicolon-space-after`: `always-single-line`
- `@stylistic/declaration-block-trailing-semicolon`: `always`

说明：不再要求分号单独换行，避免将主流 `prop: value;` 写法误判为 warning。

### Stylelint 模板参数合理性修订（2026-03-04）

- `function-allowed-list`：使用大小写不敏感模板，兼容标准 transform 函数命名；
- `selector-pseudo-class-disallowed-list`：不再禁止 Vue `:global()`；
- `selector-attribute-operator-disallowed-list`：移除冲突型禁用模板，避免与 allowed-list 对冲。
- `stylelint-config-prettier`：基于 Stylelint v15+ 官方迁移说明，当前规则集不引入该包。

### 规则降噪校准（2026-03-05）

结合 admin 实际审计结果（高噪声但低质量收益规则），本轮在封装规则层统一收敛：

- ESLint：`sort-keys` 关闭（`off`）；
- ESLint：`vue/sort-keys` 关闭（`off`）；
- ESLint：`vue/no-bare-strings-in-template` 关闭（当前阶段不把 i18n 文案纳入治理）；
- ESLint：`vue/no-undef-components` 保持 `warn`，但加入 `el-*` / `ob-*` 全局组件白名单；
- ESLint（第二轮参数收敛）：
  - JS：`func-style` -> `declaration + allowArrowFunctions`、`sort-imports` 放宽声明排序；
  - JS：`require-await` / `no-ternary` 关闭，`no-magic-numbers` 使用渐进模板；
  - TS：`@typescript-eslint/explicit-function-return-type` / `@typescript-eslint/no-magic-numbers` 关闭；
  - Type-aware：`@typescript-eslint/prefer-readonly-parameter-types` 关闭，`strict-boolean-expressions` / `prefer-nullish-coalescing` 改为渐进模板；
  - Vue：`vue/max-len` 放宽到 `120` 并忽略模板文本/属性值，`vue/require-prop-comment` 关闭；
- Stylelint：`selector-max-specificity` 从 `0,2,0` 放宽为 `1,3,0`。
- Stylelint：`declaration-property-max-values` 中 `box-shadow` 阈值由 `3` 调整为 `4`（贴合常见阴影写法）。

说明：

- 以上策略遵循“团队规则优先”，不依赖接入方本地同名覆盖；
- 目标是先压缩历史噪声并提升可治理信噪比，后续再按模块逐步收紧阈值。
- admin 侧已同步清理历史 `!important` 用法并简化个别多层阴影，当前 stylelint 审计告警为 `0`。
- admin 侧（不含 i18n）ESLint 审计告警已从 `6135` 收敛到 `1872`，并进一步从 `1840` 收敛到 `0`（error 持续 `0`）。

### 第三轮收敛（2026-03-05）

针对 admin 历史迁移代码的低信噪比 warning，本轮继续在**团队封装层**完成规则降噪，不依赖项目本地同名覆盖：

- JS：关闭 `indent`、`max-len`、`max-statements`、`max-lines-per-function`、`no-magic-numbers`、`sort-imports` 等高噪声约束；
- TS/type-aware：关闭 `@typescript-eslint/require-await`、`@typescript-eslint/naming-convention`、`@typescript-eslint/no-base-to-string` 及 `no-unsafe-*` 系列 warning；
- Vue：关闭 `vue/script-indent`、`vue/v-on-handler-style`、`vue/max-len`、`vue/require-*` 等迁移期高噪声规则；
- Sonar/Security：关闭 `sonarjs/*` 中低收益噪声项与 `security/detect-object-injection`（保留 `detect-unsafe-regex` / `detect-eval-with-expression` error 阻断）。

本轮结果（admin，不含 i18n）：

- ESLint 全量审计：`1840 -> 0`（error 持续 `0`）；
- Stylelint 全量审计：`0 -> 0`（error 持续 `0`）。

### 规则回收台账（2026-03-05）

- 已新增台账：`mappings/rule-recovery-ledger.json`，统一记录 `rule/category/currentState/targetState/scope/reason/tuning/status`。
- 已落地回收（统一门禁范围）：
  - `@typescript-eslint/no-floating-promises`
  - `@typescript-eslint/no-unsafe-assignment`
  - `@typescript-eslint/no-unsafe-member-access`
  - `@typescript-eslint/no-unsafe-return`
  - `@typescript-eslint/strict-boolean-expressions`
  - `@typescript-eslint/no-unnecessary-condition`
- 当前范围进度：
  - `SystemManagement` 与 `UserManagement` 均已纳入统一门禁并保持 `0 warnings / 0 errors`。

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

若要生成 `none` 缺口分桶清单（含“需第三方库/规则迁移”建议）：

```bash
pnpm -C packages/lint-ruleset mapping:gap-catalog
```
