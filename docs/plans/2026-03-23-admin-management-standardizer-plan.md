# Admin Management Standardizer Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在仓库内新增 `admin-management-standardizer` 本地 skill，并同步文档入口与验证链路，让 admin 管理模块横向标准化有统一执行器。

**Architecture:** skill 本身只保存触发条件、执行流程和引用导航，规则主版本继续留在 `AGENTS.md` 与 `apps/docs/docs/guide/*`。实施时优先新增独立文件，尽量不碰当前工作区已存在的 `UserManagement` 脏改动文件。

**Tech Stack:** Markdown、VitePress、repo-local skill conventions、Python helper scripts（仅用于 skill 元数据 / 校验）。

---

## Chunk 1: 设计与计划落盘

### Task 1: 写设计稿与实施计划

**Files:**

- Create: `docs/plans/2026-03-23-admin-management-standardizer-design.md`
- Create: `docs/plans/2026-03-23-admin-management-standardizer-plan.md`

- [ ] **Step 1: 写设计稿**

写清目标、范围冻结、目录结构、执行流、验证策略与风险控制。

- [ ] **Step 2: 写实施计划**

按 skill 文件、docs 文件、验证命令拆成可执行任务。

- [ ] **Step 3: 自检设计与计划一致性**

确认计划没有超出设计稿冻结范围。

## Chunk 2: skill 文件实现

### Task 2: 初始化 skill 目录与基础元数据

**Files:**

- Create: `.codex/skills/admin-management-standardizer/SKILL.md`
- Create: `.codex/skills/admin-management-standardizer/agents/openai.yaml`
- Create: `.codex/skills/admin-management-standardizer/references/rollout-workflow.md`
- Create: `.codex/skills/admin-management-standardizer/references/checklists.md`
- Create: `.codex/skills/admin-management-standardizer/references/scope-guard.md`
- Create: `.codex/skills/admin-management-standardizer/assets/rollout-plan-template.md`

- [ ] **Step 1: 初始化 skill 目录骨架**

可使用 `skill-creator` 提供的脚本初始化目录，但不要生成无关说明文件。

- [ ] **Step 2: 编写 `SKILL.md`**

写触发条件、主流程、硬限制和 references 导航，禁止复制长规则正文。

- [ ] **Step 3: 编写 references 与 template**

分别补齐执行流、清单、作用域护栏与计划模板。

- [ ] **Step 4: 生成并检查 `agents/openai.yaml`**

保证 `display_name`、`short_description`、`default_prompt` 与 skill 定位一致。

### Task 3: 做 skill 结构校验

**Files:**

- Modify: `.codex/skills/admin-management-standardizer/**`（按校验结果微调）

- [ ] **Step 1: 运行 skill 快速校验**

在 skill 目录内运行：

```bash
python3 /Users/haoqiuzhi/.codex/skills/.system/skill-creator/scripts/quick_validate.py
```

- [ ] **Step 2: 若校验失败则修正 frontmatter / 引用结构 / openai.yaml**

直到校验通过为止。

- [ ] **Step 3: 用真实触发语句做前向自检**

至少覆盖：

- “按 UserManagement 的规则推广到 RoleManagement”
- “横向改造这个管理模块”
- “把 PortalManagement 对齐 admin 基线”

预期：前两类命中；第三类被 scope guard 拦截或要求重新定界。

## Chunk 3: 文档站同步

### Task 4: 新增 skill 说明页并接入入口

**Files:**

- Create: `apps/docs/docs/guide/admin-management-standardizer.md`
- Modify: `apps/docs/docs/guide/index.md`
- Modify: `apps/docs/docs/.vitepress/config.ts`

- [ ] **Step 1: 新增 guide 页面**

页面至少包含：适用范围、何时使用、执行流、范围外说明、规则源与 skill 的关系、推荐触发语句、验证方式。

- [ ] **Step 2: 更新总览页入口**

在“协作与发布”区增加 skill 卡片，避免孤立页面。

- [ ] **Step 3: 更新侧边栏导航**

把新页面加入协作类导航分组。

## Chunk 4: 验证与收口

### Task 5: 运行定向验证并更新记录

**Files:**

- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

- [ ] **Step 1: 记录本轮操作与验证结论**

把新增 skill、文档页、验证命令及结果写入 `.codex/*.md`。

- [ ] **Step 2: 运行 docs 验证**

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

- [ ] **Step 3: 复核 git diff 范围**

确认本次只包含 skill、docs/plans、docs 站点与 `.codex` 记录，不误带 `UserManagement` 既有脏改动。

- [ ] **Step 4: 若验证通过则准备独立提交**

优先只提交本次新增与修改文件，提交信息使用中文。
