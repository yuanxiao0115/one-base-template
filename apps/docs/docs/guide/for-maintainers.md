---
outline: false
---

# 仓库维护者阅读入口

> 适合人群：仓库维护、规范治理、发布管理、跨模块重构。

## 首先确认

1. [开发规范与维护](/guide/development)
2. [AGENTS 规则分层](/guide/agents-scope)
3. [Agent Harness 与仓库知识](/guide/agent-harness)

## 维护工作主线

1. [目录结构与边界](/guide/architecture)
2. [启动链路细节（深度）](/guide/architecture-runtime-deep-dive)
3. [portal-engine 边界与导出层](/guide/portal/engine-boundary)
4. [Admin Agent 红线](/guide/admin-agent-redlines)
5. [子包发布与版本控制](/guide/package-release)

## 文档治理主线

1. [文档总览](/guide/)
2. [Markdown 技术文档规范](/guide/markdown-doc-style)
3. 变更导航时同步修改 `apps/docs/docs/.vitepress/config.ts`。

## 兼容与下线策略

- 旧链接兼容页（如 `/guide/portal-designer`、`/guide/portal-engine`）仅保留跳转说明，不作为主入口。
- 后续满足“站内零引用 + 一个发布周期观察”后，可执行物理删除。
