# Admin 第三批优化实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在第二批基础上继续提升升级友好性与稳定性，完成 mock 模块化细化与关键边界测试补齐。

**Architecture:**
- `apps/admin/build/mock` 继续按“装配层 + handler + helper”拆分，降低后续冲突面。
- `packages/core` 补齐 remote 菜单守卫测试，锁定同步策略行为。
- `apps/admin` 补齐 SSO 策略边界测试，保证异常透传与参数兜底稳定。

**Tech Stack:** Vue 3 + TypeScript + Vite + Vitest + Turborepo。

---

### 任务 1：core guards remote 分支补测

**文件：**
- 修改：`packages/core/src/router/guards.test.ts`

**步骤：**
1. 新增 remote 模式下 `remoteSynced=false` 的两类场景：`loaded=true` 与 `loaded=false`。
2. 验证 `loadMenus` 触发策略与权限判定流程。

**验证：**
- `pnpm -C packages/core test:run src/router/guards.test.ts`

### 任务 2：SSO 策略边界补测

**文件：**
- 修改：`apps/admin/src/shared/services/__tests__/sso-callback-strategy.unit.test.ts`
- 可选修改：`apps/admin/src/shared/services/sso-callback-strategy.ts`

**步骤：**
1. 补充 `ticket` 场景 `redirectUrl` 缺省传值断言。
2. 补充 handler 抛错透传断言。

**验证：**
- `pnpm -C apps/admin exec vitest run src/shared/services/__tests__/sso-callback-strategy.unit.test.ts`

### 任务 3：admin mock 继续模块化拆分

**文件：**
- 修改：`apps/admin/build/mock/mock-middleware.ts`
- 新增：`apps/admin/build/mock/*`

**步骤：**
1. 抽离 HTTP helper 与路由 handler 子模块。
2. `mock-middleware.ts` 收敛为状态容器 + 装配入口。
3. 保持 dev mock 行为一致。

**验证：**
- `pnpm -C apps/admin build`

### 任务 4：文档与验证收口

**文件：**
- 修改：`apps/docs/docs/guide/development.md`
- 修改：`apps/docs/docs/guide/module-system.md`
- 修改：`.codex/operations-log.md`
- 修改：`.codex/testing.md`
- 修改：`.codex/verification.md`

**验证：**
- `pnpm -C packages/core typecheck`
- `pnpm -C packages/core lint`
- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin lint`
- `pnpm -C apps/admin build`
- `pnpm -C apps/docs lint`
- `pnpm -C apps/docs build`
