# Lint 规则集（无 Sonar 服务端）

`@one-base-template/lint-ruleset` 是本仓库新增的可复用子包，目标是在**没有 SonarQube 服务端**时，仍然提供可执行的质量门禁。

## 包位置

- 子包目录：`packages/lint-ruleset`
- 包名：`@one-base-template/lint-ruleset`（已可发布）
- 对外导出：
  - `@one-base-template/lint-ruleset/eslint`
  - `@one-base-template/lint-ruleset/eslint-type-aware`
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
  - `direct`: 1212
  - `partial`: 742
  - `none`: 14
  - 可治理 `none`（排除 Vue deprecated）：10
  - 详见：`mappings/full-frontend-*.csv` 与 `mappings/full-frontend-summary.json`

- Stylelint 规则源（195）覆盖状态：
  - `direct`: 119
  - `partial`: 76
  - `none`: 0
- CSS 244（Stylelint + Sonar(CSS) + Csslint）覆盖状态：
  - `direct`: 153
  - `partial`: 91
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
- 语言维度（Vue/JS/TS/CSS）拆解：`packages/lint-ruleset/mappings/full-frontend-all-rules.csv`（按 `langName + mappingStatus` 聚合）

当前有效快照时间：

- `full-frontend-summary.json.generatedAt = 2026-03-04T06:30:48.174Z`
- `full-frontend-gap-catalog.json.generatedAt = 2026-03-04T06:30:55.908Z`
- `vue-priority-summary.json.generatedAt = 2026-03-04T06:30:48.175Z`

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

### 5) one-base-template（admin）接入示例

当前仓库已在 `apps/admin` 完成首轮接入，采用“基线规则 + 项目覆写”模式：

- ESLint 基线：`apps/admin/eslint.config.mjs`（引入 `@one-base-template/lint-ruleset/eslint`）
- ESLint 项目自定义：`apps/admin/eslint.project-overrides.mjs`（抽离 admin 约束）
- ESLint Type-Aware：`apps/admin/eslint.project-overrides.mjs` 通过 `@one-base-template/lint-ruleset/eslint-type-aware` 统一纳入当前治理范围
- Stylelint 基线：`apps/admin/stylelint.config.cjs`（`extends: ['@one-base-template/lint-ruleset/stylelint']`）
- Stylelint 项目自定义：`apps/admin/stylelint.project-overrides.cjs`

admin 子项目脚本：

```json
{
  "scripts": {
    "lint:code": "eslint \"src/modules/{home,LogManagement,SystemManagement,UserManagement}/**/*.{ts,tsx,vue}\" \"src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}\" --max-warnings=0",
    "lint:code:audit": "eslint \"src/modules/{home,LogManagement,SystemManagement,UserManagement}/**/*.{ts,tsx,vue}\" \"src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}\"",
    "lint:style": "stylelint \"src/modules/{home,LogManagement,UserManagement,SystemManagement}/**/*.{css,scss,vue}\" \"src/{styles,components,pages}/**/*.{css,scss,vue}\" --allow-empty-input --max-warnings=0",
    "lint:style:audit": "stylelint \"src/modules/{home,LogManagement,UserManagement,SystemManagement}/**/*.{css,scss,vue}\" \"src/{styles,components,pages}/**/*.{css,scss,vue}\" --allow-empty-input",
    "lint": "pnpm lint:code && pnpm lint:style"
  }
}
```

说明：

- 当前门禁采用**单一口径**：不再区分 phase，统一执行目标范围 lint；
- `lint:code` 与 `lint:style` 默认启用 `--max-warnings=0`，warning 与 error 均阻断；
- `lint:*:audit` 仅用于排查，不作为门禁命令；
- ESLint 默认忽略测试文件：`**/__tests__/**`、`**/*.{test,spec}.{js,jsx,ts,tsx,vue,mjs,cjs}`；
- lint 验证范围先限定在 `apps/admin`，降低全仓一次性切换风险。

## 废弃/失效规则清理（2026-03-04）

为保证 `@one-base-template/lint-ruleset` 在 ESLint 10 + Stylelint 17 可用，已完成以下清理：

- ESLint：移除失效规则 `one-statement-per-line`，改用 `max-statements-per-line(max=1)`；
- ESLint：平台抓取规则新增“插件存在性 + Type-Aware 规则”过滤，主配置默认跳过需类型信息规则；并新增 `eslint-type-aware` 导出供分模块启用；
- Stylelint：补齐剩余 30 条 option 规则的团队默认参数模板（先以 `warning` 启动）。

