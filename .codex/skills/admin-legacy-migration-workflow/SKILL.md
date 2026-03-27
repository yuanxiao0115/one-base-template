---
name: admin-legacy-migration-workflow
description: 将老项目 admin 能力稳定迁移到 one-base-template。Use when users ask to migrate, port, 移植, 对齐, or 重构 legacy admin pages, modules, routes, menus, auth, layout, tree tables, or CRUD flows into `apps/admin`, `packages/adapters`, `packages/core`, or `packages/ui`, especially when `*Management` 模块既要迁移又要标准化。
---

# Admin Legacy Migration Workflow

## Overview

用这套流程执行“老项目 -> one-base-template”的 admin 迁移任务。
先冻结范围和来源路径，再按分层落点实施；命中 `*Management` CRUD 模块时，强制接入 `$admin-management-standardizer` 与 `$crud-module-best-practice`，最后补齐 docs 与 `.codex` 证据。

## Quick Start

1. 先读 `references/migration-workflow.md`。
2. 再读 `references/layer-placement.md`。
3. 如果目标位于 `apps/admin/src/modules/*Management/**`，立刻使用 `$admin-management-standardizer` 与 `$crud-module-best-practice`，再读 `references/management-module-bridge.md`。
4. 用 `assets/migration-plan-template.md` 在 `docs/plans/` 新建或更新迁移计划。
5. 分批实施，并按 `references/verification-evidence.md` 做验证与证据落盘。

## Default Assumptions

- 用户未明确指定来源仓库时，默认老项目路径写为 `/Users/haoqiuzhi/code/basic/standard-oa-web-basic`。
- 默认只在 `/Users/haoqiuzhi/code/one-base-template/**` 内落地改动。
- 遇到老项目隐式耦合且需求未写明时，优先保持当前模板基线，不猜历史私货。

## Standard Workflow

### 1. 锁定迁移范围

- 写清来源路径、目标目录、必须迁移项、不迁移项、验收口径。
- 区分“页面迁移”“管理模块标准化”“跨包基建改造”，不要边做边改题。
- 如果用户只想做页内横向标准化，不要继续由本 skill 主导，改走 `$admin-management-standardizer`。

### 2. 先做分层落点判断

- 按 `packages/adapters -> packages/core -> packages/ui -> apps/admin` 的职责边界放代码。
- 路由、菜单、鉴权、布局迁移一律先检查当前模板约束，禁止照搬老项目的动态路由或启动链路。
- 共享逻辑只在“确实跨模块复用”时下沉，避免为了迁移好看而过度抽象。

### 3. 命中管理模块时切换到管理模块桥接流

- 当目标位于 `apps/admin/src/modules/*Management/**` 且包含列表 / 搜索 / 弹窗 / CRUD 时：
  - 使用 `$admin-management-standardizer` 处理范围判断、差异扫描、规则上提。
  - 使用 `$crud-module-best-practice` 处理 `api.ts`、`form.ts`、`columns.tsx`、`list.vue`、表单/搜索组件等编排基线。
  - 额外读取 `references/management-module-bridge.md`，处理当前 admin 仓库对 CRUD skill 的优先级修正。

### 4. 按小批次推进迁移

- 每批只交付一个可验证变化，建议保持 2-5 分钟粒度。
- 先接契约和路由，再接页面编排与交互。
- 每批结束立即跑最小校验，失败先止损，不把问题带进下一批。

### 5. 同步文档与工作证据

- 迁移计划写入 `docs/plans/`。
- 规则或行为有变化时，同步更新 `apps/docs/docs/guide/*`。
- 过程证据同步写入 `.codex/operations-log.md`、`.codex/testing.md`、`.codex/verification.md` / `.codex/verification/YYYY-MM-DD.md`。

### 6. 跑固定验证并收口

- 至少执行 `apps/admin` 相关 `typecheck / lint / build`，文档有变化时补跑 `apps/docs lint/build`。
- 如果触达共享包，再补对应子包校验。
- 有连续 3 次同类失败或严重权限回归时，暂停“重复试错”，先回到范围和根因判断。

## Hard Limits

- 不把老项目动态路由、匿名启动链路、页面层字段清洗原样搬进模板。
- 不把 `UserManagement` 当成唯一模板。
- 不跳过 docs 同步、`.codex` 证据和验证命令。
- 不在需求仅为“管理模块页内标准化”时扩大到跨包重构。
- 不在目标明确指向本仓库时改动 `~/.codex` 或其他仓库。

## References

- `references/migration-workflow.md`
- `references/layer-placement.md`
- `references/management-module-bridge.md`
- `references/verification-evidence.md`
- `assets/migration-plan-template.md`
