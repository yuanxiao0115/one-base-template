# 菜单与路由规范（含 Schema）

> 适用范围：`apps/admin` + `apps/admin-lite` + `packages/core` + `packages/adapters` + `packages/ui`  
> 目标：给后台基座使用者一份“能直接照做”的菜单/路由规范，降低理解与配置成本。

## 1. 推荐模式（不混合）

本模板明确不推荐“静态 + 远程混合菜单”。对外只推荐两种模式：

1. `static-single`：静态菜单 + 单系统（最简，优先）
2. `remote-single`：远程菜单 + 单系统（需要后端权限树）

## 2. 菜单从哪里来

### 2.1 static-single

静态菜单**不单独维护 JSON**，直接从路由生成。

- 路由放置：`apps/admin/src/modules/**/routes*.ts`、`apps/admin/src/modules/**/routes/*.ts`
- 菜单生成：`createStaticMenusFromRoutes(...)`
- 关键字段：`meta.title`、`meta.order`、`meta.icon`、`meta.keepAlive`

换句话说：**路由即菜单源**，避免两份配置漂移。

### 2.2 remote-single

菜单来自 adapter 的远端接口：

- 优先：`menu.fetchMenuTree()`
- 远端返回结构映射到 `AppMenuItem[]`
- 前端路由仍保持静态声明，菜单只负责显示与权限

## 3. 最小配置示例

### 3.1 static-single（最简模式）

```json
{
  "preset": "static-single"
}
```

### 3.2 remote-single（admin / admin-lite 默认）

```json
{
  "preset": "remote-single",
  "backend": "basic",
  "appsource": "frame",
  "defaultSystemCode": "admin_server",
  "systemHomeMap": {
    "admin_server": "/home/index"
  }
}
```

## 4. 平台配置 Schema（RuntimeConfig）

以下为当前实现可用的 JSON Schema（与 `parseRuntimeConfig` 对齐）：

- `apps/admin` / `apps/admin-lite` 在各自 `src/config/platform-config.ts` 内维护同结构对象；
- `apps/portal` 仍通过 `public/platform-config.json` 维护运行时配置。

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://one-base-template/schema/runtime-config.schema.json",
  "title": "RuntimeConfig",
  "type": "object",
  "additionalProperties": true,
  "oneOf": [
    {
      "required": ["preset"]
    },
    {
      "required": [
        "backend",
        "authMode",
        "tokenKey",
        "idTokenKey",
        "menuMode",
        "enabledModules",
        "authorizationType",
        "appsource",
        "appcode",
        "systemHomeMap"
      ],
      "not": {
        "required": ["preset"]
      }
    }
  ],
  "properties": {
    "preset": {
      "type": "string",
      "enum": ["static-single", "remote-single"]
    },
    "backend": {
      "type": "string",
      "enum": ["default", "basic"]
    },
    "authMode": {
      "type": "string",
      "enum": ["cookie", "token", "mixed"]
    },
    "tokenKey": {
      "type": "string",
      "minLength": 1
    },
    "idTokenKey": {
      "type": "string",
      "minLength": 1
    },
    "menuMode": {
      "type": "string",
      "enum": ["remote", "static"]
    },
    "enabledModules": {
      "oneOf": [
        { "const": "*" },
        {
          "type": "array",
          "items": { "type": "string", "minLength": 1 },
          "uniqueItems": true
        }
      ]
    },
    "authorizationType": {
      "type": "string",
      "minLength": 1
    },
    "appsource": {
      "type": "string",
      "minLength": 1
    },
    "appcode": {
      "type": "string",
      "minLength": 1
    },
    "clientSignatureSalt": {
      "type": "string"
    },
    "clientSignatureClientId": {
      "type": "string"
    },
    "storageNamespace": {
      "type": "string"
    },
    "defaultSystemCode": {
      "type": "string"
    },
    "systemHomeMap": {
      "type": "object",
      "propertyNames": {
        "type": "string",
        "minLength": 1
      },
      "additionalProperties": {
        "type": "string",
        "pattern": "^/"
      }
    }
  }
}
```

补充说明：

- 当配置 `preset` 时，可省略大部分字段，解析器会自动补全默认值。
- `preset` 模式下仍会执行额外运行时校验（例如单系统约束、`menuMode` 冲突）。
- 解析器当前不会拦截未知字段（向前兼容），因此 Schema 采用 `additionalProperties: true`。

## 5. 路由 Meta Schema（菜单与权限相关）

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://one-base-template/schema/route-meta-menu.schema.json",
  "title": "RouteMetaForMenuAndGuard",
  "type": "object",
  "additionalProperties": true,
  "properties": {
    "title": { "type": "string", "minLength": 1 },
    "icon": { "type": "string" },
    "order": { "type": "number" },
    "keepAlive": { "type": "boolean" },
    "access": {
      "type": "string",
      "enum": ["open", "auth", "menu"]
    },
    "hideInMenu": { "type": "boolean" },
    "activePath": {
      "type": "string",
      "pattern": "^/"
    },
    "hiddenTab": { "type": "boolean" },
    "noTag": { "type": "boolean" },
    "fullScreen": { "type": "boolean" }
  }
}
```

