# <Module Name> Standardization Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `<Module Name>` 按 admin 管理模块基线完成横向标准化整改。

**Architecture:** 页面只保留编排，字段映射、请求副作用、竞态防护与复杂交互下沉到语义明确的模块文件。规则主版本继续沿用 `AGENTS.md` 与 docs，不在模块内重新发明一套私有规范。

**Tech Stack:** Vue 3、TypeScript、Vite、Vitest（如目标模块已有测试）、VitePress。

---

## Chunk 1: 差异收敛

### Task 1: 盘点当前模块问题并冻结范围

**Files:**

- Modify: `docs/plans/YYYY-MM-DD-<module>-standardization-plan.md`
- Modify: `<target-module-files>`

- [ ] **Step 1: 列出精简 / 性能 / 稳定性 / 可维护性差异**
- [ ] **Step 2: 标记哪些规则应上提，哪些仅保留模块内**
- [ ] **Step 3: 明确本轮不做项，防止边做边扩**

## Chunk 2: 代码整改

### Task 2: 按页面编排、性能与稳定性拆分实施

**Files:**

- Modify: `<target-module-files>`
- Test: `<target-test-files>`

- [ ] **Step 1: 先写失败测试或补充可证明问题的验证用例（如适用）**
- [ ] **Step 2: 做最小实现，使页面结构与行为达到基线**
- [ ] **Step 3: 跑目标模块定向验证**

## Chunk 3: 文档与验证

### Task 3: 文档同步与门禁收口

**Files:**

- Modify: `apps/docs/docs/guide/*.md`
- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

- [ ] **Step 1: 同步规则与文档说明**
- [ ] **Step 2: 运行 admin/docs 验证命令**
- [ ] **Step 3: 复核 diff 范围并准备中文提交**
