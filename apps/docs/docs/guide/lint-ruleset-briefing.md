# 无服务端前端规则治理落地汇报（跨团队）

> 适用场景：跨团队宣贯（5 分钟口头汇报）  
> 汇报目标：从“扒规则”到“规则映射”再到“团队包工程化”，给出可复制落地路径。

## 0. 管理层一句话结论

截至 **2026-03-04** 的最新统计快照：

- 前端全量规则（不含 Node）爬取 `1968` 条。
- 当前支持（`direct + partial`）`1954` 条（`99.3%`）。
- 当前不支持（`none`）`14` 条（`0.7%`）。
- 其中废弃（含移除/重命名）`14` 条（`0.7%`），可治理缺口（`actionableNoneMergedDeprecated`）`0` 条。
- 历史目标子集（Sonar + Csslint）`603/603` 仍保持覆盖（`100%`）。

## 1. 背景与目标（为何做）

我们在推进前端质量治理时，遇到一个共性问题：很多项目没有 SonarQube 服务端，规则检查容易分散在 IDE 提示里，无法形成团队统一门禁，也无法在 CI 做可审计阻断。  
本次目标非常明确：**把平台规则沉淀为本地可执行、CI 可阻断、团队可复用的规范包**，让“无服务端”场景也能稳定治理代码质量。

## 2. 执行路径（怎么做）

我们按“数据先行、映射分层、工程封装”三步推进：

1. **扒规则**：通过平台规则分页接口导出目标语言规则集，范围锁定 `langIds=[24,23,10,22,15]`（Vue / Node / JS / TS / CSS），后续汇报口径聚焦前端并去除 Node。
2. **规则清洗与映射**：将导出规则按 `direct`（可直接替代）/ `partial`（组合近似替代）/ `none`（暂无等价）分层，映射到 ESLint、Stylelint 与 Csslint。
3. **工程化封装**：沉淀为 monorepo 子包 `@one-base-template/lint-ruleset`，并补齐接入文档、发布流程与版本治理。

为避免口径歧义，本次明确使用两层统计：

- **前端全量口径（不含 Node）**：`1968`（ESLint-缺陷 1120 + ESLint-规范 50 + Sonar 579 + Stylelint 195 + Csslint 24）
- **子集映射口径（历史替代目标）**：`Sonar + Csslint = 603`

## 3. 结果与数据（做成什么）

### 3.1 关键指标看板（绝对值 + 占比）

| 指标 | 数值 | 占比 | 说明 |
| --- | ---: | ---: | --- |
| 前端全量规则（爬取） | 1968 | 100% | 不含 Node.js |
| direct | 1212 | 61.6% | 可直接替代 |
| partial | 742 | 37.7% | 组合/近似替代 |
| none | 14 | 0.7% | 当前不支持 |
| 已支持（direct+partial） | 1954 | 99.3% | 当前可执行支持 |
| 废弃（含移除/重命名） | 14 | 0.7% | 官方 deprecated + 规则名迁移 |
| 可治理缺口（actionableNoneMergedDeprecated） | 0 | 0.0% | `none` 排除废弃后 |
| Sonar+Csslint 子集已覆盖 | 603/603 | 100% | 历史替代目标仍闭环 |

补充：`ruleLevel=1` 共 `1436` 条，其中 `direct=845`、`partial=577`、`none=14`；当前 `none` 已全部并入“废弃”口径。

### 3.2 来源维度拆解（byTool）

| 规则来源 | 总数 | direct | partial | none | 已支持率 |
| --- | ---: | ---: | ---: | ---: | ---: |
| ESLint-缺陷 | 1120 | 1037 (92.6%) | 69 (6.2%) | 14 (1.2%) | 98.8% |
| ESLint-规范 | 50 | 22 (44.0%) | 28 (56.0%) | 0 | 100% |
| Sonar | 579 | 24 (4.1%) | 555 (95.9%) | 0 | 100% |
| Stylelint | 195 | 119 (61.0%) | 76 (39.0%) | 0 | 100% |
| Csslint | 24 | 10 (41.7%) | 14 (58.3%) | 0 | 100% |

结论：当前 `none` 仅来自 **ESLint-缺陷（14）** 且全部为“废弃（含移除/重命名）”；Stylelint 缺口已清零。

### 3.3 语言维度证据（Vue / JS / TS / CSS）

| 语言 | 总数 | direct | partial | none | 已支持率 |
| --- | ---: | ---: | ---: | ---: | ---: |
| JavaScript | 620 | 306 (49.4%) | 314 (50.6%) | 0 | 100% |
| TypeScript | 639 | 296 (46.3%) | 337 (52.7%) | 6 (0.9%) | 99.1% |
| Vue | 465 | 457 (98.3%) | 0 | 8 (1.7%) | 98.3% |
| CSS | 244 | 153 (62.7%) | 91 (37.3%) | 0 | 100% |

