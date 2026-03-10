---
layout: home
title: one-base-template
titleTemplate: false

hero:
  name: one-base-template
  text: 清晰可扩展的后台模板文档
  tagline: 覆盖 admin / portal / template / packages 的架构、模块与协作规范
  actions:
    - theme: brand
      text: 开始阅读
      link: /guide/
    - theme: alt
      text: 5 分钟上手
      link: /guide/quick-start

features:
  - title: 信息架构清晰
    details: 导航与侧边栏按任务流组织，快速定位到“我现在该做什么”。
  - title: 代码与文档同源
    details: 所有关键路径、命令和边界说明都对齐当前仓库实现。
  - title: 架构与实现并重
    details: 不只讲概念，同时给出可复制的落地路径与文件位置。
  - title: 支持多应用场景
    details: 同时覆盖 admin、portal、template 以及跨包协作模式。
  - title: 扩展能力可追踪
    details: 门户设计器、portal-engine、adapter 接入都有独立入口。
  - title: 协作流程可落盘
    details: 约束、计划、验证与复盘记录在仓库内形成闭环。
---

## 推荐阅读路径

<div class="doc-quick-grid">
  <a class="doc-quick-card" href="/guide/quick-start">
    <h3>新成员先看</h3>
    <p>按快速开始与环境变量完成本地启动，再进入架构页理解全局边界。</p>
  </a>
  <a class="doc-quick-card" href="/guide/module-system">
    <h3>要开发功能</h3>
    <p>先确认模块切割与路由装配规则，再查看 CRUD 与页面容器实践。</p>
  </a>
  <a class="doc-quick-card" href="/guide/portal-designer">
    <h3>要做门户能力</h3>
    <p>先读门户设计器，再看 portal-engine 的职责边界与可复用入口。</p>
  </a>
  <a class="doc-quick-card" href="/guide/development">
    <h3>要提测交付</h3>
    <p>按照开发规范执行 lint/typecheck/build，并同步文档与 .codex 记录。</p>
  </a>
  <a class="doc-quick-card" href="/guide/markdown-doc-style">
    <h3>要写技术文档</h3>
    <p>按统一 Markdown 规范组织结构、示例和验收标准，减少返工与歧义。</p>
  </a>
</div>

## 文档覆盖范围

- **应用层**：`apps/admin`、`apps/portal`、`apps/template` 的启动、路由、菜单与业务模块实践。
- **基础包层**：`packages/core`、`packages/ui`、`packages/tag`、`packages/portal-engine`、`packages/adapters`、`packages/utils`。
- **协作层**：AGENTS 规则分层、验证口径、变更落盘位置与发布流程。

## 维护原则

1. 文档中的路径、命令、接口约定必须与当前仓库一致。
2. 当实现发生变化时，同步更新导航入口与对应文档页面。
3. 完成改动前至少执行 `pnpm -C apps/docs lint` 与 `pnpm -C apps/docs build`。
