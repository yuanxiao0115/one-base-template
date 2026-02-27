# Template 基建收口 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 收口 core/admin 的基础边界，降低消费者接入成本，为后续对外模板化做准备。

**Architecture:** 以 `packages/core` 为唯一“运行时状态与策略中枢”，把 key 规则、初始路由决策、通用鉴权编排从 admin 回收至 core；admin 仅保留页面展示与后端定制分支。保持向后兼容（读取旧 key / 旧行为），通过渐进迁移避免一次性大破坏。

**Tech Stack:** Vue 3 + Pinia + Vue Router + TypeScript + pnpm workspace + Vite。

---

### Task 1: 落盘架构收口清单（P0/P1/P2）

**Files:**
- Create: `docs/plans/2026-02-27-template-foundation-hardening-plan.md`
- Modify: `docs/plans/2026-02-27-template-foundation-hardening-checklist.md`

**Step 1: 写清单文件骨架（P0/P1/P2 + 验收口径）**

- P0：命名空间化、admin 去耦内部 key
- P1：鉴权/SSO 编排抽离、tabs 单轨决策
- P2：分发形态与文档/质量门禁

**Step 2: 明确每项“完成定义”**

- 每项必须有：改动文件、验证命令、回归风险、兼容策略

**Step 3: 提交执行顺序（先 P0）**

- 按“低风险高收益优先”落地，先做不会影响业务页面结构的收口。

---

### Task 2: core 存储 key 命名空间化（兼容旧 key）

**Files:**
- Modify: `packages/core/src/createCore.ts`
- Modify: `packages/core/src/context.ts`
- Create: `packages/core/src/storage/namespace.ts`
- Modify: `packages/core/src/stores/auth.ts`
- Modify: `packages/core/src/stores/system.ts`
- Modify: `packages/core/src/stores/menu.ts`
- Modify: `packages/core/src/stores/layout.ts`
- Modify: `packages/core/src/stores/tabs.ts`
- Modify: `packages/core/src/stores/assets.ts`
- Modify: `packages/core/src/index.ts`

**Step 1: 先写失败性校验（最小化，先跑 typecheck 观察现状）**

Run: `pnpm -C packages/core typecheck`
Expected: 通过（作为改造前基线）

**Step 2: 实现 namespace 工具（统一 key/前缀/DB 名）**

- 在 core 内提供：
  - `getNamespacedKey(baseKey, namespace)`
  - `getNamespacedPrefix(basePrefix, namespace)`
  - `getWithLegacy()`（先读 namespace，再读旧 key）

**Step 3: 逐个 store 收口并保留兼容读取**

- auth/system/menu/layout/tabs/assets 全部改为可命名空间化
- 读：优先 namespace key，回退 legacy key
- 写：写 namespace key，并清理同名 legacy key，避免双份状态抖动

**Step 4: 跑 typecheck/lint 校验 core**

Run:
- `pnpm -C packages/core typecheck`
- `pnpm -C packages/core lint`
Expected: 全通过

---

### Task 3: admin 去耦 core 内部 key（初始路由决策下沉）

**Files:**
- Create: `packages/core/src/router/initial-path.ts`
- Modify: `packages/core/src/index.ts`
- Modify: `apps/admin/src/router/index.ts`

**Step 1: 写失败性校验（admin typecheck 基线）**

Run: `pnpm -C apps/admin typecheck`
Expected: 通过（作为改造前基线）

**Step 2: 在 core 提供初始路由决策函数**

- 输入：`defaultSystemCode/systemHomeMap/storageNamespace/fallback`
- 内部复用 core 的 key 规则与菜单叶子推断逻辑
- admin 不再手写 `ob_system_current` / `ob_menu_tree:*` 读取

**Step 3: admin 路由改为调用 core 导出方法**

- 删除 admin 内部重复的 storage 解析工具函数
- 路由文件只保留业务路由声明

**Step 4: 跑 admin 校验**

Run:
- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin exec eslint src/router/index.ts`
Expected: 通过

---

### Task 4: 先抽离通用鉴权编排（登录后引导流程）

**Files:**
- Create: `packages/core/src/auth/flow.ts`
- Modify: `packages/core/src/index.ts`
- Modify: `apps/admin/src/pages/login/LoginPage.vue`
- Modify: `apps/admin/src/pages/sso/SsoCallbackPage.vue`

**Step 1: 提炼通用流程函数**

- `bootstrapAfterAuth({ redirect })`：`fetchMe -> loadMenus -> redirect`
- 管理错误处理边界，页面只保留视图反馈

**Step 2: 页面改为调用 core flow**

- login/sso 页只保留 backend 分支与参数解析
- 通用链路统一走 core flow

**Step 3: 回归 typecheck**

Run:
- `pnpm -C packages/core typecheck`
- `pnpm -C apps/admin typecheck`
Expected: 通过

---

### Task 5: 文档同步与全链路验证

**Files:**
- Modify: `apps/docs/docs/guide/architecture.md`
- Modify: `apps/docs/docs/guide/layout-menu.md`
- Modify: `apps/docs/docs/guide/adapter-sczfw.md`
- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

**Step 1: 同步文档说明**

- 增补“命名空间存储策略”“admin 去耦内部 key”“通用鉴权编排”

**Step 2: 运行验证命令**

Run:
- `pnpm -C packages/core typecheck`
- `pnpm -C packages/core lint`
- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin build`
- `pnpm -C apps/docs build`

**Step 3: 记录验证结论**

- 结果写入 `.codex/testing.md` 与 `.codex/verification.md`