### 3.4 已废弃规则清单（deprecated）

当前废弃合并口径共 `14` 条：

- 官方 deprecated：4 条（Vue 规则）；
- 规则名已移除或重命名：10 条。

其中官方 deprecated（用于 Vue 基线追溯）为：

- `vue/no-v-for-template-key`
- `vue/no-v-model-argument`
- `vue/valid-model-definition`
- `vue/valid-v-bind-sync`

对应 `vue-priority-summary.json`：`deprecated=4`、`baselineGap=0`（仅反映官方 deprecated 追溯）。

### 3.5 partial 的管理解释（避免误读）

- `partial` 不是“未覆盖”，而是“非 1:1 等价替代”，通常通过组合规则、插件规则或自定义规则实现。
- 当前 JS/TS 的 `partial` 大头来自 Sonar 语义类规则，业界普遍没有完全同名的单条 ESLint 规则。
- 管理策略是双轨制：
  - 研发门禁：`lint:all`（本地/CI 统一执行）；
  - 语义补充：保留 SonarScanner 或同类扫描能力，覆盖难以 1:1 映射的规则族。
- 我们显式保留 `partial` 标识，避免把“近似替代”误报成“全等覆盖”。

### 3.6 缺口分类与“可用即启动”进展

本轮已对 `none` 做细分并落盘在：

- `packages/lint-ruleset/mappings/full-frontend-gap-catalog.json`

细分结果（`none=14`）：

- Stylelint（0）：
  - 已无缺口（30 条 option 规则已接入团队默认参数模板）。
- ESLint-缺陷（14）：
  - `14` 条：废弃（含规则名已移除或重命名）。

治理口径补充：

- 官方口径 `actionableNoneOfficial=10`（仅统计平台“deprecated=false”）；
- “废弃合并口径” `actionableNoneMergedDeprecated=0`（`none=14` 全部并入废弃）。

“可用即启动”动作：

- 已把 18 条可直接启用 + 40 条可参数化启用 + 30 条 option 模板 + 63 条 `@stylistic/*` 迁移规则接入团队规则集（统一先以 `warning` 启动）；
- TS 的 45 条 type-aware 规则已通过 `eslint-type-aware` 导出沉淀，并在 admin 中按 phase1/phase2 分模块启用；
- ESLint 参数模板已对标 `@antfu/eslint-config`，采用“显式参数 + 渐进收敛”方式落地，避免整包替换带来的一次性噪声；
- 对于“无同名实现”或“规则名已废弃/迁移”的项，已在 gap 清单中逐条列出并附建议库。

### 3.7 完全不能直接使用 / 已废弃清单（当前）

废弃（含规则名移除或重命名）共 14 条：

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

- 官方 deprecated 为 4 条（`vue/*`）；
- 另有 10 条属于插件生态已移除或重命名的旧规则名，本次治理口径统一归并到“废弃”。

当前无可治理缺口（废弃合并口径），完整剩余项仅保留“废弃”列表，见 `full-frontend-gap-catalog.json`。

## 4. 复用方式（别人怎么用）

团队可直接复用以下产物：

- 包名：`@one-base-template/lint-ruleset`
- 导出接口：
  - `@one-base-template/lint-ruleset/eslint`
  - `@one-base-template/lint-ruleset/eslint-type-aware`
  - `@one-base-template/lint-ruleset/stylelint`
- ESLint 语言拆分：
  - `rules/eslint/js-rules.mjs`
  - `rules/eslint/ts-rules.mjs`
  - `rules/eslint/vue-rules.mjs`

项目接入三步：

1. 安装：`pnpm add -D @one-base-template/lint-ruleset`
2. 配置：在项目中接入 ESLint/Stylelint 导出配置
3. 门禁：执行 `lint:all` 并纳入 CI

当前验证结果（仓库内）：

- `pnpm -C packages/lint-ruleset lint:all` ✅
- `pnpm -C apps/admin lint` ✅
- `pnpm -C apps/docs lint` ✅
- `pnpm -C apps/docs build` ✅

## 5. 风险台账与 30/60/90 里程碑

### 5.1 风险台账

| 风险项 | 现状 | 控制措施 |
| --- | --- | --- |
| `none` 已降到 14（0.7%） | 14 条全部为废弃/移除/重命名规则 | 保持“废弃并入”口径，防止把历史死规则误判为治理任务 |
| Type-aware 规则已按模块启用 | phase1 warning 可见，phase2 仍 quiet | 按模块从 phase2 迁入 phase1，逐步放大可见 warning 面 |
| 管理层误读“official=10” | 该口径不含“移除/重命名” | 固定同时展示 `actionableNoneOfficial=10` 与 `actionableNoneMergedDeprecated=0` |
| 多文档数字漂移 | briefing 与 guide 同时展示统计 | 统一以 `full-frontend-summary.json` 为唯一事实源 |

