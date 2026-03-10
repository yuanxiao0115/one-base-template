# Admin main.ts 插件扩展位 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不改 bootstrap 内核职责边界的前提下，为 `main.ts` 提供可直接 `app.use(...)` 的稳定扩展钩子。

**Architecture:** 通过 `@one-base-template/app-starter` 增加 `beforeMount` 扩展点，在 bootstrap 完成并返回 `{ app, router, pinia }` 后、mount 前执行。admin `startup.ts` 透传该钩子，`main.ts` 直接定义并使用该扩展回调。

**Tech Stack:** Vue 3、Pinia、Vue Router 4、TypeScript、Vitest、VitePress

---

### Task 1: 先写失败测试锁定扩展钩子透传

**Files:**
- Create: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/__tests__/startup.unit.test.ts`

**Step 1: 写测试**
- mock `@one-base-template/app-starter` 的 `startAppWithRuntimeConfig`
- 断言 `startAdminApp({ beforeMount })` 会把 `beforeMount` 透传给 `startAppWithRuntimeConfig`。

**Step 2: 运行测试确认先失败**
- `pnpm -C apps/admin exec vitest run src/bootstrap/__tests__/startup.unit.test.ts`

### Task 2: 实现 app-starter 与 admin startup 扩展钩子

**Files:**
- Modify: `/Users/haoqiuzhi/code/one-base-template/packages/app-starter/src/startup.ts`
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/startup.ts`

**Step 1: app-starter 增加 beforeMount 类型与执行时机**
- `StartAppWithRuntimeConfigOptions` 增加 `beforeMount?: (context) => void | Promise<void>`。
- 在 `bootstrap()` 返回后、`router.isReady()` 与 `app.mount()` 前执行。

**Step 2: admin startup 透传 beforeMount**
- `startAdminApp(options?)` 接收 `beforeMount`。
- 调用 `startAppWithRuntimeConfig` 时透传该参数。

### Task 3: 在 main.ts 直接开放 app.use 扩展入口

**Files:**
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/main.ts`

**Step 1: main.ts 注入 beforeMount 回调**
- 直接在 `main.ts` 定义扩展回调。
- 回调内保留“同事可在此使用 `app.use(...)`”的示例注释。

### Task 4: 同步文档与规则

**Files:**
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/admin/AGENTS.md`
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/docs/docs/guide/architecture.md`
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/docs/docs/guide/development.md`

**Step 1: 更新规则与文档口径**
- 说明 `main.ts` 允许通过 `beforeMount` 做插件扩展，避免直接改 `bootstrap/index.ts`。

### Task 5: 回归验证与记录

**Files:**
- Modify: `/Users/haoqiuzhi/code/one-base-template/.codex/operations-log.md`
- Modify: `/Users/haoqiuzhi/code/one-base-template/.codex/testing.md`
- Modify: `/Users/haoqiuzhi/code/one-base-template/.codex/verification.md`

**Step 1: 执行验证**
- `pnpm -C apps/admin exec vitest run src/bootstrap/__tests__/startup.unit.test.ts`
- `pnpm -C packages/app-starter typecheck`
- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin lint`
- `pnpm -C apps/admin test:run`
- `pnpm -C apps/admin build`
- `pnpm -C apps/docs lint`
- `pnpm -C apps/docs build`

**Step 2: 更新记录**
- 记录改动、命令结果与风险项。
