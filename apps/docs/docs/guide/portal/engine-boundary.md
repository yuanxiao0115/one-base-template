# portal-engine 边界与导出层

> 适用范围：`packages/portal-engine/**`

## TL;DR

- `portal-engine` 是共享引擎，不是 admin 子模块。
- 对外导出分三层：`root`、`designer`、`internal`。
- 业务页面默认走 `designer`，`internal` 只给高级编排场景。

## 导出层职责

| 入口                                        | 作用                                        | 使用建议               |
| ------------------------------------------- | ------------------------------------------- | ---------------------- |
| `@one-base-template/portal-engine`          | 稳定通用能力（schema/runtime/material API） | 基础能力默认从这里拿   |
| `@one-base-template/portal-engine/designer` | 语义化设计器入口（组件 + composable）       | admin 页面默认入口     |
| `@one-base-template/portal-engine/internal` | 实现语义与底层编排控制器                    | 仅在标准入口不足时使用 |

## 分层边界

- `packages/portal-engine`
  - 负责：编辑器、渲染器、物料体系、路由编排 helper。
  - 禁止：依赖 `apps/*`。
- `apps/admin`
  - 负责：路由组织、能力注入、业务页面拼装。
  - 禁止：复制引擎内部实现。
- `apps/portal`
  - 负责：前台消费与分流。
  - 禁止：维护一套平行渲染引擎。

## 目录职责（简版）

```text
packages/portal-engine/src/
  editor/      # 设计器能力
  renderer/    # 预览/运行态渲染
  workbench/   # 路由与页面编排控制器
  materials/   # 物料组件与加载
  registry/    # 注册表与扩展机制
  schema/      # 协议类型
```

## 变更准入清单

满足任一条件，优先改 `portal-engine` 而不是 admin：

1. 逻辑可能被 `apps/admin` 与 `apps/portal` 复用。
2. 属于工作台通用编排（路由解析、preview bridge、tab 树算法）。
3. 属于物料体系公共协议（schema、组件 key、fallback alias）。

## 验证命令

```bash
pnpm -C packages/portal-engine run verify:materials
pnpm -C packages/portal-engine run test:run
pnpm -C packages/portal-engine typecheck
pnpm -C apps/admin typecheck
pnpm -C apps/portal typecheck
pnpm -C apps/docs build
```
