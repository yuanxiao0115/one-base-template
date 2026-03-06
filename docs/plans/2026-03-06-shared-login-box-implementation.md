# Shared Login Box Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 抽离 `LoginBox.vue` 与 `login.ts`，让 `apps/admin` 和 `apps/portal` 共享登录框与真实登录动作，同时保留各自页面与登录后逻辑。

**Architecture:** 公共 UI 放在 `packages/ui`，公共登录动作放在 `packages/core`，应用层页面只保留页面壳、配置加载、验证码编排与跳转逻辑。`portal` 继续保持静态前台应用，不引入菜单接口，只新增登录后首页分流服务。

**Tech Stack:** Vue 3、`<script setup>`、TypeScript、Pinia、Element Plus、Vitest、Ultracite、Vite/Vue TSC

---

### Task 1: 新增共享登录动作测试

**Files:**
- Create: `packages/core/src/auth/login.test.ts`
- Create: `packages/core/src/auth/login.ts`
- Modify: `packages/core/src/index.ts`

**Step 1: Write the failing test**

为纯函数 `resolvePortalLoginTarget()` 写测试，覆盖：

- `redirect` 优先
- `enable=true` → `/portal/index`
- `enable=false && customUrl='/a'` → `/a`
- 非站内 `customUrl` → fallback

```ts
import { describe, expect, it } from "vitest";
import { resolvePortalLoginTarget } from "./login";

describe("resolvePortalLoginTarget", () => {
  it("优先返回 redirect", () => {
    expect(
      resolvePortalLoginTarget({
        redirect: "/portal/index/1",
        fallback: "/portal/index",
        frontConfig: { enable: false, customUrl: "/other" },
      })
    ).toBe("/portal/index/1");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm -C packages/core test:run src/auth/login.test.ts`

Expected: FAIL，提示 `resolvePortalLoginTarget` 不存在

**Step 3: Write minimal implementation**

在 `packages/core/src/auth/login.ts` 新增：

- `PortalFrontConfig`
- `PortalLoginTargetOptions`
- `resolvePortalLoginTarget()`
- `loginByPassword()`

约束：

- `loginByPassword()` 只做登录动作与 `finalizeAuthSession()`
- 加密通过注入 `encryptor` 完成

**Step 4: Run test to verify it passes**

Run: `pnpm -C packages/core test:run src/auth/login.test.ts`

Expected: PASS

### Task 2: 抽离共享登录框组件

**Files:**
- Create: `packages/ui/src/components/auth/LoginBox.vue`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/plugin.ts`

**Step 1: Write minimal implementation**

组件只负责输入与提交，不负责跳转：

```vue
<script setup lang="ts">
const emit = defineEmits<{
  submit: [payload: { username: string; password: string }];
}>();
</script>
```

包含：

- 账号输入框
- 密码输入框
- 提交按钮
- `loading`、标题、占位文案 props

**Step 2: Export component**

- `packages/ui/src/index.ts` 导出 `LoginBox`
- `packages/ui/src/plugin.ts` 注册 `ObLoginBox`

**Step 3: Run validation**

Run: `pnpm -C packages/ui typecheck`

Expected: PASS

### Task 3: 补齐 portal 登录远程服务

**Files:**
- Create: `apps/portal/src/shared/services/auth-remote-service.ts`

**Step 1: Write minimal implementation**

新增两个服务：

- `getLoginPageConfig()`
- `getPortalFrontConfig()`

接口分别为：

- `/cmict/portal/getLoginPage`
- `/cmict/admin/front-config/portal`

**Step 2: Run validation**

Run: `pnpm -C apps/portal typecheck`

Expected: PASS

### Task 4: admin 登录页接入共享登录框

**Files:**
- Modify: `apps/admin/src/pages/login/LoginPage.vue`

**Step 1: Replace duplicated form UI**

- 用 `ObLoginBox` 替换重复账号密码输入区
- 保留页面背景、标题、登录页配置、`/login?token=` 逻辑

**Step 2: Use shared login action**

- default 分支仍支持 `demo/demo`
- sczfw 分支在验证码成功后调用 `loginByPassword()`
- 通过 `sm4EncryptBase64` 注入加密器

**Step 3: Run validation**

Run: `pnpm -C apps/admin typecheck`

Expected: PASS

### Task 5: portal 登录页接入共享登录框与分流逻辑

**Files:**
- Modify: `apps/portal/src/pages/login/LoginPage.vue`

**Step 1: Replace duplicated form UI**

- 用 `ObLoginBox` 替换现有简单表单
- 保留 portal 自己的页面壳

**Step 2: Use shared login action**

- 调用 `loginByPassword()`
- 登录成功后请求 `getPortalFrontConfig()`
- 通过 `resolvePortalLoginTarget()` 计算落点

伪代码：

```ts
const target = resolvePortalLoginTarget({
  redirect: route.query.redirect,
  fallback: "/portal/index",
  frontConfig: frontConfig.data,
});
await router.replace(target);
```

**Step 3: Keep portal static**

- 不新增菜单接口请求
- 不引入 `/cmict/admin/permission/*` 服务封装

**Step 4: Run validation**

Run:

- `pnpm -C apps/portal typecheck`
- `pnpm -C apps/portal lint`

Expected: PASS

### Task 6: 更新文档站

**Files:**
- Modify: `apps/docs/docs/guide/architecture.md`

**Step 1: Update portal architecture doc**

补充：

- `admin` / `portal` 共享 `LoginBox.vue` 与 `login.ts`
- 页面壳与登录后逻辑各自维护
- `portal` 登录后使用 `/cmict/admin/front-config/portal` 做分流
- `portal` 维持静态前台应用，不接菜单接口

**Step 2: Run validation**

Run: `pnpm -C apps/docs build`

Expected: PASS

### Task 7: 全量验证与记录

**Files:**
- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

**Step 1: Run verification**

Run:

- `pnpm -C packages/core test:run src/auth/login.test.ts`
- `pnpm -C packages/core typecheck`
- `pnpm -C packages/ui typecheck`
- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/portal typecheck`
- `pnpm -C apps/portal lint`
- `pnpm -w build`
- `pnpm -C apps/docs build`

Expected: 全部 PASS

**Step 2: Update evidence files**

把关键实现、测试命令、验证结论写入：

- `.codex/operations-log.md`
- `.codex/testing.md`
- `.codex/verification.md`

**Step 3: Commit**

```bash
git add AGENTS.md \
  docs/plans/2026-03-06-shared-login-box-design.md \
  docs/plans/2026-03-06-shared-login-box-implementation.md
git commit -m "feat: 抽离共享登录框与门户分流"
```

> 注意：当前规则要求未收到“现在提交”前不要执行 `git commit`。这里只保留提交草案，不实际执行。
