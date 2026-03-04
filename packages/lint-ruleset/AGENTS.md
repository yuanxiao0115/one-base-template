# AGENTS.MD（packages/lint-ruleset）

> 适用范围：`/Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset/**`
>
> 先遵循根规则：`/Users/haoqiuzhi/code/one-base-template/AGENTS.md`

## 核心职责

- 维护 `@one-base-template/lint-ruleset` 子包，提供无 Sonar 服务端场景下的可执行质量门禁。
- 输出 ESLint / Stylelint / Csslint 配置与规则映射产物，并保证可发布流程稳定。
- ESLint 规则必须按语言拆分在 `rules/eslint/js-rules.mjs`、`rules/eslint/ts-rules.mjs`、`rules/eslint/vue-rules.mjs` 维护，再由 `eslint.config.mjs` 统一引入。
- 平台抓取的 Vue deprecated 规则仅做追溯，禁止计入可治理缺口。
- 自定义 Csslint 兼容规则保持**单档策略**：`css037` 最小字号固定 `12px`，不引入严格档环境变量切换。

## 统计与汇报口径（必须）

- 规则统计与汇报必须区分“双口径”：
  - 前端全量（排除 Node.js）
  - Sonar + Csslint 子集
- 统计数字以 `packages/lint-ruleset/mappings/full-frontend-summary.json` 最新结果为准，禁止复用历史数字。
- 文档与汇报页出现统计数据时，必须同步核对 `mappings/full-frontend-*.csv` 与 `full-frontend-summary.json`。

## 发布与校验

- 改动规则后至少执行：
  - `pnpm -C packages/lint-ruleset lint:all`
- 需要重算映射时使用：
  - `pnpm -C packages/lint-ruleset mapping:full`（或对应脚本命令）
- 对外发布前需确认：`README`、`docs`、导出字段与脚本命令保持一致。

## 推荐验证命令（lint-ruleset）

```bash
pnpm -C packages/lint-ruleset lint:all
pnpm -C packages/lint-ruleset pack --dry-run
```
