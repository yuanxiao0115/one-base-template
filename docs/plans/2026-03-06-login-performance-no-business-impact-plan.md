# Admin 登录页性能优化实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不改变登录、SSO、菜单、权限与业务页行为的前提下，显著降低 `apps/admin` 访问 `/login` 时的首屏加载体量与冷启动耗时。

**Architecture:** 采用“公共匿名页轻量启动 + 业务壳保持原样”的分层方案。首轮只隔离 `/login` 与 `/sso` 的启动链路，不改登录组件协议、不改后端接口、不改已登录后的业务路由装配；后续再按收益决定是否继续收敛全量模块注册。

**Tech Stack:** Vite 8、Vue 3、Vue Router 4、Pinia、Element Plus、`@one-base-template/ui`、`@one-base-template/core`

---

## 约束与验收口径

- **硬约束 1：不影响业务**
  - 不改登录接口、SSO 参数、token 存储 key、验证码协议、登录成功后的目标路由。
  - 不改已登录业务页的菜单、权限、Layout、Tabs、Table、Portal 等现有行为。
  - 不引入后端接口变更，不要求菜单数据配合调整。
- **硬约束 2：可回退**
  - 保留现有完整 `bootstrapAdminApp()` 启动链路作为业务页主路径。
  - 本次只给公共匿名路由切轻量启动，出现异常时可快速回退到旧启动方式。
- **验收指标**
  - `/login` 冷启动请求数、脚本体积、FCP/LCP 明显下降。
  - `/login`、`/sso`、账号密码登录、直登 token、ticket SSO、外部 SSO、登录后跳转全部与当前行为一致。
  - `pnpm -C apps/admin typecheck`、`pnpm -C apps/admin build`、`pnpm -C apps/docs build` 通过。

## 推荐方案与取舍

### 方案 A（推荐）：公共匿名页轻量启动

- 在 `apps/admin/src/main.ts` 根据当前路径判断：若命中 `/login` 或 `/sso`，只加载轻量 bootstrap。
- 轻量 bootstrap 仅注册公共页面所需能力：
  - 公共路由
  - `registerOneLiteUiComponents()`
  - 登录/SSO 页依赖的最小上下文
- 已登录进入业务页时，仍走现有完整 admin bootstrap。

**优点**
- 只影响匿名页启动，不动业务主链路，风险最低。
- 能直接绕开当前最重的两类开销：全量模块 registry、全量 UI 壳注册。

**代价**
- 需要维护两条启动链路：`public bootstrap` 与 `admin bootstrap`。

### 方案 B（备选）：继续单启动链路，但把模块与 UI 入口全部改成惰性

- 在现有 bootstrap 内部继续保留单 app，只把模块注册和 UI 重组件改成按需加载。

**优点**
- 架构更统一。

**代价**
- 需要改动 `router/registry`、`module.ts`、`routes.ts`、`@one-base-template/ui` 入口，牵涉面大，验证成本高。
- 比方案 A 更容易误伤业务页。

**结论**
- **先做方案 A**，把 `/login` 首屏问题从业务主壳中剥离出来；若收益不足，再评估方案 B 的第二阶段优化。

## 实施阶段

### Task 1：冻结现状并补齐回归基线

