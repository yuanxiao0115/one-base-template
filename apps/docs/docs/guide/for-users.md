---
outline: false
---

# 框架使用者阅读入口

> 适合人群：业务开发、模块接入、页面开发、能力扩展。
>
> 推荐先看：[按水平进入（P2 / P4 / P6）](/guide/levels/)

## 5 分钟阅读路径

1. [快速开始](/guide/quick-start)：先跑起来。
2. [环境变量](/guide/env)：确认配置入口。
3. [admin-lite 后台基座](/guide/admin-lite-base-app)：先理解后台起项目母版的默认边界。
4. [目录结构与边界](/guide/architecture)：避免跨层误改。
5. [菜单与路由规范（Schema）](/guide/menu-route-spec)：先建立 route/meta 的统一心智。

## 开发主线

1. [模块系统与切割](/guide/module-system)
2. [菜单与路由规范（Schema）](/guide/menu-route-spec)
3. [布局与菜单](/guide/layout-menu)
4. [admin-lite Agent 红线](/guide/admin-lite-agent-redlines)
5. [CRUD 开发规范](/guide/crud-module-best-practice)
6. [开发规范与维护](/guide/development)

## 最短开发闭环（可直接照做）

1. 起新后台（可选）：`pnpm new:app my-admin --preset standard`
2. 启动项目：`pnpm dev`
3. 生成模块骨架：`pnpm new:module user-center --dry-run`
4. 按 [模块系统与切割](/guide/module-system) 完成 `index.ts（含 moduleMeta） + routes.ts` 调整
5. 在 `apps/admin/src/config/platform-config.ts` 中确认 `enabledModules`
6. 提交前执行：`pnpm lint && pnpm typecheck && pnpm build`

## 扩展能力

- [公文表单设计引擎](/guide/document-form-designer)
- [门户体系总览](/guide/portal/)
- [PortalManagement 管理端接入](/guide/portal/admin-designer)
- [basic Adapter](/guide/adapter-basic)

## 你可以暂时跳过

以下内容主要给仓库维护者，首次接入可先不看：

- `AGENTS` 规则分层与 Agent 协作实践
- 发布流程与命名治理
- 仓库级文档治理规范
