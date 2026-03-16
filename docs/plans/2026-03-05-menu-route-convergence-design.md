# 菜单与路由模式收敛设计（不混合）

> 状态：设计稿（待按任务分批落地）
> 范围：`apps/admin`、`packages/core`、`packages/ui`、`apps/docs`
> 决策日期：2026-03-05

## 1. 背景与目标

当前模板支持：

- `menuMode=static|remote`
- remote 下单系统与多系统自动退化
- 顶栏系统切换（当系统数 > 1）

能力完整，但对外暴露概念较多。对于“业务简单、希望别人快速复用”的模板目标，优先级应是：

1. 默认好懂（最小心智负担）
2. 默认好配（最少配置项）
3. 默认可跑（不依赖复杂后端）

## 2. 关键决策

### 2.1 明确不做混合模式（Hard Rule）

不引入“静态 + 远程混合菜单”。

原因：

- 权限边界难解释（哪棵树决定 `allowedPaths`）
- 排障复杂（来源优先级不透明）
- 文档复杂度会显著上升

### 2.2 对外只保留两种推荐模式

1. `static-single`（静态单系统，默认推荐给模板使用者）
2. `remote-single`（远程单系统，保留后端菜单权限）

多系统能力保留为高级扩展，不作为默认文档主路径。

## 3. 对使用者的最小配置面

建议对外文档只讲两个模板：

### A. static-single（最简）

- `menuMode: "static"`
- `defaultSystemCode: "default"`
- `systemHomeMap: { "default": "/home/index" }`
- 菜单来自静态路由 `meta.title`

### B. remote-single（标准）

- `menuMode: "remote"`
- 后端仅返回单系统菜单树（或 adapter 只走 `fetchMenuTree`）
- `defaultSystemCode` 与 `systemHomeMap` 仍固定为单系统

## 4. 静态菜单放置策略（结论）

静态菜单不单独维护 JSON 文件，统一从路由生成。

放置位置：

- `apps/admin/src/modules/**/routes*.ts`
- `apps/admin/src/modules/**/routes/*.ts`

生成入口：

- `apps/admin/src/bootstrap/core.ts`
- `packages/core/src/menu/fromRoutes.ts`

路由即菜单，避免双份配置漂移。

## 5. 路由与菜单契约（收敛口径）

### 5.1 菜单展示契约（静态/远程共用）

- 菜单标题：`meta.title`（静态）或后端 `title`（远程）
- 菜单排序：`meta.order` / `menu.order`
- 菜单图标：`meta.icon` / `menu.icon`
- 缓存建议：`meta.keepAlive`

### 5.2 路由权限契约

- `allowedPaths` 由当前菜单树生成
- 详情页等非菜单路由必须配置 `meta.activePath`
- 特殊本地页可用 `meta.skipMenuAuth=true`（仍需登录）

## 6. 文档策略（对外可读）

文档分两层：

1. 主文档：只讲两种单系统模式、最少配置、最短上手路径
2. 扩展文档：多系统与高级能力，明确“非默认”

## 7. 迁移建议（从当前到收敛）

1. 先补齐“菜单与路由 Schema 文档”
2. 文档主入口只保留 `static-single` 与 `remote-single` 示例
3. 将多系统说明移动到“高级扩展”小节
4. 后续若需要，再做 `preset` 配置封装（代码层）

## 8. 风险与边界

- 不做混合后，部分“本地临时菜单 + 远端权限”场景需要改为 `activePath/skipMenuAuth`
- 若业务后端天然多系统，默认文档仍建议先单系统接入，再升级
