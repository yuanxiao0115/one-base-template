# Admin Bootstrap 链路压平设计

## 背景

当前 `apps/admin/src/bootstrap` 已完成单启动链路，但仍存在可读性负担：

- `startup.ts -> admin-entry.ts -> index.ts` 有纯中转层。
- `index.ts -> router.ts/guards.ts` 继续跳转到薄包装函数。
- 新同事理解启动链路需要在多个小文件间来回切换。

本轮目标是继续收敛为“主链路最短、职责清楚、可追踪”。

## 目标

- 启动入口链路压短为：`main.ts -> startup.ts -> bootstrapAdminApp()`。
- 删除无业务增益的中转文件，减少跳转。
- 保持现有运行行为不变（路由、鉴权、HTTP、插件安装逻辑不变）。
- 同步规则与文档口径，避免代码与文档漂移。

## 方案对比

### 方案 A（推荐）：删除纯中转 + 内联薄壳函数

改动：

- 删除 `bootstrap/admin-entry.ts`，`startup.ts` 直接导入样式并调用 `bootstrapAdminApp`。
- 删除 `bootstrap/router.ts`，在 `bootstrap/index.ts` 直接创建 router。
- 删除 `bootstrap/guards.ts`，在 `bootstrap/index.ts` 直接调用 `setupRouterGuards()`。

优点：

- 启动主链路最短，阅读成本最低。
- 删除 3 个薄壳文件，目录噪音明显下降。
- 不改变核心职责边界（`http/core/plugins/adapter` 仍保留独立职责）。

风险：

- `bootstrap/index.ts` 会变长，需要通过清晰分段保持可读性。

### 方案 B：仅删除 `admin-entry.ts`

改动：

- 只压缩 `startup.ts -> admin-entry.ts -> index.ts` 这一层。

优点：

- 改动最小，风险最低。

不足：

- `router.ts/guards.ts` 仍是薄中转，认知跳转仍存在。

### 方案 C：激进合并（将 `adapter/http/plugins/core` 也并入 `index.ts`）

优点：

- 文件最少。

不足：

- 职责混杂，`index.ts` 过大，后续维护反而困难。

## 决策

采用 **方案 A**。

理由：

- 兼顾“减少跳转”与“职责清晰”，是当前最优平衡点。
- 与“核心下沉到 core、admin 只做组装”的方向一致。

## 影响文件

代码：

- 修改 `apps/admin/src/bootstrap/startup.ts`
- 修改 `apps/admin/src/bootstrap/index.ts`
- 删除 `apps/admin/src/bootstrap/admin-entry.ts`
- 删除 `apps/admin/src/bootstrap/router.ts`
- 删除 `apps/admin/src/bootstrap/guards.ts`

文档与规则：

- 修改 `apps/admin/AGENTS.md`
- 修改 `apps/docs/docs/guide/architecture.md`
- 修改 `apps/docs/docs/guide/env.md`
- 修改 `apps/docs/docs/guide/theme-system.md`

工作记录：

- 修改 `.codex/operations-log.md`
- 修改 `.codex/testing.md`
- 修改 `.codex/verification.md`

## 验证口径

- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin lint:arch`
- `pnpm -C apps/admin lint`
- `pnpm -C apps/admin test:run`
- `pnpm -C apps/admin build`
- `pnpm -C apps/docs lint`
- `pnpm -C apps/docs build`
