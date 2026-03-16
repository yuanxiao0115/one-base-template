# Admin 第四批优化实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 补齐 admin 关键回归护栏并继续降低登录/SSO 与业务后端耦合，保证后续子项目复用与基建升级可控。

**Architecture:**

- 路由层新增 `redirect/registry` 关键单测，覆盖 baseUrl 兼容、enabledModules 过滤与告警分支。
- 认证层新增 `auth scenario provider`（`default/sczfw`），页面下沉为 UI 编排与状态展示。
- 保持现有业务行为不变，优先通过测试固化回归边界。

**Tech Stack:** Vue 3 + TypeScript + Vite + Vitest。

---

### 任务 1：补齐 router 关键单测护栏

**文件：**

- 新增：`apps/admin/src/router/__tests__/redirect.unit.test.ts`
- 新增：`apps/admin/src/router/__tests__/registry.unit.test.ts`

**步骤：**

1. `redirect.unit.test.ts` 覆盖 `getAppRedirectTarget` 的 fallback/baseUrl 去前缀/非法跳转兜底。
2. `registry.unit.test.ts` 覆盖 `enabledModules="*"`、空数组默认启用、重复/未知模块过滤与告警。
3. 确认不依赖运行态全局状态，测试可稳定重复执行。

**验证：**

- `pnpm -C apps/admin exec vitest run src/router/__tests__/redirect.unit.test.ts src/router/__tests__/registry.unit.test.ts`

### 任务 2：认证场景提供器解耦（default/sczfw）

**文件：**

- 新增：`apps/admin/src/shared/services/auth-scenario-provider.ts`
- 新增：`apps/admin/src/shared/services/__tests__/auth-scenario-provider.unit.test.ts`
- 修改：`apps/admin/src/pages/login/LoginPage.vue`
- 修改：`apps/admin/src/pages/sso/SsoCallbackPage.vue`

**步骤：**

1. 在 `auth-scenario-provider.ts` 抽象登录/SSO 场景分支：`resolveLoginScenario` + `executeSsoScenario`。
2. `LoginPage.vue` 移除 `backend===sczfw` 直接分支，改为 provider 输出驱动。
3. `SsoCallbackPage.vue` 移除场景细节拼装，统一通过 provider 返回结果并做页面层状态编排。
4. 新增 provider 单测，覆盖 default/sczfw 两类关键路径及异常分支。

**验证：**

- `pnpm -C apps/admin exec vitest run src/shared/services/__tests__/auth-scenario-provider.unit.test.ts src/shared/services/__tests__/sso-callback-strategy.unit.test.ts`

### 任务 3：回归与文档收口

**文件：**

- 修改：`apps/docs/docs/guide/module-system.md`
- 修改：`.codex/operations-log.md`
- 修改：`.codex/testing.md`
- 修改：`.codex/verification.md`

**步骤：**

1. 文档补充 auth scenario provider 的分层约定与扩展方式。
2. 补充本批操作、测试与验收记录。

**验证：**

- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin lint`
- `pnpm -C apps/admin build`
- `pnpm -C apps/docs lint`
- `pnpm -C apps/docs build`

### 任务 4：路由装配拆分 + dev fail-fast（第四批续）

**文件：**

- 新增：`apps/admin/src/router/route-assembly-validator.ts`
- 修改：`apps/admin/src/router/assemble-routes.ts`
- 修改：`apps/admin/src/router/types.ts`
- 修改：`apps/admin/src/bootstrap/index.ts`
- 新增：`apps/admin/src/router/__tests__/assemble-routes-policy.unit.test.ts`
- 修改：`apps/admin/src/router/__tests__/assemble-routes.unit.test.ts`

**步骤：**

1. 新增 `routeConflictPolicy` 参数，支持 `warn/fail-fast`。
2. 将路由冲突检测抽离到独立 `validator`，`assemble-routes` 只保留构造编排。
3. admin 在开发环境默认注入 `fail-fast`，生产维持 `warn` 兼容。
4. 补充冲突策略单测，覆盖 `fail-fast 抛错` 与 `warn+skip`。

**验证：**

- `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts src/router/__tests__/assemble-routes-policy.unit.test.ts`

### 任务 5：体积热点收敛（第四批续）

**文件：**

- 修改：`scripts/vite/manual-chunks.ts`
- 修改：`packages/ui/src/iconify/menu-iconify.ts`
- 修改：`packages/ui/src/iconify/menu-iconify.test.ts`

**步骤：**

1. 收紧 admin preload 阻断前缀：补 `iconify-ri-*` 与 `element-plus-*`（运行时入口）。
2. `menu-iconify` 默认前缀改为仅 `ep`，`ri` 保持按需加载。
3. 补测试锁定默认前缀行为。

**验证：**

- `pnpm -C packages/ui exec vitest run src/iconify/menu-iconify.test.ts`
- `pnpm -C apps/admin build`
