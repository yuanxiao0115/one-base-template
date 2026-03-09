# Admin 单启动链路净化 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 admin 启动流程收敛为单启动链路，删除字体切换与 public bootstrap，确保 `/login`、`/sso` 与业务页统一走 `bootstrapAdminApp()`。

**Architecture:** 启动入口回归单链路：`main.ts` 只负责加载运行时配置、执行 `bootstrapAdminApp()`、等待 `router.isReady()` 并挂载；匿名页不再维护独立启动模式。登录与 SSO 成功后的跳转统一走 router 内导航，未授权清理逻辑与文档、测试同步收口到单链路口径。

**Tech Stack:** Vite 8、Vue 3、Vue Router 4、Pinia、Vitest、VitePress

---

### Task 1: 先锁定“单启动链路”预期

**Files:**
- Create: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/__tests__/main-single-bootstrap.test.ts`
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/__tests__/style-entries-source.test.ts`
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/__tests__/manual-chunks.test.ts`

**Step 1: 写失败测试**

新增一个源码约束测试，断言：

```ts
expect(mainSource).not.toContain('dataset.oneOs');
expect(mainSource).not.toContain('bootstrapAppByMode(');
expect(mainSource).toContain('bootstrapAdminApp');
```

把样式入口测试改为只约束 admin 单入口：

```ts
expect(mainSource).not.toContain('element-plus/dist/index.css');
expect(mainSource).not.toContain('./styles/index.css');
expect(adminEntrySource).toContain('./admin-styles');
```

把 `manual-chunks` 里依赖 `public bootstrap` 的断言改成“单链路下主入口与业务壳分组仍稳定”。

**Step 2: 跑测试确认先失败**

Run:

```bash
pnpm -C apps/admin exec vitest run \
  src/bootstrap/__tests__/main-single-bootstrap.test.ts \
  src/bootstrap/__tests__/style-entries-source.test.ts \
  src/__tests__/manual-chunks.test.ts
```

Expected:

- 新增断言因现状仍包含 OS 标记、双启动分流而失败

**Step 3: 不写生产代码前先确认失败原因正确**

- 失败必须来自“源码仍保留双启动/字体切换逻辑”，不是导入路径或测试文件本身错误

### Task 2: 收敛 main.ts 到单启动入口

**Files:**
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/main.ts`
- Reuse: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/index.ts`
- Reuse: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/config/platform-config.ts`

**Step 1: 写最小实现**

把 `main.ts` 收敛为：

```ts
async function bootstrap() {
  try {
    const platformConfigModule = await import('./config/platform-config');
    await platformConfigModule.loadPlatformConfig();
    const { bootstrapAdminApp } = await import('./bootstrap');
    const { app, router } = bootstrapAdminApp();
    await router.isReady();
    app.mount('#app');
  } catch (error) {
    renderBootstrapError(error);
  }
}

void bootstrap();
```

其中 `renderBootstrapError()` 只保留通用提示，不再按错误码分叉。

**Step 2: 删除字体切换逻辑**

- 删除 `RuntimeOs`、`detectRuntimeOs()`、`applyRuntimeOsMarker()`
- 删除 `document.documentElement.dataset.oneOs = ...`

**Step 3: 跑定向测试**

Run:

```bash
pnpm -C apps/admin exec vitest run \
  src/bootstrap/__tests__/main-single-bootstrap.test.ts \
  src/bootstrap/__tests__/style-entries-source.test.ts
```

Expected:

- 通过

### Task 3: 删除 public/bootstrap mode 运行时分流

