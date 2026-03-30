---
layout: home
title: one-base-template
titleTemplate: false

hero:
  name: one-base-template
  text: 清晰可扩展的后台模板文档
  tagline: 覆盖 admin / admin-lite / portal / packages 的架构、模块与协作规范
  actions:
    - theme: brand
      text: 开始阅读
      link: /guide/
    - theme: alt
      text: 5 分钟上手
      link: /guide/quick-start

features:
  - title: 🚀 信息架构清晰
    details: 导航与侧边栏按任务流组织，快速定位到“我现在该做什么”。
  - title: 🧭 代码与文档同源
    details: 所有关键路径、命令和边界说明都对齐当前仓库实现。
  - title: 🧱 架构与实现并重
    details: 不只讲概念，同时给出可复制的落地路径与文件位置。
  - title: 🧩 支持多应用场景
    details: 同时覆盖 admin、admin-lite、portal 以及跨包协作模式。
  - title: 🔌 扩展能力可追踪
    details: 门户设计器、portal-engine、adapter 接入都有独立入口。
  - title: ✅ 协作流程可落盘
    details: 约束、计划、验证与复盘记录在仓库内形成闭环。
---

## 推荐阅读路径

<div class="doc-quick-grid">
  <a class="doc-quick-card" href="/guide/quick-start">
    <h3>🚀 入门启动</h3>
    <p>先跑通 admin/admin-lite/portal/docs，再进入后续专题。</p>
  </a>
  <a class="doc-quick-card" href="/guide/architecture">
    <h3>🧱 架构与边界</h3>
    <p>先看目录分层、模块切割与路由装配规则，避免返工。</p>
  </a>
  <a class="doc-quick-card" href="/guide/admin-legacy-migration-workflow">
    <h3>🧭 老项目迁移</h3>
    <p>旧 admin 能力迁入模板时，从统一迁移工作流进入最省心。</p>
  </a>
  <a class="doc-quick-card" href="/guide/crud-module-best-practice">
    <h3>🛠️ 开发实践</h3>
    <p>以 CRUD、表格迁移和组件规范形成统一开发范式。</p>
  </a>
  <a class="doc-quick-card" href="/guide/portal/">
    <h3>🔌 扩展能力</h3>
    <p>门户体系、引擎边界、物料扩展与 adapter 接入入口。</p>
  </a>
  <a class="doc-quick-card" href="/guide/development">
    <h3>🧰 维护治理</h3>
    <p>交付前验证、规则分层、发布流程与文档治理。</p>
  </a>
  <a class="doc-quick-card" href="/guide/for-users">
    <h3>👥 角色阅读入口</h3>
    <p>如果你更习惯按角色阅读，可从使用者/维护者入口进入。</p>
  </a>
</div>

## 文档覆盖范围

- **应用层**：`apps/admin`、`apps/admin-lite`、`apps/portal` 的启动、路由、菜单与业务模块实践。
- **基础包层**：`packages/core`、`packages/ui`、`packages/tag`、`packages/portal-engine`、`packages/adapters`、`packages/utils`。
- **协作层**：AGENTS 规则分层、验证口径、变更落盘位置与发布流程。

## 维护原则

1. 文档中的路径、命令、接口约定必须与当前仓库一致。
2. 当实现发生变化时，同步更新导航入口与对应文档页面。
3. 完成改动前至少执行 `pnpm -C apps/docs lint` 与 `pnpm -C apps/docs build`。