### 5.1 Meta 收敛写法（强制）

模块路由禁止继续散写 `meta: { ... }`，统一使用 `apps/admin/src/router/meta.ts` 导出的 helper：

- `defineRouteMeta(...)`
- `createOpenRouteMeta(...)`
- `createAuthRouteMeta(...)`
- `createFullscreenAuthRouteMeta(...)`

对应源码门禁见：`apps/admin/tests/architecture/route-meta-helper-source.unit.test.ts`。

## 6. 菜单数据 Schema（AppMenuItem）

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://one-base-template/schema/app-menu-item.schema.json",
  "title": "AppMenuItem",
  "type": "object",
  "additionalProperties": false,
  "required": ["path", "title"],
  "properties": {
    "path": { "type": "string", "minLength": 1 },
    "title": { "type": "string", "minLength": 1 },
    "icon": { "type": "string" },
    "external": { "type": "boolean" },
    "keepAlive": { "type": "boolean" },
    "order": { "type": "number" },
    "children": {
      "type": "array",
      "items": {
        "$ref": "https://one-base-template/schema/app-menu-item.schema.json"
      }
    }
  }
}
```

## 7. 模块路由清单 Schema（module.ts）

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://one-base-template/schema/admin-module-manifest.schema.json",
  "title": "AdminModuleManifest",
  "type": "object",
  "additionalProperties": false,
  "required": ["id", "version", "moduleTier", "enabledByDefault", "routes", "apiNamespace"],
  "properties": {
    "id": { "type": "string", "minLength": 1 },
    "version": { "const": "1" },
    "moduleTier": { "type": "string", "enum": ["core", "optional"] },
    "enabledByDefault": { "type": "boolean" },
    "apiNamespace": { "type": "string", "minLength": 1 },
    "routes": {
      "type": "object",
      "required": ["layout"],
      "properties": {
        "layout": { "type": "array" },
        "standalone": { "type": "array" }
      },
      "additionalProperties": false
    },
    "compat": {
      "type": "object",
      "properties": {
        "routeAliases": { "type": "array" },
        "activePathMap": {
          "type": "object",
          "additionalProperties": { "type": "string" }
        }
      },
      "additionalProperties": false
    }
  },
  "allOf": [
    {
      "if": {
        "properties": {
          "moduleTier": { "const": "optional" }
        }
      },
      "then": {
        "properties": {
          "enabledByDefault": { "const": false }
        }
      }
    }
  ]
}
```

### 7.1 compat 字段运行语义（装配器真实行为）

- `compat.activePathMap`：作为“缺省 `meta.activePath` 补丁”使用；仅当路由未显式声明 `meta.activePath` 时生效。
- `compat.routeAliases`：会生成历史路径重定向路由（`from -> to`），用于老菜单路径兼容。
- 冲突策略：
  - `activePathMap` 与路由 `meta.activePath` 冲突时，保留路由声明值并告警。
  - `routeAliases.from` 与保留路径或已装配路径冲突时，跳过该 alias 并告警。
- 别名路由默认附带：`meta.hideInMenu=true`、`meta.hiddenTab=true`，避免污染菜单与标签页。

### 7.2 路由装配输入边界（升级友好）

装配层（`apps/admin/src/router/assemble-routes.ts`）不再读取运行时环境；  
运行时参数统一由 `apps/admin/src/bootstrap/index.ts` 显式注入，最小参数为：

- `enabledModules`
- `defaultSystemCode`
- `systemHomeMap`
- `storageNamespace`

该边界可保证：后续子项目可复用同一装配器，只需在自身 bootstrap 提供参数，不与业务模块耦合。

## 8. 权限与跳转规则（必须理解）

1. 路由始终静态声明，不依赖动态 `addRoute`
2. 菜单树 path 集合 = `allowedPaths`
3. 未声明 `meta.access` 时默认按 `menu` 处理
4. 非菜单页（详情/编辑）用 `meta.activePath` 归属菜单
5. 不依赖菜单但仍需登录的页面使用 `meta.access='auth'`
6. 匿名可访问页面使用 `meta.access='open'`

## 9. 常见误区

1. 误区：静态菜单要单独写一份菜单 JSON  
   结论：不需要，静态菜单默认从路由生成。

2. 误区：想让简单项目也支持动静态混合  
   结论：不建议，复杂度和排障成本会明显上升。

3. 误区：单系统还保留多系统心智  
   结论：`defaultSystemCode + systemHomeMap` 固定单值即可，系统切换 UI 会自动隐藏。

## 10. 落地检查清单

1. `apps/admin/src/config/platform-config.ts` 的 `preset`（或 `menuMode`）与目标模式一致
2. 模块页面路由都在 `modules/**/routes*` 下
3. 路由 `meta` 使用 `@/router/meta` helper，不再直接写 `meta: {}`
4. 需要进菜单的页面都配置了 `meta.title`
5. 详情/编辑页都配置了 `meta.activePath`
6. 生成并校验路由策略清单：`pnpm check:admin:route-policy`（产物：`.codex/route-policy/admin-route-policy.json`）
7. 最小鉴权链路回归：`pnpm test:e2e:minimal-auth`
8. 文档验证通过：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
