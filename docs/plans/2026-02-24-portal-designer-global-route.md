# Portal Designer Global Route Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 `/portal/designer` 与 `/portal/layout` 提升为顶层路由，作为“全局全屏页面”，不再被 `AdminLayout`（侧边菜单/通用顶部栏/Tabs）包裹。

**Architecture:** 在 `apps/admin/src/router/index.ts` 中新增两个顶层 RouteRecord，并从 `apps/admin/src/modules/portal/routes.ts` 移除同 path 的子路由，避免重复注册。通过 `meta.hiddenTab` 避免被 TabsStore 记录；通过 `meta.activePath` + `meta.skipMenuAuth` 兼容现有权限守卫。

**Tech Stack:** Vue 3 + Vue Router 4 + Pinia + Element Plus + Tailwind v4

---

### Task 1: 将 designer/layout 迁移为顶层路由

**Files:**
- Modify: `apps/admin/src/router/index.ts`
- Modify: `apps/admin/src/modules/portal/routes.ts`

**Step 1: 更新 `apps/admin/src/router/index.ts`**

- 在 `/portal/preview` 顶层路由后新增：
  - `/portal/designer` -> `../modules/portal/pages/PortalTemplateSettingPage.vue`（`name: PortalDesigner`）
  - `/portal/layout` -> `../modules/portal/pages/PortalPageEditPage.vue`（`name: PortalPageEditor`）
- `meta`（两者一致）：
  - `hiddenTab: true`（不进入通用 Tabs）
  - `fullScreen: true`（保留语义，虽不再由 AdminLayout 消费）
  - `hideTabsBar: true`（同上）
  - `activePath: '/portal/setting'`（权限归属到已有菜单入口）
  - `skipMenuAuth: true`（开发期/本地维护页允许“登录即可访问”）

**Step 2: 更新 `apps/admin/src/modules/portal/routes.ts`**

- 删除 `path: 'portal/designer'` 与 `path: 'portal/layout'` 两个子路由记录，避免与顶层路由重复注册。

**Step 3: 本地验证**

Run:
- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin build`

Expected:
- typecheck/build 通过
- 访问 `/portal/designer?templateId=...` 不再显示侧栏/通用顶部栏
- `/portal/designer` / `/portal/layout` 不会生成新的 Tab（`meta.hiddenTab` 生效）

**Step 4: Commit**

```bash
git add apps/admin/src/router/index.ts apps/admin/src/modules/portal/routes.ts
git commit -m "fix(portal): make designer/layout global fullscreen routes"
```

