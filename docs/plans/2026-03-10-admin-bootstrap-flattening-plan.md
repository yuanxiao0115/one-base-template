# Admin Bootstrap 链路压平 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 admin 启动链路压缩为最少中转路径，删除无价值薄壳文件并保持运行行为一致。

**Architecture:** 保持 `bootstrap/index.ts` 作为启动编排中心，保留 `http/core/plugins/adapter` 的职责边界，仅清理纯中转层（`admin-entry/router/guards`）。`startup.ts` 负责“加载运行时配置 + 样式入口 + 触发 bootstrap”。

**Tech Stack:** Vue 3、Pinia、Vue Router 4、Vite、Vitest、VitePress

---

### Task 1: 压缩启动入口链路

**Files:**

- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/startup.ts`
- Delete: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/admin-entry.ts`

**Step 1: 修改 `startup.ts`**

- 顶部导入 `./admin-styles`。
- 将 `bootstrap` 回调从 `import('./admin-entry')` 改为 `import('./index')`。
- 直接调用 `bootstrapAdminApp()`。

**Step 2: 删除 `admin-entry.ts`**

- 删除纯转发文件，避免无意义中转。

**Step 3: 快速验证**

Run: `pnpm -C apps/admin typecheck`
Expected: 通过。

### Task 2: 收敛 router 与 guards 薄壳中转

**Files:**

- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/index.ts`
- Delete: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/router.ts`
- Delete: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/guards.ts`

**Step 1: 在 `index.ts` 直接创建 router**

- 引入 `createRouter/createWebHistory`。
- 用 `routeAssemblyResult.routes + appEnv.baseUrl` 直接创建 router。

**Step 2: 在 `index.ts` 直接安装守卫**

- 引入 `setupRouterGuards`、`routePaths`、`guardPublicRoutePaths`。
- 直接传入 `allowedSkipMenuAuthRouteNames` 与 `onNavigationStart`。

**Step 3: 删除无引用文件**

- 删除 `bootstrap/router.ts`。
- 删除 `bootstrap/guards.ts`。

### Task 3: 同步规则与文档口径

**Files:**

- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/admin/AGENTS.md`
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/docs/docs/guide/architecture.md`
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/docs/docs/guide/env.md`
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/docs/docs/guide/theme-system.md`

**Step 1: 更新 AGENTS 规则口径**

- 将单启动链路描述从 `import('./bootstrap/admin-entry')` 更新为 `import('./bootstrap/index')`。

**Step 2: 更新文档链路描述**

- `architecture.md` 启动顺序改为直接动态导入 `bootstrap/index.ts`。
- `env.md` 启动顺序改为直接动态导入 `bootstrap/index.ts`。
- `theme-system.md` 的样式入口从 `bootstrap/admin-styles.ts` 改为 `bootstrap/startup.ts`。

### Task 4: 回归验证与记录

**Files:**

- Modify: `/Users/haoqiuzhi/code/one-base-template/.codex/operations-log.md`
- Modify: `/Users/haoqiuzhi/code/one-base-template/.codex/testing.md`
- Modify: `/Users/haoqiuzhi/code/one-base-template/.codex/verification.md`

**Step 1: 执行验证命令**

Run:

- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin lint:arch`
- `pnpm -C apps/admin lint`
- `pnpm -C apps/admin test:run`
- `pnpm -C apps/admin build`
- `pnpm -C apps/docs lint`
- `pnpm -C apps/docs build`

Expected: 全部通过。

**Step 2: 更新记录文件**

- 在 `.codex/operations-log.md` 记录本次压平动作与删除文件。
- 在 `.codex/testing.md` 记录验证命令与结果。
- 在 `.codex/verification.md` 写结论与剩余风险。