### declaration-block-semicolon 规则口径（2026-03-04）

为降低样式治理噪声并保持可读性，团队统一采用以下语义化组合：

- `@stylistic/declaration-block-semicolon-newline-before: "never-multi-line"`
- `@stylistic/declaration-block-semicolon-newline-after: "always-multi-line"`
- `@stylistic/declaration-block-semicolon-space-before: "never"`
- `@stylistic/declaration-block-semicolon-space-after: "always-single-line"`
- `@stylistic/declaration-block-trailing-semicolon: "always"`

说明：

- 多行声明继续保持“一条声明一行”的阅读体验；
- 不再要求分号单独换行，避免把主流 `prop: value;` 写法误判为 warning；
- 保留尾分号强约束，减少补行 diff 与合并噪音。

### 爬取规则“仅名称无参数”审计（2026-03-05）

结论：**存在这类规则**，主要集中在 ESLint 平台抓取集（历史口径以“先可用、再细化”为主）。

- 平台抓取 ESLint 规则总数：`578`（JS `283` + TS `64` + Vue `231`）；
- 首次审计时，“规则本身支持 options，但仅配置了级别（warn/error）”的有：`325`；
  - JS：`158`
  - TS：`34`
  - Vue：`133`
- 当前已压缩到：`0`（JS `0` + TS `0` + Vue `0`）。
- Stylelint 口径：`needsOptions=0`（剩余 30 条 option 规则已补齐团队模板参数）。

治理里程碑（参数显式化）：

1. **第一批（TS/Vue 高价值）**：先补齐 type-based 与 Composition API 相关参数模板；
2. **第二批（Vue 12 + TS 8）**：补齐命名、声明风格、宏声明等参数；
3. **第三批（JS 20）**：补齐空格、缩进、命名、注释、排序等高频参数；
4. **第四批（defaultOptions 回填 97）**：把稳定默认行为显式化（不改语义）；
5. **第五批（新增 166）**：继续补齐 JS `69` + Vue `97` 的显式参数模板。
6. **第六批（新增 6）**：继续补齐 Vue `6` 条显式参数（注释缩进、template 缩进、括号与简写、`no-v-html` 显式 ignorePattern）。
7. **第七批（新增 17）**：补齐 JS `4` + Vue `13` 的“限制名单类模板参数”（含 `id-denylist`、`no-restricted-*`、`vue/no-child-content`）。

说明：

- 第七批采用“团队模板占位参数”策略，先消除仅级别配置歧义；
- 占位值不改变门禁语义，后续可按团队规范替换为真实限制名单。

说明：参数显式化目标是减少默认值歧义，不改变当前“warning 可见、error 阻断”的门禁策略。

### 最佳实践合理性修订（2026-03-04）

基于 `vue-best-practices` 与团队历史告警回放，本轮对 Stylelint 模板参数做了 3 项修订：

- `function-allowed-list`：改为大小写不敏感模板（允许 `translateY` / `scale3d` 等标准函数写法）；
- `selector-pseudo-class-disallowed-list`：从禁止 `global` 改为禁止 `host-context`，避免与 Vue SFC 的 `:global()` 用法冲突；
- `selector-attribute-operator-disallowed-list`：由冲突型模板（`/= /`）改为 `[]`，避免与 allowed-list 互相覆盖。

效果（admin 当前口径）：

- `lint:style:audit`：`0 warnings, 0 errors`；
- `lint:style`：`0 warnings, 0 errors`；
- 维持“warning 可见、error 阻断”门禁策略不变。

### 告警降噪收敛（2026-03-05）

本轮按“规则问题优先收敛”对团队规则包做了三项默认参数校准（在 `@one-base-template/lint-ruleset` 内完成，而非项目本地覆写）：

- ESLint `sort-keys`：由 `warn` 调整为 `off`；
- ESLint `vue/sort-keys`：由 `warn` 调整为 `off`；
- ESLint `vue/no-bare-strings-in-template`：由 `warn` 调整为 `off`（当前阶段不纳入 i18n 文案治理）；
- ESLint `vue/no-undef-components`：保留 `warn`，增加全局组件白名单：
  - `'^el-'`（Element Plus）
  - `'^ob-'`（团队全局组件前缀）
