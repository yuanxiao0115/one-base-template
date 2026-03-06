# Agent Harness 项目规则重构设计稿

> 状态：已确认，进入实施
> 决策日期：2026-03-06
> 适用范围：`AGENTS.md`、`apps/docs/**`、`docs/plans/**`

## 1. 背景

用户在会话中明确纠正：当前要重构的是 **`one-base-template` 仓库内的项目规则与知识结构**，而不是 `~/.codex` 的全局运行时角色配置。

同时，参考 OpenAI 关于 Harness Engineering 的公开文章后，本仓库需要进一步收敛一条原则：

- **运行时角色留在全局 Codex 配置**
- **项目知识、边界、验证与文档入口留在仓库内**

当前仓库虽然已经具备：

- 根 `AGENTS.md`
- 子目录 `AGENTS.md`
- `apps/docs` 文档站
- `docs/plans` 设计 / 计划沉淀

但还缺少一层清晰表达：

1. 仓库为什么不再重复维护运行时角色配置
2. agent 进入仓库后，应该先读哪些知识入口
3. 用户纠正“目标仓库 / 目标目录”后，如何避免再次误改全局配置

## 2. 目标

本次只做“项目知识结构重构”，不引入新的运行时 agent 配置文件。

本期目标：

1. 精简并重写根 `AGENTS.md`，让它更像“导航页 + 执行边界”。
2. 新增一页仓库级 Agent / Harness 指南，明确全局配置与项目规则的边界。
3. 更新文档站导航、总览页与协作规范页，保证知识入口可发现。
4. 将本次用户纠正沉淀为仓库规则：**明确项目目标后，不要继续修改 `~/.codex` 或其他无关仓库。**

## 3. 范围冻结

### 3.1 本期必须做

1. 修改根 `AGENTS.md`
2. 新增 `apps/docs/docs/guide/agent-harness.md`
3. 修改 `apps/docs/docs/guide/agents-scope.md`
4. 修改 `apps/docs/docs/guide/development.md`
5. 修改 `apps/docs/docs/guide/index.md`
6. 修改 `apps/docs/docs/.vitepress/config.ts`
7. 新增设计稿与实施计划到 `docs/plans`
8. 同步更新 `.codex/operations-log.md`、`.codex/testing.md`、`.codex/verification.md`

### 3.2 本期不做

1. 不在仓库内新增 `agents/*.toml` 或其他运行时角色配置
2. 不修改 `~/.codex` 中的全局模型 / 角色 / prompt
3. 不新增新的子项目 `AGENTS.md`
4. 不调整业务代码、路由、UI、构建链路

## 4. 方案对比

### 方案 A：继续沿用现状，仅补一条说明

- 优点：改动最小
- 缺点：仓库层“运行时角色 vs 项目知识”的边界仍然模糊，后续仍容易误改 `~/.codex`

### 方案 B：把全局角色配置复制一份到仓库

- 优点：看起来“项目自包含”
- 缺点：会与 `~/.codex` 形成双维护，反而更容易过期与冲突

### 方案 C：仓库只维护知识与边界，运行时角色继续全局维护（推荐）

- 优点：
  - 角色配置单一来源
  - 仓库知识可跟随代码一起维护
  - 文档站可承接长期说明，降低 `AGENTS.md` 膨胀风险
- 缺点：
  - 需要补一层说明页面，帮助使用者建立正确心智模型

## 5. 最终设计

### 5.1 根 `AGENTS.md` 的定位

根 `AGENTS.md` 只保留四类高信号信息：

1. Agent / Harness 定位
2. 全仓工作流
3. 目录边界与规则分层
4. 项目知识入口与验证要求

它不再承担“解释所有背景”的责任，而是把深层说明导向文档站。

### 5.2 文档站新增一页 Agent / Harness 指南

新增 `apps/docs/docs/guide/agent-harness.md`，负责解释：

1. 为什么不在仓库里重复维护运行时角色
2. 本仓库的知识入口有哪些
3. 什么时候该改仓库，什么时候才该改 `~/.codex`
4. 新规则该落到哪里

### 5.3 导航互链

为避免新增页面变成“孤岛文档”，需要同步更新：

1. `apps/docs/docs/.vitepress/config.ts`
2. `apps/docs/docs/guide/index.md`
3. `apps/docs/docs/guide/development.md`
4. `apps/docs/docs/guide/agents-scope.md`

### 5.4 用户纠正规则落盘

本次新增一条全仓规则：

> 当用户纠正了目标仓库 / 目标目录 / 目标作用域后，先校验当前工作目录与改动范围；不要继续修改 `~/.codex` 或其他无关仓库。

这条规则属于全仓协作规范，因此写入根 `AGENTS.md`。

## 6. 验收口径

满足以下条件即可视为完成：

1. 根 `AGENTS.md` 清晰表达“全局角色配置 vs 仓库项目知识”的边界
2. 文档站出现新的 Agent / Harness 指南入口
3. `development` 与 `agents-scope` 页面均已链接到新指南
4. `apps/docs` 导航与总览页同步更新，无孤立页面
5. `pnpm -C apps/docs lint`
6. `pnpm -C apps/docs typecheck`
7. `pnpm -C apps/docs build`

## 7. 风险与控制

1. 风险：根 `AGENTS.md` 重写后遗漏旧规则  
   控制：保留既有边界与协作规则，只重构结构与表达方式

2. 风险：文档新增后未接入导航  
   控制：同时修改 `guide/index.md` 与 `.vitepress/config.ts`

3. 风险：规则与全局 Codex 配置的边界描述不清  
   控制：在根 `AGENTS.md` 与新指南页都显式写明“不在仓库里重复维护运行时角色”
