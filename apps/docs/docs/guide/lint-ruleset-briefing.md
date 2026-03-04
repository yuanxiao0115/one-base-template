# 无服务端前端规则治理落地汇报（跨团队）

> 适用场景：跨团队宣贯（5 分钟口头汇报）  
> 汇报目标：从“扒规则”到“规则映射”再到“团队包工程化”，给出可复制落地路径。

## 0. 管理层一句话结论

截至 **2026-03-04** 的统计快照：

- 前端全量规则（不含 Node）`1968` 条，已覆盖 `1964` 条（`99.8%`）。
- 仅剩 `none=4`（`0.2%`），且均为 Vue 官方 deprecated 规则。
- 可治理缺口（`actionableNone`）为 `0`。
- 历史目标子集（Sonar + Csslint）`603/603` 已覆盖（`100%`）。

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
| 前端全量规则 | 1968 | 100% | 不含 Node.js |
| direct | 1295 | 65.8% | 可直接替代 |
| partial | 669 | 34.0% | 组合/近似替代 |
| none | 4 | 0.2% | 仅 4 条 Vue deprecated |
| 已覆盖（direct+partial） | 1964 | 99.8% | 当前可执行覆盖 |
| 可治理缺口（actionableNone） | 0 | 0.0% | 排除 deprecated 后 |
| Sonar+Csslint 子集已覆盖 | 603/603 | 100% | 历史替代目标已闭环 |

补充：`ruleLevel=1` 共 `1436` 条，其中 `direct=924`（64.3%）、`partial=508`（35.4%）、`none=4`（0.3%）；这 4 条 `none` 全部为 deprecated 追溯项。

### 3.2 来源维度拆解（byTool）

| 规则来源 | 总数 | direct | partial | none | 已覆盖率 |
| --- | ---: | ---: | ---: | ---: | ---: |
| ESLint-缺陷 | 1120 | 1116 (99.6%) | 0 | 4 (0.4%) | 99.6% |
| ESLint-规范 | 50 | 22 (44.0%) | 28 (56.0%) | 0 | 100% |
| Sonar | 579 | 24 (4.1%) | 555 (95.9%) | 0 | 100% |
| Stylelint | 195 | 123 (63.1%) | 72 (36.9%) | 0 | 100% |
| Csslint | 24 | 10 (41.7%) | 14 (58.3%) | 0 | 100% |

结论：当前 `none` 仅存在于 `ESLint-缺陷/Vue` 的 deprecated 历史项，不构成可治理缺口。

### 3.3 语言维度证据（Vue / JS / TS）

| 语言 | 总数 | direct | partial | none | 已覆盖率 |
| --- | ---: | ---: | ---: | ---: | ---: |
| JavaScript | 620 | 306 (49.4%) | 314 (50.6%) | 0 | 100% |
| TypeScript | 639 | 371 (58.1%) | 268 (41.9%) | 0 | 100% |
| Vue | 465 | 461 (99.1%) | 0 | 4 (0.9%) | 99.1% |

Vue 的 4 条 `none` 明细（均为 deprecated）：

- `vue/no-v-for-template-key`
- `vue/no-v-model-argument`
- `vue/valid-model-definition`
- `vue/valid-v-bind-sync`

对应 `vue-priority-summary.json`：`deprecated=4`、`baselineGap=0`。

### 3.4 partial 的管理解释（避免误读）

- `partial` 不是“未覆盖”，而是“非 1:1 等价替代”，通常通过组合规则、插件规则或自定义规则实现。
- 当前 JS/TS 的 `partial` 大头来自 Sonar 语义类规则，业界普遍没有完全同名的单条 ESLint 规则。
- 管理策略是双轨制：
  - 研发门禁：`lint:all`（本地/CI 统一执行）；
  - 语义补充：保留 SonarScanner 或同类扫描能力，覆盖难以 1:1 映射的规则族。
- 我们显式保留 `partial` 标识，避免把“近似替代”误报成“全等覆盖”。

## 4. 复用方式（别人怎么用）

团队可直接复用以下产物：

- 包名：`@one-base-template/lint-ruleset`
- 导出接口：
  - `@one-base-template/lint-ruleset/eslint`
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
- `pnpm -C apps/docs lint` ✅
- `pnpm -C apps/docs build` ✅
- `pnpm -C packages/lint-ruleset pack --dry-run` ✅

## 5. 风险台账与 30/60/90 里程碑

### 5.1 风险台账

| 风险项 | 现状 | 控制措施 |
| --- | --- | --- |
| partial 占比高（34.0%）被误解为“弱覆盖” | 主要来自 Sonar 语义类规则 | 汇报中明确 `partial` 定义；保留 Sonar 补充扫描 |
| 管理层误读“none=4” | 4 条均为 deprecated 追溯项 | 固定展示 `actionableNone=0` 与 `baselineGap=0` |
| 多文档数字漂移 | briefing 与 guide 同时展示统计 | 统一以 `full-frontend-summary.json` 为唯一事实源 |

### 5.2 30/60/90 里程碑

1. **30 天**：完成 `partial` 风险分级清单（高危阻断/中危观察/低危告警）并冻结口径。
2. **60 天**：优先补齐高价值 `partial` 的自定义规则实现，优先 JSxxx 与安全类规则。
3. **90 天**：形成“Lint 门禁 + Sonar 语义扫描”双轨验收报告，纳入团队季度质量复盘。

---

## 5 分钟口播提词（每段 45~60 秒）

### 第 1 段：为什么要做

“这次治理不是为了多一份规则文档，而是为了让无 Sonar 服务端的项目也具备稳定质量门禁。过去很多问题只停留在 IDE 提示层，既不统一也不可审计。我们本次目标是把平台规则转成本地可执行、CI 可阻断、团队可复用的标准化产物。”

### 第 2 段：我们怎么做

“方法上我们分三步：先通过平台接口把规则拉下来；再把规则按可直接替代、组合近似替代、暂不可替代分层映射；最后把映射结果工程化成团队包。这样可以避免一次性拍脑袋定规范，而是先用数据把口径锁住。”

### 第 3 段：我们做成了什么（带数据）

“截至 2026-03-04，前端全量规则 1968 条，已覆盖 1964 条，覆盖率 99.8%。其中 direct 1295、partial 669、none 4。none 的 4 条全部是 Vue deprecated 追溯项，所以可治理缺口是 0。历史目标子集 Sonar+Csslint 共 603 条，已实现 603/603 全覆盖。”

### 第 4 段：partial 怎么看（避免误读）

“partial 不是没覆盖，而是非 1:1 的工程替代，通常依赖组合规则或插件。我们没有把 partial 包装成 direct，而是显式标注，保证数据真实。同时通过 Lint 门禁 + Sonar 补充扫描，确保语义风险不漏检。”

### 第 5 段：下一步怎么推进

“下一步按 30/60/90 天推进：先完成 partial 风险分级，再补齐高价值自定义规则，最后输出双轨验收报告。目标不是追求漂亮数字，而是把规则治理变成稳定、可审计、可复制的工程能力。”

---

## 事实锚点（可追溯）

- `packages/lint-ruleset/mappings/full-frontend-summary.json`
- `packages/lint-ruleset/mappings/full-frontend-all-rules.csv`
- `packages/lint-ruleset/mappings/vue-priority-summary.json`
- `packages/lint-ruleset/mappings/replaced-rules.csv`
- `packages/lint-ruleset/mappings/unmapped-rules.csv`
- `packages/lint-ruleset/README.md`
- `apps/docs/docs/guide/lint-ruleset.md`
- `apps/docs/docs/guide/package-release.md`