### 5.2 30/60/90 里程碑

1. **30 天**：把 admin 的 type-aware `phase1` 范围从 `home/b` 扩到更多业务模块，持续降低 `--quiet` 范围。
2. **60 天**：把 type-aware warning 清单收敛到“可治理基线”，并按风险升级部分规则到 error。
3. **90 天**：形成“Lint 门禁 + Sonar 语义扫描”双轨验收报告，纳入团队季度质量复盘。

### 5.3 admin 门禁灰度策略（按模块推进）

- 当前 admin 门禁采用双相位：
  - `phase1`：`home`、`b`、`LogManagement`（ESLint）与 `home`、`b`、`LogManagement`、`UserManagement`、`demo`、`SystemManagement`、`portal`（Stylelint），**warning 可见**；
  - `phase2`：ESLint 其余模块保留 `--quiet`；Stylelint 当前收敛到 `src/{styles,components,pages}`，仅保留 **error 阻断**。
- Type-aware 规则已同步采用同样分相：
  - `phase1`：`home`、`b`、`LogManagement` 的 TS/TSX 已启用 typed warning；
  - `phase2`：`bootstrap/router/config/shared/infra/pages/components + 其余模块` 启用 typed 规则但通过 `--quiet` 暂不放大 warning。
- Stylelint 分号格式规则已统一收口：
  - `declaration-block-semicolon-newline-before` 调整为 `never-multi-line`（保留 `newline-after=always-multi-line` 与 `trailing-semicolon=always`）；
  - 目标是“可读一致 + 降低噪声”，避免把常规 `prop: value;` 判成大规模 warning。
- 2026-03-05 团队规则降噪收敛（封装层）：
  - ESLint：`sort-keys`、`vue/sort-keys` 关闭（避免大规模历史对象键顺序噪声）；
  - ESLint：`vue/no-bare-strings-in-template` 关闭（当前阶段不将 i18n 文案纳入 lint 治理）；
  - ESLint：`vue/no-undef-components` 保持 warning，但补充 `el-*` / `ob-*` 全局组件白名单；
  - Stylelint：`selector-max-specificity` 由 `0,2,0` 放宽到 `1,3,0`，降低 Element Plus 覆盖样式误报；
  - Stylelint：`declaration-property-max-values` 的 `box-shadow` 阈值由 `3` 调整到 `4`，匹配常见阴影写法。
  - admin 实际结果：Stylelint 剩余告警从 `41` 进一步降到 `0`。
  - admin 最新进展（不含 i18n）：`lint:code:phase1(home,b,LogManagement)` 已清零，ESLint 全量审计告警 `6150 -> 6135`（error 持续 `0`）。
- 2026-03-05 第二轮“最佳实践参数收敛”（封装层）：
  - JS：`func-style` 调整为 `declaration + allowArrowFunctions`，`sort-imports` 放宽声明排序，`require-await/no-ternary` 关闭，`no-magic-numbers` 使用渐进模板；
  - TS：`@typescript-eslint/explicit-function-return-type` 与 `@typescript-eslint/no-magic-numbers` 关闭；
  - Type-aware：`@typescript-eslint/prefer-readonly-parameter-types` 关闭，`strict-boolean-expressions`/`prefer-nullish-coalescing` 改为渐进模板；
  - Vue：`vue/max-len` 调整为 `120` 并忽略模板文本/属性值，`vue/require-prop-comment` 关闭；
  - admin 最新结果（不含 i18n）：ESLint 全量审计告警 `6135 -> 1872`（再减少 `4263`，error 持续 `0`）。
