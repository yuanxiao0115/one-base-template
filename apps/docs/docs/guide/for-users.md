---
outline: [2, 3]
---

# 框架使用者阅读入口（执行版）

## TL;DR

- 业务开发场景下，建议先走分层主线，再用本页做任务索引。
- 默认顺序：`先选 P2/P4 -> 再按任务进入专题页 -> 最后跑验证命令`。
- 本页是“角色辅助入口”，不是主入口。

## 适用范围

- 适合：业务开发、模块接入、页面改造、能力扩展。
- 目标：在 30-60 分钟内完成一次最小开发闭环并通过验证。
- 推荐先读：[按水平进入（P2 / P4 / P6）](/guide/levels/)。

## 前置条件

1. 已明确当前层级（P2 或 P4）。
2. 本地可执行 `pnpm` 命令。
3. 已准备好目标应用（`apps/admin` 或 `apps/admin-lite`）。

## 入口使用规则（先层级、后角色）

1. 先进入 [P2 路线（上手）](/guide/levels/p2) 或 [P4 路线（独立开发）](/guide/levels/p4)。
2. 在层级页完成“最短执行路径”后，再回本页按任务跳转。
3. 如果你还没开始写代码，不要先读维护治理页面。

## 任务索引（按你要做的事进入）

| 任务                       | 优先阅读                                           | 补充阅读                                                                                 |
| -------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 启动项目并跑通首轮闭环     | [快速开始](/guide/quick-start)                     | [环境变量](/guide/env)                                                                   |
| 新增或改造模块             | [模块系统与切割](/guide/module-system)             | [admin-lite 后台基座](/guide/admin-lite-base-app)                                        |
| 改路由与权限               | [菜单与路由规范（Schema）](/guide/menu-route-spec) | [布局与菜单](/guide/layout-menu)                                                         |
| 做列表与 CRUD              | [CRUD 开发规范](/guide/crud-module-best-practice)  | [内置组件（Ob 系列）](/guide/built-in-components)                                        |
| 扩展能力（门户/表单/适配） | [门户体系总览](/guide/portal/)                     | [公文表单设计引擎](/guide/document-form-designer)、[basic Adapter](/guide/adapter-basic) |

## 最短开发闭环（可直接照做）

### 1. 操作步骤

1. 可选：创建新后台项目：`pnpm new:app my-admin`（如需管理模块再加 `--with-admin-management --with-log-management --with-system-management`）。
2. 启动目标应用：`pnpm dev` 或 `pnpm dev:admin-lite`。
3. 生成模块骨架（建议先 dry-run）：`pnpm -C apps/admin-lite new:module user-center --dry-run`。
4. 生成子业务骨架：`pnpm -C apps/admin-lite new:module:item user --module user-center --dry-run`。
5. 按模块文档完成 `index.ts（moduleMeta） + routes.ts`。
6. 在 `platform-config.ts` 确认 `enabledModules` 已包含目标模块。

### 2. 验证命令

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/admin build
pnpm -C apps/docs build
```

如果改的是 `admin-lite`，将命令中的 `apps/admin` 替换为 `apps/admin-lite`。

## 验证与验收

通过标准：

1. 目标应用 `typecheck/lint/build` 通过。
2. 模块可访问且菜单/路由行为正确。
3. 若改了 docs，`apps/docs build` 通过。

## FAQ

### 我能只看角色入口，不看分层页吗？

不建议。分层页定义主线与验证基线，角色页只负责任务分流。

### 刚接手项目该选 P2 还是 P4？

只要你还不能独立完成“模块新增 + 验证通过”，先选 P2。

### 我只改了一个小点，还要跑完整验证吗？

至少跑目标应用的 `typecheck + lint + build`；改了文档再补跑 `apps/docs build`。

## 相关阅读

- [按水平进入（P2 / P4 / P6）](/guide/levels/)
- [P2 路线（上手）](/guide/levels/p2)
- [P4 路线（独立开发）](/guide/levels/p4)
- [仓库维护者阅读入口](/guide/for-maintainers)
