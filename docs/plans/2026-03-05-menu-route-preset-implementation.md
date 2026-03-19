# 菜单路由 Preset 收敛实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不引入混合模式的前提下，提供 `static-single / remote-single` preset，减少使用者配置复杂度。

**Architecture:** 在 `packages/core` 的 `parseRuntimeConfig` 引入 preset 归一化层，先将输入扩展为完整 RuntimeConfig 再复用现有校验；在 `apps/admin` 保持读取链路不变；文档改为“preset 优先 + 详细字段兜底”。

**Tech Stack:** TypeScript、Vitest、VitePress、pnpm monorepo

---

### Task 1: 增加 preset 测试（RED）

**Files:**

- Create: `packages/core/src/config/platform-config.test.ts`

**Step 1: 写失败测试用例**

- 覆盖 `preset=static-single` 最小配置可解析
- 覆盖 `preset=remote-single` 最小配置可解析
- 覆盖 preset 与 `menuMode` 冲突时报错
- 覆盖 preset 单系统约束（`systemHomeMap` 超过 1 个 key 报错）

**Step 2: 运行测试确认失败**

Run: `pnpm -C packages/core test:run packages/core/src/config/platform-config.test.ts`

Expected: 失败（当前尚未实现 preset）

### Task 2: 实现 preset 归一化（GREEN）

**Files:**

- Modify: `packages/core/src/config/platform-config.ts`
- Modify: `packages/core/src/index.ts`

**Step 1: 扩展类型**

- 新增 `MenuRoutePreset = "static-single" | "remote-single"`
- `RuntimeConfig` 增加可选 `preset`

**Step 2: 增加 preset 归一化流程**

- 读取并校验 `preset`
- 构造默认值并与用户输入合并
- 校验 preset 与 `menuMode` 冲突
- 校验 preset 下 `systemHomeMap` 仅允许单系统

**Step 3: 保持兼容**

- 未配置 preset 时，维持当前严格校验行为

**Step 4: 运行测试确认通过**

Run: `pnpm -C packages/core test:run packages/core/src/config/platform-config.test.ts`

Expected: 通过

### Task 3: 同步文档与示例

**Files:**

- Modify: `apps/admin/public/platform-config.json`
- Modify: `apps/docs/docs/guide/env.md`
- Modify: `apps/docs/docs/guide/menu-route-spec.md`

**Step 1: 更新示例配置**

- 示例中添加 `preset` 写法
- 保留完整字段写法作为高级选项

**Step 2: 更新文档说明**

- 说明 preset 是推荐入口
- 明确“不混合”与“双模式”

### Task 4: 验证与收尾

**Files:**

- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

**Step 1: 定向验证**

Run:

- `pnpm -C packages/core test:run packages/core/src/config/platform-config.test.ts`
- `pnpm -C packages/core typecheck`

**Step 2: 文档验证**

Run:

- `pnpm -C apps/docs lint`
- `pnpm -C apps/docs build`

**Step 3: 全仓关键回归**

Run:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
