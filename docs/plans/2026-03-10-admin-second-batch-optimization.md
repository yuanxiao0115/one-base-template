# Admin 第二批优化实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不改变现有业务行为的前提下，完成 admin 第二批可升级优化：守卫可读性提升、SSO 回调策略解耦、Vite mock 配置拆分。

**Architecture:**
- `packages/core`：拆分 `setupRouterGuards` 内部决策函数，保留对外 API 与行为。
- `apps/admin`：将 SSO 参数分支解析与执行下沉至策略模块，页面仅做状态驱动与错误展示。
- `apps/admin/vite.config.ts`：收敛为编排层，mock 细节下沉到 `build/mock` 子目录。

**Tech Stack:** Vue 3 + TypeScript + Vite + Vitest + Turborepo。

---

### 任务 1：守卫逻辑拆分与回归测试

**文件：**
- 修改：`packages/core/src/router/guards.ts`
- 新增：`packages/core/src/router/guards.test.ts`

**步骤：**
1. 提炼 `setupRouterGuards` 内部流程函数：公开路由判定、登录校验、菜单同步、系统切换、skipMenuAuth 严格校验。
2. 保持 `RouterGuardOptions` 与返回行为一致。
3. 增加核心分支测试：
   - `public/sso` 放行
   - 未登录跳转 login
   - `skipMenuAuth` 严格模式白名单放行/拦截
   - `menuStore.loaded + isAllowed` 直通

**验证：**
- `pnpm -C packages/core test:run src/router/guards.test.ts`
- `pnpm -C packages/core typecheck`

### 任务 2：SSO 回调策略解耦

**文件：**
- 新增：`apps/admin/src/shared/services/sso-callback-strategy.ts`
- 修改：`apps/admin/src/pages/sso/SsoCallbackPage.vue`
- 新增：`apps/admin/src/shared/services/__tests__/sso-callback-strategy.unit.test.ts`

**步骤：**
1. 抽离 sczfw 回调参数分支匹配（`zhxt/YDBG/ticket/type+token/moaToken/Usertoken`）到策略模块。
2. 页面保留 loading/status/error 展示，调用策略执行器拿到回调结果。
3. 用单测锁定策略顺序与无效参数报错。

**验证：**
- `pnpm -C apps/admin exec vitest run src/shared/services/__tests__/sso-callback-strategy.unit.test.ts`
- `pnpm -C apps/admin typecheck`

### 任务 3：Vite mock 中间件拆分

**文件：**
- 新增：`apps/admin/build/mock/*`
- 修改：`apps/admin/vite.config.ts`

**步骤：**
1. 把 `parseCookies/readJsonBody/json/ok/fail/setCookie` 等工具函数下沉到 mock helpers。
2. 把 `mockMiddleware` 主体迁移为独立模块并导出工厂函数。
3. `vite.config.ts` 仅保留插件编排与环境变量绑定，行为不变。

**验证：**
- `pnpm -C apps/admin build`

### 任务 4：文档与验证收口

**文件：**
- 修改：`apps/docs/docs/guide/development.md`（补充 Vite mock 拆分约定）
- 修改：`apps/docs/docs/guide/module-system.md`（补充守卫/SSO 策略约定）
- 修改：`.codex/operations-log.md`
- 修改：`.codex/testing.md`
- 修改：`.codex/verification.md`

**验证：**
- `pnpm -C packages/core lint`
- `pnpm -C apps/admin lint`
- `pnpm -C apps/admin build`
- `pnpm -C apps/docs lint`
- `pnpm -C apps/docs build`
