# docs 技术文档改造计划（Batch 3）

> 日期：2026-04-03  
> 作用域：`apps/docs/docs/guide/**`（角色入口 + 能力规范 + 样式规范）

## 背景

在前两批改造后，`apps/docs` 已完成核心入口与高频技术页收口。当前剩余痛点集中在：

1. 角色入口页偏“索引式”，缺少可执行闭环。
2. `iconfont`、`naming-whitelist`、`button-styles` 仍存在“描述多、执行步骤少”的问题。
3. 部分规范页缺少统一验收命令与失败处理。

## 目标

1. 让角色入口页支持“拿来即执行”。
2. 让专项规范页支持“拿来即验证”。
3. 保持页面结构一致：`TL;DR -> 适用范围 -> 步骤 -> 验证 -> FAQ`。

## 范围

### In Scope

- `apps/docs/docs/guide/for-users.md`
- `apps/docs/docs/guide/for-maintainers.md`
- `apps/docs/docs/guide/iconfont.md`
- `apps/docs/docs/guide/naming-whitelist.md`
- `apps/docs/docs/guide/button-styles.md`

### Out of Scope

- 全量改造剩余所有 guide 页面。
- 修改业务运行时代码。
- 变更 docs 导航结构（本轮以内容改造为主）。

## 实施顺序

1. 先改角色入口页（用户/维护者）。
2. 再改专项能力页（iconfont / naming-whitelist）。
3. 最后改样式规范页（button-styles，保留 demo 组件）。
4. 统一回归 `apps/docs` 构建与 lint。

## 验收口径

在仓库根目录执行：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

通过标准：

1. 命令全部成功。
2. 目标页面具备统一结构。
3. 页面内容与当前代码路径保持一致。
