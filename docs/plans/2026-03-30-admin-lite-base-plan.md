# admin-lite Base Replacement Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 `apps/admin-lite` 替换 `apps/template` 的后台基座职责，并将脚手架、规则与文档统一切到新基座。

**Architecture:** 以 `apps/admin` 为母版复制出 `apps/admin-lite`，物理移除强业务模块，保留后台通用壳能力，并通过 `config/ui.ts` 收口可开关扩展。根脚本和 docs 同步切换到 `admin-lite`，避免仓库内出现双基座口径。

**Tech Stack:** Vue 3、Vite Plus、Pinia、Vue Router、Element Plus、VitePress、pnpm workspaces

---

## Chunk 1: 基座应用落地

### Task 1: 复制 admin 并生成 admin-lite 初始骨架

**Files:**

- Create: `apps/admin-lite/**`
- Delete: `apps/template/**`

- [ ] **Step 1: 复制 `apps/admin` 到 `apps/admin-lite`**

Run:

```bash
rsync -a --exclude dist --exclude node_modules apps/admin/ apps/admin-lite/
```

- [ ] **Step 2: 删除 `apps/template`**

Run:

```bash
rm -rf apps/template
```

- [ ] **Step 3: 批量替换 admin-lite 的应用标识**

调整应用名、存储命名空间、入口函数命名、样式入口名、README/AGENTS 标题。

- [ ] **Step 4: 定向检查新目录是否可被 workspace 识别**

Run:

```bash
test -f apps/admin-lite/package.json
```

### Task 2: 收敛 admin-lite 默认模块

**Files:**

- Modify: `apps/admin-lite/src/config/platform-config.ts`
- Delete: `apps/admin-lite/src/modules/CmsManagement/**`
- Delete: `apps/admin-lite/src/modules/PortalManagement/**`
- Delete: `apps/admin-lite/src/modules/DocumentFormManagement/**`
- Modify: `apps/admin-lite/build/**`
- Modify: `apps/admin-lite/tests/**`

- [ ] **Step 1: 修改 `enabledModules` 默认值**

仅保留：`home`、`admin-management`、`system-management`、`log-management`。

- [ ] **Step 2: 删除强业务模块目录**

删除 CMS、Portal、公文表单模块源码。

- [ ] **Step 3: 清理构建 feature chunks 与相关测试中的已删除模块引用**

- [ ] **Step 4: 运行定向搜索确认不存在已删除模块的硬依赖**

Run:

```bash
rg -n "CmsManagement|PortalManagement|DocumentFormManagement" apps/admin-lite
```

### Task 3: 收口不通用的管理端扩展开关

**Files:**

- Modify: `apps/admin-lite/src/config/ui.ts`
- Modify: `apps/admin-lite/src/components/top/AdminTopBar.vue`
- Modify: `apps/admin-lite/src/bootstrap/plugins.ts`
- Modify: `apps/admin-lite/src/bootstrap/material-image-service-worker.ts`
- Modify: `apps/admin-lite/src/pages/login/LoginPage.vue`

- [ ] **Step 1: 在 `config/ui.ts` 新增顶栏扩展开关**

至少覆盖：`tenantSwitcher`、`profile`、`changePassword`、`personalization`、`materialImageCache` 标题文案。

- [ ] **Step 2: 在 `AdminTopBar.vue` 按配置渲染能力**

保持默认后台可用，但允许项目后续通过单文件配置裁剪。

- [ ] **Step 3: 将素材缓存默认关闭**

`admin-lite` 默认不启用素材图片 Service Worker，但保留开关。

- [ ] **Step 4: 更新登录页和顶部标题文案为基座口径**

避免继续以“当前业务后台成品”表述。

## Chunk 2: 脚手架与门禁切换

### Task 4: 切换 new:app 的母版来源到 admin-lite

**Files:**

- Modify: `scripts/new-app.mjs`
- Modify: `scripts/__tests__/new-app.test.mjs`

- [ ] **Step 1: 将复制源从 `apps/template` 改为 `apps/admin-lite`**

- [ ] **Step 2: 更新字符串替换规则**

涵盖：`StartAdminLiteApp*`、`bootstrapAdminLiteApp`、`startAdminLiteApp`、`admin-lite-styles`、`one-base-template-admin-lite`、`appName: 'admin-lite'`、`apps/admin-lite`。

- [ ] **Step 3: 调整脚手架注入的 `lint:arch` 命令**

- [ ] **Step 4: 运行 dry-run 验证新 app 计划输出**

