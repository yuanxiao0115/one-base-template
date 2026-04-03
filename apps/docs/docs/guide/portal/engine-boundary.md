---
outline: [2, 3]
---

# portal-engine 边界与导出层

## TL;DR

- `portal-engine` 是跨应用共享引擎，不是 admin 的子模块。
- 对外导出分三层：`root`、`designer`、`internal`，默认优先使用 `designer`。
- 只要改动具备跨端复用价值，应优先下沉 `portal-engine`，不要留在 `apps/admin`。

## 适用范围

- 适用于：`packages/portal-engine/**` 的能力设计、导出、重构与治理。
- 适用于：门户设计器/渲染器/物料/工作台协议相关改造。
- 不适用于：仅 admin 页面拼装问题（请走 [PortalManagement 管理端接入](/guide/portal/admin-designer)）。

## 前置条件

1. 已确认当前需求是否会被 `apps/admin` 与 `apps/portal` 复用。
2. 已阅读 [门户体系（Portal）总览](/guide/portal/) 明确三层职责。
3. 已能运行 `packages/portal-engine` 与目标应用的基础校验命令。

## 导出层职责

| 入口                                        | 作用                                        | 使用建议               |
| ------------------------------------------- | ------------------------------------------- | ---------------------- |
| `@one-base-template/portal-engine`          | 稳定通用能力（schema/runtime/material API） | 通用能力默认从这里拿   |
| `@one-base-template/portal-engine/designer` | 语义化设计器入口（组件 + composable）       | admin 页面默认入口     |
| `@one-base-template/portal-engine/internal` | 实现语义与底层编排控制器                    | 仅在标准入口不足时使用 |

## 分层边界（必须遵守）

| 层级                     | 负责                                        | 禁止             |
| ------------------------ | ------------------------------------------- | ---------------- |
| `packages/portal-engine` | 编辑器、渲染器、物料体系、工作台编排 helper | 依赖 `apps/*`    |
| `apps/admin`             | 路由组织、能力注入、页面拼装                | 复制引擎内部实现 |
| `apps/portal`            | 前台消费与渲染分流                          | 维护平行渲染引擎 |

## 变更决策流程（先判断改哪里）

1. 先问：这段逻辑是否会在 `apps/admin` 与 `apps/portal` 复用？
2. 若会复用：优先改 `portal-engine`，再从导出层给应用消费。
3. 若只影响单页组装：保留在应用层，不强行下沉。
4. 任何下沉改造都要补“导出层契约 + 回归命令”。

## 变更准入清单

满足任一条件，优先改 `portal-engine`：

1. 属于工作台通用编排（路由解析、preview bridge、tab 树算法）。
2. 属于物料体系公共协议（schema、组件 key、fallback alias）。
3. 属于渲染与设计共用能力（组件、hook、payload 规范）。

否则优先留在应用层，避免过度抽象。

## 最小改造闭环

1. 在 `packages/portal-engine/src` 确认改动边界（`editor` / `renderer` / `materials` / `workbench` / `registry` / `schema`）。
2. 通过 `root` 或 `designer` 导出层暴露能力，避免应用直接依赖内部目录。
3. 在 `apps/admin` / `apps/portal` 侧验证调用链无破坏。
4. 同步 docs 页面，说明新边界与验收口径。

## 验证与验收

在仓库根目录执行：

```bash
pnpm -C packages/portal-engine run verify:materials
pnpm -C packages/portal-engine run test:run
pnpm -C packages/portal-engine typecheck
pnpm -C apps/admin typecheck
pnpm -C apps/portal typecheck
pnpm -C apps/docs build
```

通过标准：

1. `portal-engine` 物料校验、测试、类型检查通过。
2. `admin` 与 `portal` 至少 typecheck 通过。
3. docs 构建通过且边界说明可检索。

## FAQ

### 为什么不建议业务页面直接走 `internal`？

`internal` 语义不稳定，直接依赖会把引擎内部重构风险外溢到业务页面。

### 我不确定该下沉还是留在应用层，怎么选？

优先按“是否跨端复用”判断；跨端复用走 engine，单端编排留在应用层。

### 下沉改造一定要一次改完吗？

不需要。先完成最小可运行闭环，再分批收口剩余调用点。

## 相关阅读

- [门户体系（Portal）总览](/guide/portal/)
- [PortalManagement 管理端接入](/guide/portal/admin-designer)
- [门户物料扩展与注册](/guide/portal/material-extension)
