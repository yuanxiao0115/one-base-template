---
outline: false
---

# 框架使用者阅读入口（执行版）

<div class="doc-tldr">
  <strong>TL;DR：</strong>你是业务开发时，先按“启动 -> 边界 -> 模块 -> 验证”四步走；按本页清单执行，可以在 30-60 分钟内完成一个最小开发闭环。
</div>

## 适用范围

- 适用人群：业务开发、模块接入、页面开发、能力扩展
- 适用目标：快速完成从启动项目到提交前验证的一次闭环
- 推荐先看：[按水平进入（P2 / P4 / P6）](/guide/levels/)

## 1. 5 分钟阅读路径（先建立心智）

1. [快速开始](/guide/quick-start)：先把项目跑起来。
2. [配置模型](/guide/env)：确认配置入口与读取方式。
3. [目录结构与边界](/guide/architecture)：避免跨层误改。
4. [菜单与路由规范（Schema）](/guide/menu-route-spec)：统一 route/meta 认知。
5. [开发规范与维护](/guide/development)：明确提交流程与门禁。

## 2. 开发主线（按顺序执行）

1. [模块系统与切割](/guide/module-system)
2. [菜单与路由规范（Schema）](/guide/menu-route-spec)
3. [布局与菜单](/guide/layout-menu)
4. [CRUD 开发规范](/guide/crud-module-best-practice)
5. [开发规范与维护](/guide/development)

## 3. 最短开发闭环（可直接照做）

### 3.1 操作步骤

1. 可选：起一个新后台项目
   - `pnpm new:app my-admin --preset standard`
2. 启动当前项目
   - `pnpm dev`
3. 生成模块骨架（先 dry-run）
   - `pnpm new:module user-center --dry-run`
4. 按 [模块系统与切割](/guide/module-system) 完成 `index.ts（含 moduleMeta） + routes.ts`
5. 在 `apps/admin/src/config/platform-config.ts` 中确认 `enabledModules`

### 3.2 验证命令

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/admin build
pnpm -C apps/docs build
```

通过标准：

1. admin 类型检查、lint、构建通过。
2. docs 构建通过。

## 4. 扩展能力入口

- [公文表单设计引擎](/guide/document-form-designer)
- [门户体系总览](/guide/portal/)
- [PortalManagement 管理端接入](/guide/portal/admin-designer)
- [basic Adapter](/guide/adapter-basic)

## 5. 你可以暂时跳过

首次接入阶段可先不看以下治理类内容：

- `AGENTS` 规则分层与 Agent 协作实践
- 发布流程与命名治理
- 仓库级文档治理规范

## 6. 常见问题

| 问题                   | 原因                               | 处理方式                                      |
| ---------------------- | ---------------------------------- | --------------------------------------------- |
| 页面能打开但菜单不高亮 | `meta.activePath` 或菜单映射未配齐 | 回看 [菜单与路由规范](/guide/menu-route-spec) |
| 新模块不生效           | 未加入 `enabledModules`            | 检查 `platform-config.ts` 模块开关            |
| 提交前校验太慢         | 一次跑全量命令                     | 先跑当前 app 必要命令，再补全量验证           |
