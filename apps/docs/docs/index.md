---
layout: home
title: one-base-template
titleTemplate: false

hero:
  name: one-base-template
  text: 可拆可切的后台壳模板
  tagline: Vue 3 + Vite 8(beta) + Element Plus + Pinia + Vue Router + pnpm(workspaces) + Turborepo
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 目录结构与边界
      link: /guide/architecture

features:
  - title: Core/UI 解耦
    details: core 只提供逻辑与契约，ui 只做壳与交互，apps 只做组装与样式。
  - title: 静态路由 + 动态菜单
    details: 路由始终静态声明；菜单树决定 allowedPaths，非菜单路由用 meta.activePath 归属权限。
  - title: 多系统菜单
    details: 支持一个项目内多个系统（permissionCode），顶部切系统，侧边栏展示当前系统菜单。
  - title: 菜单 icon(minio id) 持久化缓存
    details: minio 资源 id -> Blob -> objectURL，写入 IndexedDB，刷新不重复拉取。
---

## 你可以用它做什么

- 作为新项目的后台模板：换一个 Adapter（或注入不同后端字段映射）即可跑通登录/菜单/SSO。
- 作为多系统平台壳：一个前端工程承载多个系统菜单，跨系统路由自动切换。
- 作为 UI 壳组件库：把 `packages/ui` 当作可复用壳层，在多个业务 app 中复用。

## 文档与代码同步

本仓库要求：**功能更新后，文档也要同步更新**（见“开发规范与维护”）。