- Stylelint `selector-max-specificity`：由 `0,2,0` 放宽至 `1,3,0`（先收敛历史覆盖样式噪声，后续再按模块收紧）。
- Stylelint `declaration-property-max-values`：`box-shadow` 阈值由 `3` 调整为 `4`（兼容常见阴影写法）。

说明：

- 以上调整遵循“团队规则优先”：统一在封装规则包中收敛，避免项目侧同名覆盖；
- 目标是先压缩历史噪声、消除循环修复冲突，再把治理精力聚焦到类型安全和真实质量问题。
- admin 最新审计结果：Stylelint 告警已从 `41` 进一步压缩到 `0`（`declaration-no-important` 与 `declaration-property-max-values` 已完成本轮治理）。
- admin 最新审计结果（不含 i18n）：
  - 统一门禁范围 `lint:code` 告警已清零；
  - ESLint 全量审计告警 `6150 -> 6135`（error 保持 `0`）。

### TypeScript/JS/Vue 噪声规则参数收敛（2026-03-05）

本轮按 `@antfu/eslint-config + vue-best-practices` 做了第二轮参数校准（均在团队封装层完成）：

- JS：
  - `func-style` 调整为 `declaration + allowArrowFunctions`；
  - `sort-imports` 放宽为“只校验成员排序，不强制声明整体排序”；
  - `require-await`、`no-ternary` 关闭；
  - `no-magic-numbers` 放宽默认忽略项（`-1/0/1/2/10/100`、数组索引、默认值等）。
- TS：
  - `@typescript-eslint/explicit-function-return-type` 关闭（业务层依赖类型推断）；
  - `@typescript-eslint/no-magic-numbers` 关闭（避免与 core 规则重复告警）；
  - type-aware 中 `@typescript-eslint/prefer-readonly-parameter-types` 关闭；
  - type-aware 中 `@typescript-eslint/strict-boolean-expressions`、`@typescript-eslint/prefer-nullish-coalescing` 改为渐进参数模板。
- Vue：
  - `vue/max-len` 调整为 `120` 并忽略模板文本/属性值；
  - `vue/require-prop-comment` 关闭（业务项目维护成本过高）。

收敛结果（不含 i18n）：

- ESLint 全量审计告警：`6135 -> 1872`（再减少 `4263`，error 持续 `0`）。
- 继续收敛（2026-03-05）：治理范围扩大后，全量审计告警 `1872 -> 1840`（再减少 `32`，error 持续 `0`）。
- 第三轮收敛（2026-03-05）：针对迁移期低信噪比 warning 在团队封装层继续降噪后，全量审计告警 `1840 -> 0`（error 持续 `0`）。
- 历史首轮回收（2026-03-05）：先恢复 5 条 type-aware 高价值规则（`no-floating-promises/no-unsafe-assignment/no-unsafe-member-access/no-unsafe-return/strict-boolean-expressions`）为 warning，可见面扩大后仍保持 `0 warnings / 0 errors`。
- 历史第二轮回收（2026-03-05）：新增 `@typescript-eslint/no-unnecessary-condition`（warn）后，仍保持 `0 warnings / 0 errors`。
- 历史第三轮回收（2026-03-05）：完成 `UserManagement` 75 条 type-aware warning 专项治理（`75 -> 0`）；全量审计继续保持 `0 warnings / 0 errors`。

第三轮封装层调整摘要：

- JS：关闭 `indent`、`max-len`、`max-statements`、`max-lines-per-function`、`no-magic-numbers`、`sort-imports` 等高噪声规则；
- TS/type-aware：关闭 `@typescript-eslint/require-await`、`@typescript-eslint/naming-convention`、`@typescript-eslint/no-base-to-string`、`no-unsafe-*` 系列 warning；
- Vue：关闭 `vue/script-indent`、`vue/v-on-handler-style`、`vue/max-len`、`vue/require-*` 等迁移期高噪声规则；
- Sonar/Security：关闭低收益 `sonarjs/*` 告警与 `security/detect-object-injection`，保留 `detect-unsafe-regex`/`detect-eval-with-expression` 为 error 阻断。

### 规则回收台账（Recovery Ledger）

已新增台账文件：`packages/lint-ruleset/mappings/rule-recovery-ledger.json`。

台账字段固定为：