**Files:**
- Modify: `docs/plans/2026-03-06-login-performance-no-business-impact-plan.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

**Step 1: 记录当前性能基线**

- 记录当前已确认的数据：
  - dev `/login` 冷启动约 `534` 请求 / `11.7 MB`
  - Lighthouse（dev）桌面端约 `FCP 6.9s / LCP 13.5s`
  - 主要浪费来自 `vxe-table`、`vxe-pc-ui`、全量 UI 壳与业务模块页面预载

**Step 2: 冻结功能回归清单**

- 登录场景必须逐项验证：
  - 账号密码登录
  - 验证码弹层
  - `/login?token=...`
  - `/sso?ticket=...`
  - `/sso?sourceCode=zhxt&token=...`
  - `/sso?sourceCode=YDBG&token=...`
  - `Usertoken` / `moaToken`
  - 登录后 `redirect` 与默认首页

**Step 3: 明确不变项**

- `apps/admin/src/pages/login/LoginPage.vue`
- `apps/admin/src/pages/sso/SsoCallbackPage.vue`
- `apps/admin/src/shared/services/auth-captcha-service.ts`
- `apps/admin/src/shared/services/auth-remote-service.ts`

**Step 4: 验证旧链路仍可随时回退**

- 确认完整 bootstrap 代码路径保持原状，不先做删除与大重构。

### Task 2：抽出公共匿名路由清单

**Files:**
- Create: `apps/admin/src/router/public-routes.ts`
- Modify: `apps/admin/src/router/constants.ts`
- Reuse: `apps/admin/src/bootstrap/router.ts`

**Step 1: 新建公共路由文件**

- 只包含：
  - `/login`
  - `/sso`
  - 可选：公共错误兜底（若轻量启动需要）

**Step 2: 公共路由组件继续保持现有页面实现**

- `LoginPage.vue` 继续按现状动态加载或直接引用。
- `SsoCallbackPage.vue` 继续按现状动态加载或直接引用。

**Step 3: 不把业务 layout routes 混入公共路由**

- 公共路由文件禁止 import：
  - `router/registry`
  - `router/assemble-routes`
  - `AdminLayout`
  - 任何业务模块 `module.ts` / `routes.ts`

**Step 4: 本地验证**

- 直接访问 `/login`、`/sso`，确认路由可独立创建。

### Task 3：新增轻量 public bootstrap

**Files:**
- Create: `apps/admin/src/bootstrap/public.ts`
- Modify: `apps/admin/src/bootstrap/router.ts`
- Reuse: `packages/ui/src/lite.ts`

**Step 1: 创建 `bootstrapPublicApp()`**

- 仅安装以下能力：
  - `createApp(App)`
  - `createPinia()`
  - `createAppRouter(publicRoutes)`
  - `registerOneLiteUiComponents(app, { prefix: "Ob", aliases: false })`

**Step 2: 严禁引入完整业务壳**

- `public.ts` 禁止 import：
  - `@one-base-template/ui` 根入口
  - `OneUiPlugin`
  - `router/registry`
  - `router/assemble-routes`
  - `installCore`
  - `OneTag`

**Step 3: 只补齐公共页真正需要的上下文**

- 若 `LoginPage` / `SsoCallbackPage` 运行所需能力未满足，再按最小范围补齐。
- 禁止为了省事重新把完整 admin 启动链路搬回来。

**Step 4: 本地验证**

- 启动后访问 `/login` 不应再触发业务模块与表格栈的大量请求。

### Task 4：在 `main.ts` 做路径级启动分流

**Files:**
- Modify: `apps/admin/src/main.ts`
- Create: `apps/admin/src/bootstrap/public-route.ts`（如需要）

**Step 1: 识别当前是否为公共匿名页**

- 规则只覆盖：
  - `/login`
  - `/sso`

**Step 2: 公共页加载轻量 bootstrap**

- `main.ts` 保持先 `loadPlatformConfig()`，再根据当前路径选择：
  - `import("./bootstrap/public")`
  - 或 `import("./bootstrap")`

**Step 3: 业务页继续走旧 bootstrap**

- 非公共路由完全不变，继续调用 `bootstrapAdminApp()`。

**Step 4: 回退策略**

- 代码结构上确保恢复旧行为只需把路径判断拿掉或改回统一 `import("./bootstrap")`。

### Task 5：限制公共页进入重型 UI 入口

**Files:**
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/plugin.ts`
- Modify: `apps/admin/src/bootstrap/plugins.ts`
- Reuse: `packages/ui/src/lite.ts`

**Step 1: 保证 public bootstrap 只走 lite 入口**

