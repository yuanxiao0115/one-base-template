# <Topic> Migration Plan

> 状态：草稿 / 执行中 / 已完成
> 来源仓库：`/Users/haoqiuzhi/code/basic/standard-oa-web-basic`
> 目标范围：`apps/admin/...`

## 1. Goal

- 本次要迁移什么
- 什么不迁移
- 完成后如何验收

## 2. Architecture

- 迁移落点：`packages/adapters / packages/core / packages/ui / apps/admin`
- 是否命中 `*Management` 标准化分支
- 需要遵循的规则源

## 3. Task Breakdown

### Task 1

- 目标：
- 改动文件：
- 立即校验：

### Task 2

- 目标：
- 改动文件：
- 立即校验：

## 4. Verification

- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin lint`
- `pnpm -C apps/admin build`
- `pnpm -C apps/docs lint`
- `pnpm -C apps/docs build`

## 5. Docs Sync

- 需要更新的 `apps/docs/docs/guide/*`
- 需要记录的 `.codex/*`

## 6. Risks

- 当前已知风险
- 触发条件
- 回滚或止损方式