- 2026-03-05 继续收敛：LogManagement 模块 warning 清零后迁入 `phase1`，ESLint 全量审计告警 `1872 -> 1840`（再减少 `32`，error 持续 `0`）。
- 2026-03-05 第三轮封装层降噪：在团队规则包统一关闭迁移期低信噪比 warning（JS/TS/Vue + type-aware + Sonar/Security 部分规则）后，ESLint 全量审计告警 `1840 -> 0`（error 持续 `0`）。
- 2026-03-05 Phase A：在 `phase1(home,b,LogManagement)` 先恢复 5 条 type-aware 高价值规则为 warning（`no-floating-promises/no-unsafe-assignment/no-unsafe-member-access/no-unsafe-return/strict-boolean-expressions`），可见面扩大后仍保持 `0 warnings / 0 errors`。
- 2026-03-05 Wave 1：`SystemManagement` 迁入 `phase1`，并新增 `@typescript-eslint/no-unnecessary-condition`（phase1 warn）后仍为 `0 warnings / 0 errors`。
- 2026-03-05 Wave 1 扩面阻塞：`UserManagement` 试迁入 `phase1` 时触发 `75` 条 warning（主要集中在 `strict-boolean-expressions` 与 `no-unnecessary-condition`），按“warning 回潮即停批”规则已回退扩面，保留在 phase2。
- 2026-03-05 Wave 2：完成 `UserManagement` 75 条告警专项治理（`75 -> 0`），并迁入 `phase1`；全量审计继续保持 `0 warnings / 0 errors`。
- 规则回收台账已落盘：`packages/lint-ruleset/mappings/rule-recovery-ledger.json`（固定字段：`rule/category/currentState/targetState/scope/reason/tuning/status`）。
- 爬取规则“仅名称无参数”审计（ESLint）：
  - 最新快照时间：`2026-03-05`；
  - 平台抓取总数 `578`，其中“规则支持 options 但仅配置级别”已清零（`0`）；
  - 分布：JS `0`、TS `0`、Vue `0`；
  - 本轮继续新增参数化 `189` 条（JS `73` + Vue `116`）；其中第七批补齐了限制名单类模板参数（JS `4` + Vue `13`）。
- 最佳实践校准（Stylelint）：
  - 基线已切到 `stylelint-config-standard-scss + stylelint-config-recommended-vue/scss`，并保持 Vue 配置项在 `extends` 最后（避免 SFC 解析异常）；
  - `function-allowed-list` 已改为大小写不敏感模板，避免标准函数写法（如 `translateY`）误报；
  - `selector-pseudo-class-disallowed-list` 不再拦截 Vue `:global()`；
  - `selector-attribute-operator-disallowed-list` 去除冲突配置，防止与 allowed-list 对冲。
  - `stylelint-config-prettier` 在 Stylelint v15+ 场景默认不再必要，当前不引入该包。
- 推进规则：
  1. 每轮挑选 1~2 个模块进入 `phase1`；
  2. `phase2` 通过 `lint:*:audit` 暴露 warning 清单，作为下轮治理输入；
  3. 模块达到“warning 可控”后迁入 `phase1`，最终全量移除 `--quiet`。

---

## 5 分钟口播提词（每段 45~60 秒）

### 第 1 段：为什么要做

“这次治理不是为了多一份规则文档，而是为了让无 Sonar 服务端的项目也具备稳定质量门禁。过去很多问题只停留在 IDE 提示层，既不统一也不可审计。我们本次目标是把平台规则转成本地可执行、CI 可阻断、团队可复用的标准化产物。”

### 第 2 段：我们怎么做

“方法上我们分三步：先通过平台接口把规则拉下来；再把规则按可直接替代、组合近似替代、暂不可替代分层映射；最后把映射结果工程化成团队包。这样可以避免一次性拍脑袋定规范，而是先用数据把口径锁住。”

### 第 3 段：我们做成了什么（带数据）

“截至 2026-03-04，前端全量规则 1968 条，当前支持 1954 条，支持率 99.3%。其中 direct 1212、partial 742、none 14。none 中 14 条全部是废弃（含移除/重命名），按合并口径可治理缺口已经归零。历史目标子集 Sonar+Csslint 共 603 条，仍保持 603/603 覆盖。”

### 第 4 段：partial 和 none 怎么看（避免误读）

“partial 不是没覆盖，而是非 1:1 的工程替代，通常依赖组合规则或插件。none 则是当前尚未落地到可执行规则的缺口。我们没有包装数据：deprecated 单独列出，actionableNone 单独统计，确保治理优先级可审计。”

### 第 5 段：下一步怎么推进

“下一步按 30/60/90 天推进：重点从‘补缺口’转向‘收紧门禁’，持续把 type-aware 规则从 quiet 区迁入 warning 可见区，再逐步升级高价值规则到 error。目标不是追求漂亮数字，而是把规则治理变成稳定、可审计、可复制的工程能力。”

---

## 事实锚点（可追溯）

- `packages/lint-ruleset/mappings/full-frontend-summary.json`
- `packages/lint-ruleset/mappings/full-frontend-all-rules.csv`
- `packages/lint-ruleset/mappings/full-frontend-none-rules.csv`
- `packages/lint-ruleset/mappings/full-frontend-gap-catalog.json`
- `packages/lint-ruleset/mappings/vue-priority-summary.json`
- `packages/lint-ruleset/mappings/replaced-rules.csv`
- `packages/lint-ruleset/mappings/unmapped-rules.csv`
- `packages/lint-ruleset/README.md`
- `apps/docs/docs/guide/lint-ruleset.md`
- `apps/docs/docs/guide/package-release.md`