- 公共页不允许再直接依赖：
  - `vxe-pc-ui/lib/style.css`
  - `vxe-table/lib/style.css`
  - `VxeTable`
  - `TableBox`

**Step 2: 完整业务壳保留原状**

- `apps/admin/src/bootstrap/plugins.ts` 先不改业务页全局注册策略，确保业务零感知。

**Step 3: 若发现 `LoginBoxV2` 仍经根入口引入重依赖，继续拆细**

- 优先从 `packages/ui/src/lite.ts` 解决，不改登录组件协议。

### Task 6：确认模块 registry 不再进入登录页启动链路

**Files:**
- Verify: `apps/admin/src/router/registry.ts`
- Verify: `apps/admin/src/router/assemble-routes.ts`
- Verify: `apps/admin/src/modules/**/module.ts`

**Step 1: 登录页启动时不触发 registry**

- `/login` 路径下禁止触发：
  - `import.meta.glob("../modules/**/module.ts", { eager: true })`
  - 业务模块页面静态 import

**Step 2: 核对 portal 可选模块不再误进首屏**

- `/login` 下不应再加载：
  - `PortalPageEditPage.vue`
  - `PortalPreviewRenderPage.vue`
  - `grid-layout-plus`
  - `@one-base-template/portal-engine`

**Step 3: 核对表格栈不再误进首屏**

- `/login` 下不应再加载：
  - `vxe-table`
  - `vxe-pc-ui`

### Task 7：补齐验证与性能对比

**Files:**
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

**Step 1: 功能回归**

Run:

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin build
pnpm -C apps/docs build
```

**Expected:**
- 全部退出码 `0`

**Step 2: 本地冒烟**

- 手工验证：
  - `/login`
  - `/login?token=...`
  - `/sso?...`
  - 登录成功后跳转业务页
  - 退出后再次回登录页

**Step 3: 性能复测**

- 复跑 Lighthouse 与浏览器 Performance API
- 对比以下指标：
  - 请求数
  - JS 传输体积
  - FCP / LCP / TTI
  - 首屏是否还出现 `vxe-table`、`portal-engine`

**Step 4: 结论落盘**

- 把“优化前/后数据、是否满足不影响业务约束、剩余风险”写入 `.codex/verification.md`

## 第二阶段（仅在第一阶段稳定后再评估）

### Task 8：再评估是否继续做全量业务壳减重

**候选文件：**
- `apps/admin/src/router/registry.ts`
- `apps/admin/src/modules/**/module.ts`
- `apps/admin/src/modules/**/routes*.ts`
- `packages/ui/src/index.ts`
- `packages/ui/src/plugin.ts`

**目标：**
- 让完整 admin 业务壳也减少首包和无关依赖预载。

**前提：**
- 第一阶段上线后无业务回归。
- 登录页收益仍不足，或业务页首屏也需要继续优化。

## 风险清单

- `SsoCallbackPage.vue` 依赖 `router.replace()` 与一系列远程登录服务，轻量 bootstrap 必须保证其运行环境完整。
- `LoginPage.vue` 依赖全局 `ObLoginBoxV2`；若公共页组件注册不完整，会直接白屏。
- 若公共页误引完整 `@one-base-template/ui` 根入口，优化收益会大幅打折。
- 若为了复用方便把 `installCore()` 搬进 public bootstrap，可能重新把业务 store 与菜单装配带回登录页。

## 建议的执行顺序

1. 先做 `Task 1 ~ Task 4`，把公共匿名页与完整业务壳物理隔离。
2. 再做 `Task 5 ~ Task 7`，确认 `/login` 不再加载重型表格与业务模块。
3. 只有在第一阶段稳定后，再决定是否进入 `Task 8`。

## 预期收益

- `/login` 首屏请求数显著下降。
- `vxe-table` / `vxe-pc-ui` / `portal-engine` / portal editor / UserManagement 页面不再进入登录页冷启动。
- 登录与 SSO 业务行为保持不变，风险集中在匿名页局部，回退成本低。