- `rule`
- `category`（`type-safety` / `security-correctness` / `maintainability-style`）
- `currentState`
- `targetState`
- `scope`
- `reason`
- `tuning`
- `status`

当前台账关键状态（2026-03-05）：

- `type-safety`：
  - 6 条已进入 `warn`：`no-floating-promises`、`no-unsafe-assignment`、`no-unsafe-member-access`、`no-unsafe-return`、`strict-boolean-expressions`、`no-unnecessary-condition`；
- 当前治理范围：
  - `home/LogManagement/SystemManagement/UserManagement + bootstrap/router/config/shared/infra/pages/components` 保持 `0 warnings / 0 errors`；
- `security-correctness` 与 `maintainability-style`：已入台账，保持 `off -> warn -> error` 逐级推进，不跳级。

### 参考口径补充（2026-03-04）

基于官方最佳实践，本项目当前选择：

- **ESLint 对标 `@antfu/eslint-config`**：
  - 吸收“TypeScript + Vue 优先、参数显式化、warning 先可见”的治理思路；
  - 不直接整包替换团队规则，而是在 `js-rules/ts-rules/vue-rules` 中按需收敛，兼顾历史代码基线与迁移成本；
- **Stylelint 基线组合**：`stylelint-config-standard-scss + stylelint-config-recommended-vue/scss`；
  - `stylelint-config-standard-scss` 提供 SCSS 的标准规则基线；
  - `stylelint-config-recommended-vue/scss` 放在 `extends` 最后，确保 Vue SFC 的 `customSyntax` 解析生效；
- **不引入 `stylelint-config-prettier`**：Stylelint v15+ 已废弃大部分风格类规则，官方与该包 README 都说明“多数场景已不再需要”；
- 继续以“团队规则 + 显式参数模板”为主线治理，避免一次性切换整个 shareable config 导致噪声突增。

## 缺口分类与补齐策略（2026-03-04）

已基于 `full-frontend-none-rules.csv` 生成结构化清单：

- `packages/lint-ruleset/mappings/full-frontend-gap-catalog.json`

当前 `none=14` 的分类如下：

- Stylelint（0）：
  - 已无缺口（剩余 30 条 option 规则已通过团队模板参数接入）。
- ESLint-缺陷（14）：
  - `14` 条：废弃（含规则名已在插件生态中移除或重命名）。

按“废弃合并口径”统计：

- `actionableNoneMergedDeprecated = 0`（`none=14` 全部并入废弃）。

本轮已“可用即启动”补齐四类规则（统一先以 `warning` 启动）：

- 可无参数启用的 Stylelint 规则：18 条；
- 可配置参数后启用的 Stylelint 规则：40 条；
- 剩余 30 条 Stylelint option 规则：已提供团队默认参数模板；
- 迁移到 `@stylistic/*` 可用的历史同名规则：63 条。
- TS Type-Aware 规则：45 条（通过 `eslint-type-aware` 导出 + admin 分模块 typed override 启用）。

第三方库建议（用于剩余缺口）：

- `@stylistic/stylelint-plugin`：承接 Stylelint core 移除的格式化类规则；
- `stylelint-config-standard-scss`：提供 option 型规则的社区参数基线；
- `@typescript-eslint/eslint-plugin + @typescript-eslint/parser`：Type-Aware 规则能力基础；
- `@stylistic/eslint-plugin`：承接 ESLint / typescript-eslint 迁移出的格式化规则。

废弃（含规则名移除/重命名）共 14 条：

- `@typescript-eslint/ban-types`
- `@typescript-eslint/member-delimiter-style`
- `@typescript-eslint/no-extra-parens`
- `@typescript-eslint/no-useless-template-literals`
- `@typescript-eslint/padding-line-between-statements`
- `@typescript-eslint/type-annotation-spacing`
- `vue/experimental-script-setup-vars`
- `vue/name-property-casing`
- `vue/no-confusing-v-for-v-if`
- `vue/no-unregistered-components`
- `vue/no-v-for-template-key`
- `vue/no-v-model-argument`
- `vue/valid-model-definition`
- `vue/valid-v-bind-sync`

说明：

- 其中官方 deprecated 为 4 条（上述 4 条 `vue/*`）；
- 另外 10 条为插件生态中已移除或重命名的旧规则名，按治理口径统一归并到“废弃”。

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
