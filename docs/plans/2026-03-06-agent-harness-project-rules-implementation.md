# Agent Harness 项目规则重构 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 `one-base-template` 的 agent/harness 重构收敛到“全局运行时角色 + 仓库项目知识”双层结构，避免继续把项目规则误写到 `~/.codex`。

**Architecture:** 运行时角色继续由全局 Codex 配置管理；仓库内通过根 `AGENTS.md`、子目录 `AGENTS.md`、VitePress 指南页、`docs/plans` 与 `.codex` 记录构成项目知识闭环。本次只重构规则与文档入口，不改业务代码与运行时 agent 配置。

**Tech Stack:** Markdown、VitePress、TOML/配置文档约束、pnpm Monorepo

---

### Task 1: 重写根 AGENTS 导航页

**Files:**

- Modify: `AGENTS.md`
- Reference: `apps/docs/docs/guide/architecture.md`
- Reference: `apps/docs/docs/guide/development.md`

**Step 1: 梳理根规则保留项**

- 保留：中文沟通、技能优先、完整开发工作流、目录边界、规则分层、验证命令、协作规范
- 新增：运行时角色与仓库知识的边界、项目目标纠正规则、项目知识入口清单

**Step 2: 改写为“导航页 + 执行边界”结构**

- 增加 `Agent / Harness 定位`
- 增加 `项目知识入口`
- 将项目结构更新为当前实际目录（含 `apps/portal`、`apps/template`、`.codex`、`docs/plans`）

**Step 3: 自查规则完整性**

- 检查旧规则是否遗漏
- 检查是否清楚说明“不要默认修改 `~/.codex`”

**Step 4: 如收到“现在提交”再提交**

```bash
git add AGENTS.md
git commit -m "文档：重构根 AGENTS 导航与作用域边界"
```

### Task 2: 新增 Agent / Harness 指南页

**Files:**

- Create: `apps/docs/docs/guide/agent-harness.md`
- Modify: `apps/docs/docs/guide/agents-scope.md`
- Modify: `apps/docs/docs/guide/development.md`

**Step 1: 写新指南页**

内容必须覆盖：

1. 为什么仓库不重复定义运行时角色
2. 仓库知识入口表
3. 什么时候改仓库，什么时候改 `~/.codex`
4. 新规则落盘位置

**Step 2: 更新已有说明页**

- `agents-scope.md`：补充“全局运行时角色 vs 仓库规则”的边界说明
- `development.md`：补充 Agent / Harness 协作实践，并链接到新页

**Step 3: 交叉链接检查**

- 新页反链到 `architecture` / `development` / `agents-scope`
- 旧页能跳转到新页

**Step 4: 如收到“现在提交”再提交**

```bash
git add apps/docs/docs/guide/agent-harness.md apps/docs/docs/guide/agents-scope.md apps/docs/docs/guide/development.md
git commit -m "文档：新增 Agent Harness 指南"
```

### Task 3: 接入文档导航与总览入口

**Files:**

- Modify: `apps/docs/docs/.vitepress/config.ts`
- Modify: `apps/docs/docs/guide/index.md`

**Step 1: 更新导航**

- 在 `开发协作` 分组增加 `Agent Harness 与仓库知识`

**Step 2: 更新文档总览卡片**

- 在 `协作规范` 区块增加新卡片
- 描述聚焦“全局角色 vs 项目知识”的边界

**Step 3: 复查入口一致性**

- 顶部导航、侧边栏、文档总览三处都能访问新页面

**Step 4: 如收到“现在提交”再提交**

```bash
git add apps/docs/docs/.vitepress/config.ts apps/docs/docs/guide/index.md
git commit -m "文档：接入 Agent Harness 文档导航"
```

### Task 4: 落盘设计与实施记录

**Files:**

- Create: `docs/plans/2026-03-06-agent-harness-project-rules-design.md`
- Create: `docs/plans/2026-03-06-agent-harness-project-rules-implementation.md`

**Step 1: 写设计稿**

- 记录背景、范围冻结、方案对比、最终设计、验收口径

**Step 2: 写实施计划**

- 记录要改的文件、验证命令、提交策略

**Step 3: 如收到“现在提交”再提交**

```bash
git add docs/plans/2026-03-06-agent-harness-project-rules-design.md docs/plans/2026-03-06-agent-harness-project-rules-implementation.md
git commit -m "文档：补充 Agent Harness 重构设计与计划"
```

### Task 5: 验证并同步 `.codex` 记录

**Files:**

- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

**Step 1: 运行定向验证**

Run:

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs typecheck
pnpm -C apps/docs build
```

Expected:

- 三条命令全部通过
- 新页面能被 VitePress 正常收录

**Step 2: 更新 `.codex` 记录**

- `operations-log.md`：记录本次重构目标、改动文件与规则纠正
- `testing.md`：记录本次验证命令与结果
- `verification.md`：记录“运行时角色继续全局维护、仓库只维护项目知识”的闭环结论

**Step 3: 如收到“现在提交”再提交**

```bash
git add .codex/operations-log.md .codex/testing.md .codex/verification.md
git commit -m "文档：记录 Agent Harness 重构验证"
```
