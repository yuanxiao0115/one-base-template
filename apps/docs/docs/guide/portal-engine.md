# portal-engine 能力边界

> 兼容入口页（2026-03-18 起文档已分层到 `guide/portal/*`）

## 推荐入口

- 门户总览：`/guide/portal/`
- 引擎边界（新版）：`/guide/portal/engine-boundary`
- 物料扩展与注册：`/guide/portal/material-extension`
- 管理端接入（消费者视角）：`/guide/portal/admin-designer`

## 快速规则

1. 页面业务默认从 `@one-base-template/portal-engine/designer` 接入。
2. `@one-base-template/portal-engine/internal` 仅用于高级编排。
3. admin 的引擎注入固定走 `PortalManagement/engine/register.ts`。

## 回归验证命令

```bash
pnpm -C packages/portal-engine run verify:materials
pnpm -C packages/portal-engine run test:run
pnpm -C packages/portal-engine typecheck
pnpm -C apps/docs build
```

## 历史说明

本页保留用于兼容旧链接；原有大体量内容已按“总览/管理端/引擎/扩展”拆分到 `guide/portal/*`。