Run:

```bash
pnpm new:app demo-shell --dry-run
```

### Task 5: 重命名 template 架构门禁为 admin-lite 基线

**Files:**

- Move/Modify: `scripts/check-template-arch.mjs` -> `scripts/check-admin-lite-arch.mjs`
- Modify: `package.json`
- Modify: `scripts/check-basic-signature-boundary.mjs`
- Modify: `scripts/check-naming.mjs`
- Modify: `apps/docs/public/cli-naming-whitelist.json`

- [ ] **Step 1: 重命名架构门禁脚本并更新提示文案**

- [ ] **Step 2: 更新所有命令入口引用**

包括根脚本、子 app `lint:arch`、CLI 注入脚本。

- [ ] **Step 3: 将命名检查与签名边界检查切到 `apps/admin-lite`**

- [ ] **Step 4: 运行脚本级定向验证**

Run:

```bash
pnpm new:app demo-shell --dry-run
node scripts/check-admin-lite-arch.mjs --app admin-lite
```

## Chunk 3: README / docs / AGENTS 收口

### Task 6: 更新根 README 与仓库 AGENTS 口径

**Files:**

- Modify: `README.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: 将目录结构中的 `template` 改为 `admin-lite`**
- [ ] **Step 2: 将快速开始命令改为 `pnpm dev:admin-lite`**
- [ ] **Step 3: 将“从 template 派生新 app”改为“从 admin-lite 派生新 app”**
- [ ] **Step 4: 更新规则分层表与项目结构描述**

### Task 7: 新增 admin-lite 文档与规则主版本

**Files:**

- Create: `apps/admin-lite/README.md`
- Create: `apps/admin-lite/AGENTS.md`
- Move/Modify: `apps/docs/docs/guide/template-static-app.md` -> `apps/docs/docs/guide/admin-lite-base-app.md`
- Move/Modify: `apps/docs/docs/guide/template-agent-redlines.md` -> `apps/docs/docs/guide/admin-lite-agent-redlines.md`

- [ ] **Step 1: 生成 `apps/admin-lite` 专属 README/AGENTS**
- [ ] **Step 2: 把 template 基座文档改写为 admin-lite 基座文档**
- [ ] **Step 3: 把 template 红线文档改写为 admin-lite 红线文档**
- [ ] **Step 4: 检查新文档中的命令、路径、脚本名是否一致**

### Task 8: 更新文档站导航与现行指南

**Files:**

- Modify: `apps/docs/docs/.vitepress/config.ts`
- Modify: `apps/docs/docs/index.md`
- Modify: `apps/docs/docs/guide/quick-start.md`
- Modify: `apps/docs/docs/guide/architecture.md`
- Modify: `apps/docs/docs/guide/architecture-runtime-deep-dive.md`
- Modify: `apps/docs/docs/guide/agents-scope.md`
- Modify: `apps/docs/docs/guide/development.md`
- Modify: `apps/docs/docs/guide/naming-whitelist.md`
- Modify: `apps/docs/docs/guide/zfw-system-sfss-quick-start.md`
- Modify: `apps/docs/docs/guide/menu-route-spec.md`
- Modify: `apps/docs/docs/guide/env.md`

- [ ] **Step 1: 替换导航与首页链接**
- [ ] **Step 2: 更新当前基座应用说明**
- [ ] **Step 3: 更新脚本与门禁命令示例**
- [ ] **Step 4: 只改“现行口径”文档，不回写历史计划文档**

## Chunk 4: 验证、记录与提交

### Task 9: 记录过程证据并执行定向验证

**Files:**

- Modify/Create: `.codex/operations-log.md`
- Modify/Create: `.codex/testing.md`
- Modify/Create: `.codex/verification.md`
- Modify/Create: `.codex/verification/2026-03-30.md`

- [ ] **Step 1: 记录本轮基线限制与改造范围**
- [ ] **Step 2: 运行定向验证命令**

Run:

```bash
pnpm -C apps/admin-lite lint
pnpm -C apps/admin-lite lint:arch
pnpm -C apps/admin-lite build
pnpm -C apps/docs build
pnpm new:app demo-shell --dry-run
```

- [ ] **Step 3: 汇总结果与残余风险**

### Task 10: 提交改动

- [ ] **Step 1: 检查 diff 范围**

Run:

```bash
git status --short
```

- [ ] **Step 2: 使用中文 commit message 提交**

Run:

```bash
git add .
git commit -m "重构后台基座为admin-lite"
```
