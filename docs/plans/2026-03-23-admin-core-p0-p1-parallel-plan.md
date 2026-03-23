# Admin Core P0+P1 并行锤炼实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不触碰业务语义的前提下，并行完成 `packages/core` 与 `apps/admin` 基础架构锤炼，收敛通用守卫、路由装配可观测性与启动链路稳定性。

**Architecture:** P0 聚焦 core 可复用基建（时序守卫与契约回归）；P1 聚焦 admin 启动与路由装配编排（确定性签名与性能打点）。两条泳道并行开发，主线程统一验收并提交。

**Tech Stack:** Vue 3、TypeScript、Vite Plus Test、Vite Plus Lint、Vite Build。

---

## Chunk 1: 范围冻结

### Task 1: 并行范围与切入点确认

**Files:**

- Create: `docs/plans/2026-03-23-admin-core-p0-p1-parallel-plan.md`

- [ ] **Step 1: P0 core 范围**

- `packages/core/src/utils/**`
- `packages/core/src/config/platform-config.test.ts`
- `packages/core/src/index.ts`

- [ ] **Step 2: P1 admin 范围**

- `apps/admin/src/router/assemble-routes.ts`
- `apps/admin/src/router/__tests__/assemble-routes.unit.test.ts`
- `apps/admin/src/bootstrap/index.ts`
- `apps/admin/src/bootstrap/**`（新增打点工具与单测）

- [ ] **Step 3: 非目标范围冻结**

- 不改 `apps/admin/src/modules/**` 业务模块行为。
- 不改 adapters 协议字段，不引入新后端假设。

## Chunk 2: 并行实施

### Task 2: P0 core 通用守卫与契约回归

**Files:**

- Add: `packages/core/src/utils/latest-request-guard.ts`
- Add: `packages/core/src/utils/latest-request-guard.test.ts`
- Modify: `packages/core/src/index.ts`
- Modify: `packages/core/src/config/platform-config.test.ts`

- [ ] **Step 1: 新增 core 通用 latest-request 守卫**

提供统一 `next/isLatest/invalidate` 契约，避免上层重复实现同构 token 逻辑。

- [ ] **Step 2: 暴露公共导出**

通过 `packages/core/src/index.ts` 对外导出守卫工具与类型。

- [ ] **Step 3: 补齐契约与边界测试**

- `latest-request-guard`：初始化、递增、失效、最新判断。
- `platform-config`：补强已存在规则的回归覆盖（不新增破坏性行为）。

### Task 3: P1 admin 路由装配确定性与启动打点

**Files:**

- Add: `apps/admin/src/router/route-assembly-signature.ts`
- Add: `apps/admin/src/router/__tests__/route-assembly-signature.unit.test.ts`
- Modify: `apps/admin/src/router/assemble-routes.ts`
- Modify: `apps/admin/src/router/__tests__/assemble-routes.unit.test.ts`
- Add: `apps/admin/src/bootstrap/startup-profiler.ts`
- Add: `apps/admin/src/bootstrap/__tests__/startup-profiler.unit.test.ts`
- Modify: `apps/admin/src/bootstrap/index.ts`

- [ ] **Step 1: 路由装配诊断信息**

`assemble-routes` 返回 `diagnostics`（如 `routeCount/skipMenuAuthCount/signature`），用于确定性回归与观测。

- [ ] **Step 2: 启动链路性能打点**

新增轻量 `startup-profiler`，在 `bootstrap/index.ts` 记录关键阶段耗时（装配路由、创建 HTTP、安装 core、守卫安装）。

- [ ] **Step 3: 单测收口**

补齐签名稳定性与打点工具单测，保证行为可回归。

## Chunk 3: 验证与提交

### Task 4: 门禁回归

**Files:**

- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

- [ ] **Step 1: core 门禁**

```bash
pnpm -C packages/core test
pnpm -C packages/core typecheck
pnpm -C packages/core lint
```

- [ ] **Step 2: admin/docs 门禁**

```bash
pnpm -C apps/admin test:run
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint:arch
pnpm -C apps/admin lint
pnpm -C apps/admin build
pnpm check:admin:bundle
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

### Task 5: 分模块中文提交

**Files:**

- Commit 1: core P0 相关文件
- Commit 2: admin P1 相关文件
- Commit 3: 计划与验证记录（如有）

- [ ] **Step 1: 按改动域拆提交**
- [ ] **Step 2: 提交后复核 `git status` 清洁**
