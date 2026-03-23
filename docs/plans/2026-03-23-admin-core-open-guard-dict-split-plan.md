# Admin Core Open Guard + Dict Split Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 并行完成 admin 下一阶段治理：`SystemManagement/dict` 技术债拆分、`packages/core` 统一弹窗并发打开保护、以及集中回归验证收口。

**Architecture:** 保持现有模块边界不变，在 `core` 增加统一能力后由页面层消费，优先删除重复页面 guard 逻辑，降低维护成本并保持行为一致。

**Tech Stack:** Vue 3、TypeScript、Vite Plus Test、VitePress。

---

## Chunk 1: 范围冻结

### Task 1: 并行范围确认

**Files:**

- Create: `docs/plans/2026-03-23-admin-core-open-guard-dict-split-plan.md`

- [ ] **Step 1: 目标范围**

- `apps/admin/src/modules/SystemManagement/dict/**`
- `packages/core/src/hooks/useEntityEditor/**`
- `apps/admin/src/modules/SystemManagement/menu/**`
- `apps/admin/src/modules/CmsManagement/content/**`
- `apps/admin/src/modules/CmsManagement/column/**`

- [ ] **Step 2: 问题清单**

- `useDictPageState.ts` 体量偏大，超出可维护阈值。
- 并发打开 guard 目前分散在页面层，重复实现。
- 需要集中验证本轮推广后的关键管理页链路稳定性。

## Chunk 2: 并行实施

### Task 2: Dict 模块结构拆分

**Files:**

- Modify: `apps/admin/src/modules/SystemManagement/dict/composables/useDictPageState.ts`
- Add/Modify: `apps/admin/src/modules/SystemManagement/dict/composables/*.ts`
- Modify: `apps/admin/src/modules/SystemManagement/dict/list.vue`（仅适配必要变更）

- [ ] **Step 1: 按职责拆分**

把 table/search、dict editor actions、item editor actions、setting dialog actions 拆到独立 composable/helper。

- [ ] **Step 2: 保持对外契约稳定**

`pageState.refs/table/editor/setting/actions` 的消费方式保持稳定，页面改动最小化。

### Task 3: Core 统一并发打开保护

**Files:**

- Modify: `packages/core/src/hooks/useEntityEditor/index.ts`
- Modify: `packages/core/src/hooks/useEntityEditor/types.ts`（如需）
- Modify: `packages/core/src/hooks/useEntityEditor/index.test.ts`

- [ ] **Step 1: 在 core 层实现并发打开短路**

`openCreate/openEdit/openDetail` 进入时若 `opening/submitting` 为 true，直接返回。

- [ ] **Step 2: 单测补齐**

覆盖 opening/submitting 场景下重复 open 不生效。

### Task 4: 清理页面重复 busy guard

**Files:**

- Modify: `apps/admin/src/modules/SystemManagement/menu/composables/useMenuManagementPageState.ts`
- Modify: `apps/admin/src/modules/CmsManagement/content/list.vue`
- Modify: `apps/admin/src/modules/CmsManagement/column/list.vue`

- [ ] **Step 1: 删除重复 guard**

保留显式 handler，可读性不降级；移除仅为并发短路而写的重复逻辑。

## Chunk 3: 验证与提交

### Task 5: 集中回归验证

**Files:**

- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

- [ ] **Step 1: core 验证**

```bash
pnpm -C packages/core test
pnpm -C packages/core typecheck
pnpm -C packages/core lint
```

- [ ] **Step 2: admin/docs 验证**

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint:arch
pnpm -C apps/admin lint
pnpm -C apps/admin build
pnpm check:admin:bundle
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

- [ ] **Step 3: 提交策略**

按“dict 拆分 / core 能力 / 页面去重与回归”拆分中文提交。
