---
outline: false
---

# 仓库维护者阅读入口（执行版）

<div class="doc-tldr">
  <strong>TL;DR：</strong>维护者先做“规则边界确认”，再做“架构链路巡检”，最后做“验证与文档同步”；按本页顺序可降低跨模块改动风险。
</div>

## 适用范围

- 适合人群：仓库维护、规范治理、发布管理、跨模块重构
- 适用目标：在不中断主线的前提下完成规则与实现同步
- 推荐先看：[按水平进入（P2 / P4 / P6）](/guide/levels/)

## 1. 首先确认（先做风险收口）

1. [开发规范与维护](/guide/development)
2. [AGENTS 规则分层](/guide/agents-scope)
3. [Agent Harness 与仓库知识](/guide/agent-harness)
4. [admin-lite 后台基座](/guide/admin-lite-base-app)

## 2. 维护工作主线（按顺序执行）

1. [目录结构与边界](/guide/architecture)
2. [启动链路细节（深度）](/guide/architecture-runtime-deep-dive)
3. [admin-lite Agent 红线](/guide/admin-lite-agent-redlines)
4. [portal-engine 边界与导出层](/guide/portal/engine-boundary)
5. [Admin Agent 红线](/guide/admin-agent-redlines)
6. [子包发布与版本控制](/guide/package-release)
7. [子包版本治理 SOP（多主线）](/guide/package-version-governance)
8. [业务接入版本矩阵与迁移模板](/guide/business-integration-version-matrix)

## 3. 文档治理主线（必须执行）

1. [文档总览](/guide/)
2. [技术文档协作与改造手册](/guide/tech-doc-collaboration)
3. [Markdown 技术文档规范](/guide/markdown-doc-style)
4. 变更导航时同步修改 `apps/docs/docs/.vitepress/config.ts`

## 4. 最小维护闭环（可直接照做）

### 4.1 操作步骤

1. 确认目标作用域和规则文件（根 `AGENTS.md` + 子目录 `AGENTS.md`）
2. 实施代码或文档改动
3. 同步更新 `apps/docs` 对应页面
4. 回写 `.codex` 过程证据（operations/testing/verification）

### 4.2 验证命令

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

通过标准：

1. 仓库校验命令通过。
2. docs lint/build 通过。
3. 文档与代码行为一致。

## 5. 常见问题

| 问题                   | 原因                 | 处理方式                                            |
| ---------------------- | -------------------- | --------------------------------------------------- |
| 规则改了但执行不一致   | 规则只写在会话没落盘 | 同步写入 `AGENTS.md` 与 docs 页面                   |
| 文档入口找不到新增页面 | 只改内容没改导航     | 同步更新 `config.ts` 与 `guide/index.md`            |
| 维护改动影响范围过大   | 未先做目录边界核对   | 回到 [目录结构与边界](/guide/architecture) 收敛改动 |
