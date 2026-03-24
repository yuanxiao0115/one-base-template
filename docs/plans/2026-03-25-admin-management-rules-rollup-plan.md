# AdminManagement 终轮规则沉淀 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将多轮 `adminManagement` 走查中确认可复用的注意项沉淀到 `AGENTS.md` 与 docs，作为后续 agent 统一执行基线。

**Architecture:** 只补规则与说明，不改业务代码。规则主版本写入 `apps/admin/AGENTS.md`，可读说明同步到 `apps/docs/docs/guide/admin-agent-redlines.md` 与 `crud-module-best-practice.md`。

**Tech Stack:** Markdown、VitePress

---

### Task 1: 收敛规则主版本

**Files:**

- Modify: `apps/admin/AGENTS.md`

- [ ] 增补树/通讯录类弹窗的多链路请求守卫要求。
- [ ] 增补常规删除链路必须回到 `tableOpt.remove` / `actions.remove(row)` 的要求。
- [ ] 增补嵌套表单映射避免堆叠 `trimText/toNaturalNumber` 兜底的要求。
- [ ] 增补模板禁止内联箭头函数的适用范围扩展到弹窗/表单组件。

### Task 2: 同步 docs 说明

**Files:**

- Modify: `apps/docs/docs/guide/admin-agent-redlines.md`
- Modify: `apps/docs/docs/guide/crud-module-best-practice.md`

- [ ] 把规则主版本的新增注意项同步成可读版说明。
- [ ] 保持措辞和 `apps/admin/AGENTS.md` 一致，不生成第二份规则源。

### Task 3: 验证与记录

**Files:**

- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification/2026-03-25.md`

- [ ] 运行 `pnpm -C apps/docs lint`。
- [ ] 运行 `pnpm -C apps/docs build`。
- [ ] 记录本轮规则沉淀与验证结论。
