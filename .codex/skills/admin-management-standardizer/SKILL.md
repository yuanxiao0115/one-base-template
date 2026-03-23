---
name: admin-management-standardizer
description: Use when standardizing or directly refactoring admin `*Management` modules under `apps/admin/src/modules/**`, especially for 横向推广已验证的 list/dialog/CRUD rules to sibling management modules without把 UserManagement 当成唯一模板.
---

# Admin Management Standardizer

## 概览

用于把 admin 管理模块中已经验证过的标准化规则，稳定推广到其他 `*Management` 模块。
skill 只负责执行流程与范围判断，规则主版本仍然留在 `AGENTS.md` 和 `apps/docs/docs/guide/*`。

## 何时使用

出现以下请求时直接启用：

- “按 UserManagement 的规则推广到 XManagement”
- “横向改造这个管理模块”
- “检查并直接修这个 `*Management` 模块的 CRUD 红线问题”
- 目标路径位于 `apps/admin/src/modules/*Management/**`

以下场景不要使用：

- `apps/portal/**`、`packages/core/**`、`packages/ui/**`、`packages/adapters/**`
- 非管理模块的通用重构
- 启动链路、主题系统、适配器协议这类跨包改造
- 只想沉淀规则、不打算直接推进改造

## 先读规则源

按以下顺序读取，不要跳过作用域判断：

1. `AGENTS.md`
2. `apps/admin/AGENTS.md`
3. `apps/docs/docs/guide/agents-scope.md`
4. `apps/docs/docs/guide/admin-agent-redlines.md`
5. `apps/docs/docs/guide/crud-module-best-practice.md`
6. 目标模块最近相关的 `docs/plans/*.md`（若存在）

## 标准流程

1. 先用 `references/scope-guard.md` 判断是否命中首版范围，并区分“规则来源”和“规则作用域”。
2. 再用 `references/rollout-workflow.md` 扫描差异、写 `docs/plans/` 计划，并默认直接推进改造。
3. 实施时用 `references/checklists.md` 约束页面编排、性能/稳定性、文档同步与门禁验证。
4. 如果得到新的横向规则，回写更高作用域规则源，不要继续塞回单个来源模块。

## 硬限制

- 不要把 `UserManagement` 当成唯一模板。
- 不要把范围外目录强行纳入整改。
- 不要只改代码不改文档 / 不做验证。
- 不要在 skill 内复制长规则正文。

## 参考

- `references/rollout-workflow.md`
- `references/checklists.md`
- `references/scope-guard.md`
- `assets/rollout-plan-template.md`
