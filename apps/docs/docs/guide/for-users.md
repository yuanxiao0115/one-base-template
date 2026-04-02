---
outline: false
---

# 框架使用者阅读入口

> 适合人群：业务开发、模块接入、页面开发、能力扩展。

## 5 分钟阅读路径

1. [快速开始](/guide/quick-start)：先跑起来。
2. [环境变量](/guide/env)：确认配置入口。
3. [admin-lite 后台基座](/guide/admin-lite-base-app)：先理解后台起项目母版的默认边界。
4. [zfw-system-sfss 快速使用手册](/guide/zfw-system-sfss-quick-start)：按实战项目快速上手。
5. [目录结构与边界](/guide/architecture)：避免跨层误改。

## 开发主线

1. [模块系统与切割](/guide/module-system)
2. [菜单与路由规范（Schema）](/guide/menu-route-spec)
3. [布局与菜单](/guide/layout-menu)
4. [admin-lite Agent 红线](/guide/admin-lite-agent-redlines)
5. [CRUD 模块最佳实践](/guide/crud-module-best-practice)
6. [Admin 老项目迁移工作流](/guide/admin-legacy-migration-workflow)
7. [VXE 表格迁移](/guide/table-vxe-migration)

## 最短开发闭环（可直接照做）

1. 启动项目：`pnpm dev`
2. 生成模块骨架：`pnpm new:module user-center --dry-run`
3. 按 [模块系统与切割](/guide/module-system) 完成 `module.ts（含 moduleMeta） + routes.ts` 调整
4. 在 `apps/admin/src/config/platform-config.ts` 中确认 `enabledModules`
5. 提交前执行：`pnpm lint && pnpm typecheck && pnpm build`

## 扩展能力

- [门户体系总览](/guide/portal/)
- [PortalManagement 管理端接入](/guide/portal/admin-designer)
- [门户物料扩展与注册](/guide/portal/material-extension)
- [basic Adapter](/guide/adapter-basic)

## 你可以暂时跳过

以下内容主要给仓库维护者，首次接入可先不看：

- `AGENTS` 规则分层与 Agent 协作实践
- 发布流程与命名治理
- 仓库级文档治理规范
