---
name: zfw-system-migration-playbook
description: 将 zfw 老后台模块从 legacy 项目迁移到 one-base-template 的标准流程。Use when 用户提出“迁移/移植 zfw 模块、对齐登录菜单、创建 zfw 新 app、把 legacy views 搬到 admin-lite 派生项目、按老 URL 保持可运行”等需求，尤其适用于 `apps/zfw-system-sfss`、`apps/*/src/modules/system-sfss`、`src/config/platform-config.ts`、路由对齐与验证收口场景。
---

# ZFW System Migration Playbook

## Overview

使用本技能把 zfw 老项目能力迁移到 one-base-template，目标是先达成“能登录、能加载菜单、路由可达、可持续迭代”，再逐页替换业务实现。

## Quick Start

1. 锁定迁移来源与目标目录。
2. 先对齐 `platform-config.ts`（系统编码、首页映射、Appcode、模块白名单）。
3. 再对齐模块路由 URL（优先保证与后端菜单 URL 一致）。
4. 页面复杂度过高时先放可运行占位页，保留 legacy 源目录用于逐页替换。
5. 跑 app 验证 + docs 验证并记录 `.codex` 证据。

## Workflow

### 1) 锁定范围

- 来源项目默认读取用户指定路径；未指定时暂停，不自行猜测 zfw 业务仓库。
- 目标目录固定在当前仓库：`/Users/haoqiuzhi/code/one-base-template/**`。
- 明确“本次做 URL/配置迁移”还是“本次做业务页面完整迁移”。

### 2) 创建或选择目标 app

- 新建 app：`pnpm new:app <app-id>`
- 新建模块：`pnpm new:module <module-id> --title 模块标题 --app <app-id>`
- 若 app 已存在：直接在 `apps/<app-id>/src/modules/<module-id>` 继续。

### 3) 对齐运行配置（先做）

编辑 `apps/<app-id>/src/config/platform-config.ts`：

1. `defaultSystemCode`：改为老系统编码（常见为 `judicial_petition_management_system`）
2. `systemHomeMap`：首页路由改为迁移后真实可访问路径
3. `enabledModules`：加入本次迁移模块 id（例如 `system-sfss`）
4. `appcode`：按老项目真实请求头口径对齐（zfw 常见为 `od`）

### 4) 对齐路由 URL（优先菜单可达）

编辑 `apps/<app-id>/src/modules/<module-id>/routes.ts`：

- 路由 `path` 优先复用老项目 URL，避免后端菜单点击后 404。
- 父菜单路由可先用 `redirect` 收口，子路由逐步补页面实现。
- 所有路由都通过 `defineRouteMeta/createAuthRouteMeta` 定义 meta。
- `keepAlive=true` 路由必须有稳定 `name`。

详细路由基线见：`references/system-sfss-route-baseline.md`。

### 5) 页面迁移策略（分层）

- 简单页面（纯展示/占位）直接迁移。
- 中复杂页面（耦合老 hooks/组件）先落可运行占位页，避免阻塞全局联调。
- 保留 legacy 源目录到 app 下非编译路径（例如 `apps/<app-id>/migration/**`），供后续逐页替换。

### 6) 验证与证据

至少执行：

```bash
pnpm -C apps/<app-id> typecheck
pnpm -C apps/<app-id> lint
pnpm -C apps/<app-id> lint:arch
pnpm -C apps/<app-id> build
```

文档有变更时追加：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

把结果写入：

- `.codex/operations-log.md`
- `.codex/testing.md`
- `.codex/verification.md`（索引）
- `.codex/verification/YYYY-MM-DD.md`（详细记录）

## Hard Limits

- 不把 legacy 动态路由机制原样搬入新基座。
- 不在页面中散落后端协议兼容；协议差异优先收敛在 adapters/config。
- 不跳过 docs 同步与验证命令。
- 不在未确认系统编码/Appcode 的情况下声称“可直接运行”。

## Deliverables

每次迁移至少产出：

1. 可运行模块目录：`apps/<app-id>/src/modules/<module-id>`
2. 对齐配置：`src/config/platform-config.ts`
3. 对齐文档：`apps/docs/docs/guide/*.md`
4. 验证证据：`.codex/*` 记录

## References

- `references/zfw-migration-checklist.md`
- `references/system-sfss-route-baseline.md`
- `assets/migration-plan-template.md`
