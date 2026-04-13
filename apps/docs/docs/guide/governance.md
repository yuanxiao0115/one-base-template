# 维护治理总览

## 适用范围

- 适用于日常开发质量门禁、规则治理、文档协作、子包版本与发布。
- 目标是让“维护治理”入口从“长列表”变成“按任务直达”。

## 四级导航定位

1. 顶部菜单：只定位到治理域（`维护治理`）。
2. 顶部下拉：只保留高频治理入口（最短路径）。
3. 左侧菜单：承载治理域内完整横跳（分组化）。
4. 右侧锚点：只做当前页内定位，不承载跨页导航。

## 常见任务直达

| 任务                       | 首选入口                                                                                 | 补充入口                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 开工前走最小闭环           | [/guide/development](/guide/development)                                                 | [/guide/harness-engineering](/guide/harness-engineering)               |
| 只看组件库测试与覆盖率门禁 | [/guide/testing-coverage-governance](/guide/testing-coverage-governance)                 | [/guide/development](/guide/development)                               |
| 复用 Codex 与 AI 编码方法  | [/guide/codex-ai-coding-playbook](/guide/codex-ai-coding-playbook)                       | [/guide/development](/guide/development)                               |
| 调整或新增 AGENTS 规则     | [/guide/agents-scope](/guide/agents-scope)                                               | [/guide/agent-harness](/guide/agent-harness)                           |
| 发布子包与版本管理         | [/guide/package-release](/guide/package-release)                                         | [/guide/package-version-governance](/guide/package-version-governance) |
| 多业务版本线治理           | [/guide/business-integration-version-matrix](/guide/business-integration-version-matrix) | [/guide/package-version-governance](/guide/package-version-governance) |
| 文档协作与页面改造         | [/guide/tech-doc-collaboration](/guide/tech-doc-collaboration)                           | [/guide/markdown-doc-style](/guide/markdown-doc-style)                 |

## 治理专题地图

### 质量门禁

- [开发规范与维护](/guide/development)
- [Harness 工程化落地](/guide/harness-engineering)
- [测试与覆盖率门禁（组件库）](/guide/testing-coverage-governance)

### 规则治理

- [AGENTS 规则分层](/guide/agents-scope)
- [Agent Harness 与仓库知识](/guide/agent-harness)
- [Admin Agent 红线](/guide/admin-agent-redlines)
- [admin-lite Agent 红线](/guide/admin-lite-agent-redlines)
- [命名白名单（CLI）](/guide/naming-whitelist)

### 发布与版本

- [子包发布与版本控制](/guide/package-release)
- [子包版本治理 SOP（多主线）](/guide/package-version-governance)
- [业务接入版本矩阵与迁移模板](/guide/business-integration-version-matrix)

### 文档与协作

- [Codex 与 AI 编码经验手册](/guide/codex-ai-coding-playbook)
- [技术文档协作与改造](/guide/tech-doc-collaboration)
- [迁移踩坑清单（monorepo-web）](/guide/monorepo-web-migration-pitfalls)
- [Markdown 技术文档规范](/guide/markdown-doc-style)

## 最小执行建议

1. 先按任务进入本页对应分组，不直接在左侧长列表里盲找。
2. 每次只跟一条主线推进，避免同时打开多个治理专题造成上下文切换。
3. 改动规则后，回到 [开发规范与维护](/guide/development) 检查验收命令与落盘要求。
