# App Starter + 架构门禁 + CI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 `admin/portal/template` 的启动链路统一为可复用基建能力，并补齐可升级的架构门禁与 CI 验证链路。

**Architecture:**
- 新增 `packages/app-starter` 作为跨应用启动与 runtime config 加载基建层。
- admin 保持 `Ultracite + Biome` 体系，架构边界由 `lint:arch` 脚本门禁，不引入新的 ESLint 子配置。
- 根任务与 CI 统一串联 `lint:arch -> test:run -> typecheck -> lint -> build`，降低跨子项目升级回归风险。

**Tech Stack:** Vue 3 + Vite + Vitest + Turborepo + GitHub Actions。

---

### Task 1: 启动链路统一到 app-starter

**Files:**
- Modify: `apps/admin/src/bootstrap/startup.ts`
- Modify: `apps/portal/src/main.ts`
- Modify: `apps/template/src/main.ts`
- Modify: `apps/admin/package.json`
- Modify: `apps/portal/package.json`
- Modify: `apps/template/package.json`

**Step 1: 接入统一启动 helper**
- 三端入口改为通过 `startAppWithRuntimeConfig()` 编排：先加载运行时配置，再 bootstrap，再 `router.isReady()` 后挂载。

**Step 2: 接入依赖**
- 三个 app 的 `dependencies` 增加 `@one-base-template/app-starter: workspace:*`。

### Task 2: 补齐测试与架构门禁

**Files:**
- Add: `apps/admin/vitest.config.ts`
- Add: `scripts/check-admin-arch.mjs`
- Modify: `apps/admin/package.json`
- Modify: `package.json`
- Modify: `turbo.json`

**Step 1: 补 test/test:run**
- admin 增加 `test` / `test:run` 脚本与 Vitest 配置。

**Step 2: 补 lint:arch（Biome 体系）**
- 使用仓库脚本 `scripts/check-admin-arch.mjs` 检查模块边界、env 读取边界、启动边界。
- 根脚本与 admin 子项目脚本均可直接执行。

### Task 3: 补 CI 骨架

**Files:**
- Add: `.github/workflows/ci.yml`

**Step 1: 串联验证链路**
- 新增 CI workflow，执行顺序：
  - `pnpm install --frozen-lockfile`
  - `pnpm lint:arch`
  - `pnpm test:run`
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm build`

### Task 4: 文档与规则同步

**Files:**
- Modify: `apps/docs/docs/guide/architecture.md`
- Modify: `apps/docs/docs/guide/development.md`
- Modify: `apps/docs/docs/guide/quick-start.md`
- Modify: `README.md`
- Modify: `apps/admin/README.md`
- Modify: `apps/admin/AGENTS.md`

**Step 1: 文档更新**
- 补充 `packages/app-starter` 定位、统一启动顺序、`lint:arch/test:run` 命令说明。

**Step 2: 规则落盘**
- 在 `apps/admin/AGENTS.md` 明确：admin 架构门禁统一使用 `lint:arch` 脚本，禁止再新增 ESLint 架构门禁配置。

### 验证命令

```bash
pnpm -C apps/admin lint:arch
pnpm -C apps/admin test:run
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/admin build
pnpm -C apps/portal typecheck
pnpm -C apps/template typecheck
pnpm lint:arch
pnpm test:run
pnpm typecheck
pnpm lint
pnpm build
```
