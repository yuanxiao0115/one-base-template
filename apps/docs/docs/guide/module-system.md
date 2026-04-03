# 模块系统（最终版）

> 本页只保留当前生效方案，不再展示历史迁移过程。

<div class="doc-tldr">
  <strong>先读这一段：</strong>做模块开发先看「1) 模块契约」+「2) 路由装配」+「3) 模块开关」，就能完成大多数场景。
</div>

## 1) 模块契约（固定）

每个模块固定两个入口：`index.ts` 和 `routes.ts`（复杂模块可改为 `routes/index.ts`）。
默认模块脚手架会在 `routes.ts` 预置 `legacyModuleRoutes` 聚合逻辑，自动收集 `./*/router/index.ts` 与 `./*/router.ts`。

### 推荐目录树

```text
apps/admin/src/modules/
├── <module-id>/
│   ├── index.ts
│   ├── routes.ts
│   ├── pages/
│   ├── api.ts
│   ├── types.ts
│   └── components/
└── ...
```

当模块同时存在 layout 路由和 standalone 路由时，推荐改为：

```text
<module-id>/
├── index.ts
└── routes/
    ├── index.ts
    ├── layout.ts
    └── standalone.ts
```

约束：

1. 模块 id 统一使用 kebab-case（例如 `portal-management`）。
2. 模块元信息统一写在 `index.ts` 的 `moduleMeta`，不再单独维护 `manifest.ts`。
3. 简单模块优先 `routes.ts` 单文件；复杂模块再拆 `routes/` 目录。

### 子路由自动注入（推荐）

当模块拆分为多个子路由文件时，`routes.ts` 推荐使用自动收集，避免手工维护 import 列表。

```ts
import { collectGlobRouteModules } from '@one-base-template/core';
import type { RouteRecordRaw } from 'vue-router';

const childRoutes = collectGlobRouteModules(
  import.meta.glob<RouteRecordRaw[]>('./routes/*.ts', {
    eager: true,
    import: 'default'
  })
);
```

当前已在 `admin`、`admin-lite` 的 `LogManagement` 与 `zfw-system-sfss/system-sfss` 中落地。

### moduleMeta 字段（必须理解）

| 字段               | 作用         | 典型值               |
| ------------------ | ------------ | -------------------- |
| `id`               | 模块唯一标识 | `system-management`  |
| `version`          | 模块版本号   | `1`                  |
| `moduleTier`       | 模块层级     | `core` 或 `optional` |
| `enabledByDefault` | 是否默认启用 | `true` 或 `false`    |

补充：`optional` 模块必须显式 `enabledByDefault=false`。

### 模块默认导出（当前约定）

1. `routes.layout` 必填：挂载到 `AdminLayout` 下的业务路由。
2. `routes.standalone` 可选：全屏页、认证入口等顶层路由。
3. `apiNamespace` 推荐填写：便于接口治理和排查。
4. `compat` 可选：历史路径兼容（`activePathMap`、`routeAliases`）。

## 2) 路由装配（最终行为）

装配入口：`apps/admin/src/router/assemble-routes.ts`

执行顺序：

1. 启动阶段读取 `platform-config`（`enabledModules`、`defaultSystemCode`、`systemHomeMap` 等）。
2. `registry` 扫描 `apps/admin/src/modules/**/index.ts`，读取 `moduleMeta`。
3. 按 `enabledModules` 过滤模块并加载默认导出声明。
4. 合并 `routes.layout` 与 `routes.standalone`。
5. 注入固定路由：`/login`、`/sso`、`/403`、`/404` 和 404 兜底。
6. 守卫按 `meta.access` 执行访问控制（`open` / `auth` / `menu`）。

装配关系图：

```text
platform-config
└── enabledModules
    └── registry（扫描 moduleMeta）
        └── assemble-routes
            ├── layout routes
            ├── standalone routes
            └── fixed routes
```

## 3) 模块开关（enabledModules）

配置文件：`apps/admin/src/config/app.ts`

推荐生产配置（白名单）：

```json
{
  "enabledModules": ["home", "admin-management", "log-management", "system-management"]
}
```

全开模式（仅用于联调或临时排查）：

```json
{
  "enabledModules": "*"
}
```

建议：

1. 优先使用白名单，避免把非主链路模块默认带入。
2. `enabledModules` 始终使用 kebab-case 模块 id。

## 4) compat 兼容能力（当前有效）

`compat` 用于历史路径平滑升级，当前有效能力有两项：

1. `activePathMap`：为未声明 `meta.activePath` 的路由补齐激活菜单路径。
2. `routeAliases`：生成历史路径到新路径的 `redirect` 别名路由。

简例：

```ts
compat: {
  activePathMap: {
    '/portal/design': '/portal/setting'
  },
  routeAliases: {
    '/legacy/portal/design': '/portal/design'
  }
}
```

## 5) 新增模块最短路径

1. 在目标子项目生成模块级骨架：`pnpm -C apps/<app-id> new:module <module-id> --title 模块标题`。
2. 在模块目录生成子业务骨架：`pnpm -C apps/<app-id> new:module:item <item-id> --module <module-id>`。
3. 在 `app.ts` 的 `enabledModules` 中加入模块 id（可开关模块按需开启）。
4. 执行验证命令。

示例：

```bash
pnpm -C apps/zfw-system-sfss new:module system-sfss --title "System-sfss"
pnpm -C apps/zfw-system-sfss new:module:item sunshine-petition --module system-sfss
```

建议验证：

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/admin test:run
pnpm -C apps/admin build
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

## 6) 常见问题（短版）

1. 模块没生效：先检查 `enabledModules` 是否包含该模块 id。
2. 页面可访问但菜单不高亮：优先检查 `meta.activePath` 或 `compat.activePathMap`。
3. 路由被跳过：检查是否和已有 path/name 冲突。
4. 非菜单页面被拦截：确认 `meta.access` 是否应为 `auth` 或 `open`。

## 7) 相关阅读

- [菜单与路由规范（Schema）](/guide/menu-route-spec)
- [admin-lite 后台基座](/guide/admin-lite-base-app)
- [开发规范与维护](/guide/development)
