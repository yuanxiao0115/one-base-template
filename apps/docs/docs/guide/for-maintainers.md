---
outline: [2, 3]
---

# 仓库维护者阅读入口（执行版）

## TL;DR

- 维护工作同样先走分层主线，默认先看 P6，再回本页按任务分流。
- 执行顺序固定：`规则边界确认 -> 实施改动 -> 验证门禁 -> 文档同步`。
- 本页是维护任务导航，不替代治理主线文档。

## 适用范围

- 适合：仓库维护、规则治理、发布管理、跨模块重构。
- 目标：在不中断主线开发的前提下，完成规范与实现同步。
- 推荐先读：[按水平进入（P2 / P4 / P6）](/guide/levels/) 与 [P6 路线（架构治理）](/guide/levels/p6)。

## 前置条件

1. 已明确目标作用域（根规则 / 子项目规则 / 包级规则）。
2. 能执行仓库验证命令并判断失败影响范围。
3. 知道本次改动是否需要同步 docs 导航或索引。

## 入口使用规则（先层级、后角色）

1. 先读 [P6 路线（架构治理）](/guide/levels/p6) 锁定治理主线。
2. 再回本页选择“架构主线 / 文档主线 / 发布主线”的任务入口。
3. 若是模块实现问题，优先回到 P4 对应专题页，不要强行走治理流程。

## 维护任务索引

| 维护任务               | 优先阅读                                                    | 补充阅读                                                        |
| ---------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| 规则分层与作用域判定   | [AGENTS 规则分层](/guide/agents-scope)                      | [Agent Harness 与仓库知识](/guide/agent-harness)                |
| 架构边界与启动链路巡检 | [目录结构与边界](/guide/architecture)                       | [启动链路细节（深度）](/guide/architecture-runtime-deep-dive)   |
| 管理端红线治理         | [Admin Agent 红线](/guide/admin-agent-redlines)             | [admin-lite Agent 红线](/guide/admin-lite-agent-redlines)       |
| 门户引擎边界治理       | [portal-engine 边界与导出层](/guide/portal/engine-boundary) | [门户体系总览](/guide/portal/)                                  |
| 版本与发布治理         | [子包发布与版本控制](/guide/package-release)                | [子包版本治理 SOP（多主线）](/guide/package-version-governance) |
| 文档治理与协作评审     | [技术文档协作与改造](/guide/tech-doc-collaboration)         | [Markdown 技术文档规范](/guide/markdown-doc-style)              |

## 最小维护闭环（可直接照做）

### 1. 操作步骤

1. 确认规则作用域与对应文件（根 `AGENTS.md` + 子目录 `AGENTS.md`）。
2. 实施代码或文档改动（必要时先落计划文档到 `docs/plans`）。
3. 若改了功能或规则，同步更新 `apps/docs` 对应页面。
4. 回写 `.codex` 证据：`operations-log/testing/verification`。

### 2. 验证命令

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

## 验证与验收

通过标准：

1. 关键仓库校验命令通过，或失败项有明确“非阻断 + 后续计划”。
2. docs lint/build 通过，且入口可达。
3. 规则、代码、文档三者口径一致。

## FAQ

### 规则改了但团队执行不一致，先改哪？

先把主版本规则写入正确作用域的 `AGENTS.md`，再同步 docs 页面，避免口头约定漂移。

### 文档新增了页面，但入口找不到怎么办？

检查是否同步修改了 `apps/docs/docs/.vitepress/config.ts` 与 `guide/index.md` 对应入口。

### 维护改动范围越来越大怎么办？

回到 [目录结构与边界](/guide/architecture) 收敛影响面，再分批改造，不要一次性全量推进。

## 相关阅读

- [按水平进入（P2 / P4 / P6）](/guide/levels/)
- [P6 路线（架构治理）](/guide/levels/p6)
- [框架使用者阅读入口](/guide/for-users)
