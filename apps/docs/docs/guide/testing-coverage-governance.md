# 测试与覆盖率门禁（组件库）

<div class="doc-tldr">
  <strong>TL;DR：</strong>组件库默认执行“单测必跑 + 覆盖率门禁 + 产物不入库”。本仓 `packages/ui` 已落地阈值：`Statements 85 / Branches 70 / Functions 85 / Lines 85`。
</div>

## 适用范围

- 适用目录：`/Users/haoqiuzhi/code/one-base-template/packages/ui/**`
- 适用场景：新增/修改 UI 组件、修复组件回归、发布前自测
- 目标读者：组件维护者、业务接入方、CI 维护者

## 1. 问题与价值

### 1.1 要解决的问题

1. 仅靠手工点页面无法稳定发现回归。
2. 只看“测试是否通过”无法衡量分支路径覆盖。
3. 覆盖率产物误提交会污染仓库历史并增加 review 成本。

### 1.2 本规范带来的价值

1. 把“是否可发布”收口到统一命令。
2. 将覆盖率阈值前置到测试阶段，避免上线后再补救。
3. 保持仓库干净，只提交可维护资产（测试代码与配置）。

## 2. 范围与非范围

### 2.1 范围内

1. `packages/ui` 的单元测试与覆盖率门禁。
2. `vitest` 覆盖率阈值配置与执行命令。
3. 测试产物（`coverage` 等）忽略策略。

### 2.2 非范围

1. E2E 自动化方案（Playwright/Cypress）。
2. 跨仓库统一 CI 流水线编排细节。
3. 业务应用（`apps/admin` 等）独立测试策略。

## 3. 当前门禁基线（2026-04-07）

`packages/ui/vitest.config.ts` 当前阈值如下：

| 指标       | 阈值 |
| ---------- | ---- |
| Statements | 85   |
| Branches   | 70   |
| Functions  | 85   |
| Lines      | 85   |

说明：分支覆盖率通常低于语句覆盖率，组件库在保证关键分支可测的前提下，`70%` 可作为可持续基线。

## 4. 最小可运行路径

在仓库根目录执行：

```bash
pnpm -C packages/ui typecheck
pnpm -C packages/ui lint
pnpm -C packages/ui test:run
pnpm -C packages/ui test:coverage
```

通过标准：

1. 四条命令全部 `exit code 0`。
2. `test:coverage` 报告中 `All files` 覆盖率不低于阈值。
3. 无新增未跟踪测试产物（见第 6 节）。

## 5. 命令参考（执行入口清单）

| 名称     | 命令                                | 预期输出                 |
| -------- | ----------------------------------- | ------------------------ |
| 类型检查 | `pnpm -C packages/ui typecheck`     | `vue-tsc --noEmit` 通过  |
| 代码检查 | `pnpm -C packages/ui lint`          | `0 warnings / 0 errors`  |
| 单测     | `pnpm -C packages/ui test:run`      | 全量测试通过             |
| 覆盖率   | `pnpm -C packages/ui test:coverage` | 输出覆盖率报告并满足阈值 |

## 6. 测试产物处理策略

默认策略：**测试产物不入库**。

已在根 `.gitignore` 忽略：

- `coverage` / `**/coverage`
- `.nyc_output` / `**/.nyc_output`
- `test-results` / `**/test-results`
- `playwright-report` / `**/playwright-report`
- `*.lcov`

建议：

1. 本地调试后可直接清理 `coverage` 目录。
2. 覆盖率 HTML 报告通过 CI artifact 留存，不进入 Git 历史。

## 7. 风险与限制

1. 当前仍可能出现 `vitest` 与 `@vitest/coverage-v8` 版本混用告警（非阻断），需要后续统一版本。
2. 覆盖率是质量信号，不等于用例有效性；关键交互仍需断言真实行为与边界分支。
3. 若组件发生重大重构，应先调整测试设计再微调阈值，避免“阈值迁就代码”。

## 8. 维护责任与触发条件

- 维护责任：`packages/ui` 维护者（前端基础能力维护组）。
- 触发更新：
  1. 覆盖率阈值调整。
  2. 测试命令或工具链变更。
  3. 测试产物策略变更（新增/删除忽略项）。

## 9. 相关阅读

- [开发规范与维护](/guide/development)
- [组件库（Ob 系列）](/components/)
