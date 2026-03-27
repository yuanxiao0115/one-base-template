# Admin Legacy Migration Workflow Implementation Plan

> **For agentic workers:** REQUIRED: 先读根 `AGENTS.md`、`apps/admin/AGENTS.md`，再按本计划执行；如果命中 `*Management` CRUD 模块，补用 `.codex/skills/admin-management-standardizer` 与 `.codex/skills/crud-module-best-practice`。

**Goal:** 合并 `legacy-project-migration-best-practice` 与 `legacy-module-migration-executor`，重写为一个新的 repo-local skill：`admin-legacy-migration-workflow`，并同步 docs 入口，删除旧 skill 目录。

**Architecture:** 新 skill 只保留迁移工作流、分层落点、管理模块桥接、验证证据与计划模板；`admin-management-standardizer` 与 `crud-module-best-practice` 继续作为子流程 skill 被引用，不复制长规则正文。

**Tech Stack:** Markdown、VitePress、repo-local skills、`quick_validate.py`。

---

## Task 1：重写新 skill

**Files:**

- Create: `.codex/skills/admin-legacy-migration-workflow/SKILL.md`
- Create: `.codex/skills/admin-legacy-migration-workflow/references/migration-workflow.md`
- Create: `.codex/skills/admin-legacy-migration-workflow/references/layer-placement.md`
- Create: `.codex/skills/admin-legacy-migration-workflow/references/management-module-bridge.md`
- Create: `.codex/skills/admin-legacy-migration-workflow/references/verification-evidence.md`
- Create: `.codex/skills/admin-legacy-migration-workflow/assets/migration-plan-template.md`
- Create: `.codex/skills/admin-legacy-migration-workflow/agents/openai.yaml`

**Steps:**

1. 写清触发条件、默认来源路径、执行流、硬限制。
2. 把管理模块标准化与 CRUD 落地改成“显式桥接”，不要复制长规则正文。
3. 修正与当前 `apps/admin/AGENTS.md` 冲突的旧迁移口径。

## Task 2：同步文档站入口

**Files:**

- Create: `apps/docs/docs/guide/admin-legacy-migration-workflow.md`
- Modify: `apps/docs/docs/.vitepress/config.ts`
- Modify: `apps/docs/docs/index.md`
- Modify: `apps/docs/docs/guide/index.md`
- Modify: `apps/docs/docs/guide/for-users.md`
- Modify: `apps/docs/docs/guide/admin-management-standardizer.md`

**Steps:**

1. 为新 skill 增加 guide 页面。
2. 在首页、guide 总览、sidebar 中加入入口。
3. 把 `admin-management-standardizer` 调整成“管理模块桥接子流程”定位。

## Task 3：删除旧 skill

**Files:**

- Delete: `.codex/skills/legacy-project-migration-best-practice/**`
- Delete: `.codex/skills/legacy-module-migration-executor/**`

**Steps:**

1. 确认新 skill 已覆盖旧 skill 的主职责。
2. 删除旧目录，避免后续触发分裂。

## Task 4：验证与证据

**Files:**

- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`
- Create: `.codex/verification/2026-03-27.md`

**Steps:**

1. 运行 `quick_validate.py` 校验新 skill。
2. 运行 `pnpm -C apps/docs lint` 与 `pnpm -C apps/docs build`。
3. 记录操作、测试与最终验证结论。
