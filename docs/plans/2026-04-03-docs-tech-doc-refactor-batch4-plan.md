# docs 技术文档改造计划（Batch 4）

> 日期：2026-04-03  
> 作用域：`apps/docs/docs/guide/**`（内置组件 + 分层路线）  
> 执行顺序：`brainstorming -> technical-doc-collaboration -> write-markdown-tech-docs -> vitepress-doc-beauty`

## 背景

前三批已完成“核心入口页 + 角色入口页 + 规范页”改造，但仍存在两类剩余痛点：

1. `built-in-components.md` 偏速查，不够“拿来即执行”，缺少前置条件、验证口径与失败处理。
2. `levels/p2.md`、`levels/p4.md`、`levels/p6.md` 提供了路线信息，但执行闭环（前置条件、验收、FAQ）仍不完整。

## 受众与任务（technical-doc-collaboration）

| 受众               | 当前状态           | 本轮目标                     | 成功标准                              |
| ------------------ | ------------------ | ---------------------------- | ------------------------------------- |
| 新接手开发者（P2） | 能跑命令但不熟规则 | 30-45 分钟完成首个可验证闭环 | 按文档完成一次 `typecheck/lint/build` |
| 迭代开发者（P4）   | 能写功能但易返工   | 一次迭代稳定交付模块改造     | 路由/模块/文档同步且验证通过          |
| 维护治理者（P6）   | 负责规则与质量门禁 | 将规则沉淀为可执行流程       | 规则有证据、有门禁、有可追溯文档      |

## 本轮目标

1. 将 `built-in-components.md` 升级为“组件使用操作指南”，补齐执行闭环。
2. 将 P2/P4/P6 路线页统一为“读者可执行路径”，不是纯导航说明。
3. 保持最小差异改造，不调整导航结构，仅优化内容结构与可执行性。

## 范围

### In Scope

- `apps/docs/docs/guide/built-in-components.md`
- `apps/docs/docs/guide/levels/p2.md`
- `apps/docs/docs/guide/levels/p4.md`
- `apps/docs/docs/guide/levels/p6.md`

### Out of Scope

- 新增/修改 VitePress nav 与 sidebar 结构。
- 修改 `apps/admin` / `apps/admin-lite` / `packages/*` 业务代码。
- 全量重写其余 `guide/*.md` 页面。

## 执行步骤

1. **brainstorming**：确认每个页面的“读者任务 -> 最短闭环 -> 验收命令”。
2. **technical-doc-collaboration**：先写“适用范围、假设、非范围、维护触发条件”。
3. **write-markdown-tech-docs**：统一模板到 4 个页面（TL;DR、范围、前置、步骤、验证、FAQ、相关阅读）。
4. **vitepress-doc-beauty**：统一标题层级、步骤语义、表格风格与跨页链接。
5. 执行 docs 校验并回写 `.codex` 证据。

## 验收口径

在仓库根目录执行：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

通过标准：

1. 命令全部成功（`lint` 0 warning/0 error，`build` 成功）。
2. 四个目标页面具备统一执行型骨架。
3. 文档中的路径、命令与仓库现状一致（特别是 `OneUiObTablePlugin` 与 `Ob` 前缀链路）。

## 风险与控制

1. **风险**：文档示例与实际插件命名不一致。  
   **控制**：以 `apps/*/src/bootstrap/plugins.ts` 与 `packages/ui/src/plugin-obtable.ts` 为准核对。
2. **风险**：页面结构变化过大影响既有阅读习惯。  
   **控制**：采用最小差异改造，保留原有路由与核心内容顺序。
3. **风险**：遗漏验证记录，后续不可追溯。  
   **控制**：同步更新 `.codex/operations-log.md`、`.codex/testing.md`、`.codex/verification.md`、`.codex/verification/2026-04-03.md`。

## 完成定义（DoD）

1. 四个页面改造完成并可读可执行。
2. docs lint/build 通过。
3. `.codex` 记录更新完整。
4. 完成中文 commit，提交信息可表达本轮改造范围。
