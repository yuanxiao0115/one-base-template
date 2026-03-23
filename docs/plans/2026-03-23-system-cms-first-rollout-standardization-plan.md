# SystemManagement + CmsManagement First Rollout Standardization Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 `admin-management-standardizer` 已沉淀规则并行推进 `SystemManagement` 与 `CmsManagement` 的首轮横向改造，优先收敛模板噪音、并发打开稳定性与可维护性。

**Architecture:** 保持两模块现有目录结构不变，采用最小改动策略：列表操作列去内联箭头；CRUD 打开入口统一下沉到显式 handler，并在 opening/submitting 态下短路，避免并发打开导致状态抖动。

**Tech Stack:** Vue 3、TypeScript、Vite Plus Test、VitePress。

---

## Chunk 1: 范围冻结

### Task 1: 确认首轮并行范围

**Files:**

- Create: `docs/plans/2026-03-23-system-cms-first-rollout-standardization-plan.md`

- [ ] **Step 1: 模块命中确认**

本轮仅覆盖：

- `apps/admin/src/modules/SystemManagement/menu/**`
- `apps/admin/src/modules/CmsManagement/content/**`

- [ ] **Step 2: 问题清单冻结**

- 列表操作列存在模板内联箭头事件，模板噪音高。
- CRUD 打开动作分散在模板内，调用路径不清晰。
- 连续触发 `openCreate/openEdit/openDetail` 时缺少 busy 短路保护，存在并发打开风险。

- [ ] **Step 3: 本轮不做项**

不调整 API 协议，不改 `useCrudPage/useEntityEditor` 内核行为，不做跨包抽象重构。

## Chunk 2: 并行代码改造

### Task 2: SystemManagement/menu 收口

**Files:**

- Modify: `apps/admin/src/modules/SystemManagement/menu/composables/useMenuManagementPageState.ts`
- Modify: `apps/admin/src/modules/SystemManagement/menu/list.vue`

- [ ] **Step 1: 去模板内联箭头**

移除操作列按钮与下拉命令中的 `() => ...` 写法，改为直接调用 handler。

- [ ] **Step 2: CRUD 打开动作加稳定性保护**

在 `openCreateDialog/openEditDialog` 内统一增加 `opening/submitting` 短路，避免并发打开。

### Task 3: CmsManagement/content 收口

**Files:**

- Modify: `apps/admin/src/modules/CmsManagement/content/list.vue`

- [ ] **Step 1: 去模板内联箭头**

移除操作列 `edit/detail/delete` 的内联箭头。

- [ ] **Step 2: 打开动作集中到脚本 handler**

新增 `openCreate/openDetail` 显式方法，模板仅调用动作，不直接调用 editor API。

- [ ] **Step 3: 打开动作加稳定性保护**

`openCreate/openEdit/openDetail` 在 `editor.opening/editor.submitting` 场景短路返回。

## Chunk 3: 规则上提与验证

### Task 4: 横向规则主版本同步

**Files:**

- Modify: `apps/admin/AGENTS.md`
- Modify: `apps/docs/docs/guide/admin-agent-redlines.md`

- [ ] **Step 1: 新增通用稳定性规则**

补充“CRUD 打开动作必须防并发触发（opening/submitting 早返回）”规则。

- [ ] **Step 2: 保持规则来源一致**

规则主版本写入 `apps/admin/AGENTS.md`，docs 可读版同步更新。

### Task 5: 门禁验证与提交

**Files:**

- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

- [ ] **Step 1: admin 验证**

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint:arch
pnpm -C apps/admin lint
pnpm -C apps/admin build
pnpm check:admin:bundle
```

- [ ] **Step 2: docs 验证**

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

- [ ] **Step 3: 提交策略**

按模块拆分中文提交（SystemManagement 一次、CmsManagement + 规则文档一次，或按最终 diff 组合）。