**Files:**
- Delete: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/public.ts`
- Delete: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/public-entry.ts`
- Delete: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/entry.ts`
- Delete: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/switcher.ts`
- Delete: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/runtime.ts`
- Delete: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/router/public-routes.ts`
- Delete: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/__tests__/entry.test.ts`
- Delete: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/__tests__/public-bootstrap-source.test.ts`
- Delete: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/__tests__/runtime.test.ts`

**Step 1: 先删源码，再删失效测试**

- 只删除已无引用文件
- 删除前确认登录与 SSO 路由已经保留在 `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/router/assemble-routes.ts`

**Step 2: 更新残余引用**

把所有对下列符号的引用清掉：

```ts
bootstrapAppByMode
resolveBootstrapMode
setBootstrapMode
getBootstrapMode
navigateAfterAuth
resolveAuthNavigationTarget
resolveAppHref
getPublicRoutes
```

**Step 3: 跑定向类型与测试**

Run:

```bash
pnpm -C apps/admin exec vitest run \
  src/bootstrap/__tests__/style-entries-source.test.ts \
  src/__tests__/manual-chunks.test.ts
pnpm -C apps/admin typecheck
```

Expected:

- 通过

### Task 4: 登录与 SSO 跳转、未授权清理回归到单链路语义

**Files:**
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/bootstrap/http.ts`
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/pages/login/LoginPage.vue`
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/pages/sso/SsoCallbackPage.vue`

**Step 1: 替换登录成功后的跳转**

把登录与 SSO 中的：

```ts
await navigateAfterAuth({
  router,
  target,
  baseUrl,
});
```

改成单链路语义下的：

```ts
await router.replace(target);
```

并删除不再需要的 `baseUrl` 解构与 `navigateAfterAuth` import。

**Step 2: 收敛未授权 tags 清理**

`http.ts` 不再基于 `getBootstrapMode()` 判断是否清 tags。

建议最小实现：

```ts
void import('@one-base-template/tag/store').then(({ useTagStoreHook }) => {
  useTagStoreHook().handleTags('equal', []);
});
```

**Step 3: 跑登录相关定向测试/类型检查**

Run:

```bash
pnpm -C apps/admin exec vitest run src/__tests__/manual-chunks.test.ts
pnpm -C apps/admin typecheck
```

Expected:

- 通过

### Task 5: 清理字体切换残留与文档口径

**Files:**
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/admin/src/styles/index.css`
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/docs/docs/guide/architecture.md`
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/docs/docs/guide/env.md`
- Modify: `/Users/haoqiuzhi/code/one-base-template/apps/docs/docs/guide/theme-system.md`

**Step 1: 删除样式中的 OS 字体覆盖**

删除：

```css
:root[data-one-os="windows"] { ... }
:root[data-one-os="other"] { ... }
```

**Step 2: 删除文档里的双启动与 OS 字体切换描述**

- `architecture.md` 改成“统一单启动链路”
- `env.md` 删除 public bootstrap 描述
- `theme-system.md` 删除 `data-one-os` 运行时说明

**Step 3: 跑 docs 构建**

Run:

```bash
pnpm -C apps/docs build
```

Expected:

- 通过

### Task 6: 全量验证与工作记录同步

**Files:**
- Modify: `/Users/haoqiuzhi/code/one-base-template/.codex/operations-log.md`
- Modify: `/Users/haoqiuzhi/code/one-base-template/.codex/testing.md`
- Modify: `/Users/haoqiuzhi/code/one-base-template/.codex/verification.md`

**Step 1: 跑完整验证**

Run:

```bash
pnpm -C apps/admin exec vitest run \
  src/bootstrap/__tests__/main-single-bootstrap.test.ts \
  src/bootstrap/__tests__/style-entries-source.test.ts \
  src/__tests__/manual-chunks.test.ts
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/admin build
pnpm -C apps/docs build
```

Expected:

- 全部退出码 `0`

**Step 2: 手工冒烟**

- `pnpm -C apps/admin preview --host 127.0.0.1 --port 5183`
- 打开 `/login`
- 打开 `/sso`
- 验证登录后与未授权回登录页不白屏

**Step 3: 落盘记录**

- 在 `.codex/operations-log.md` 记录单启动链路回退
- 在 `.codex/testing.md` 记录命令与结果
- 在 `.codex/verification.md` 写结论与剩余风险
