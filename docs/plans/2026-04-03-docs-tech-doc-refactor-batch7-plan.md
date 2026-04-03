# 2026-04-03 docs 第七批结构化改造计划（table/crud/portal-runtime）

## 1. 背景与目标

- 背景：`table-vxe-migration.md`、`crud-container.md`、`portal/material-extension.md`、`architecture-runtime-deep-dive.md` 已有大量事实信息，但执行入口与验收口径不统一。
- 目标：在不推翻既有内容的前提下，补齐执行型文档骨架，确保“新同学可按文档完成一次最短闭环”。

## 2. 本轮范围

- `apps/docs/docs/guide/table-vxe-migration.md`
- `apps/docs/docs/guide/crud-container.md`
- `apps/docs/docs/guide/portal/material-extension.md`
- `apps/docs/docs/guide/architecture-runtime-deep-dive.md`

## 3. 执行顺序（固定）

1. `brainstorming`：明确目标读者与“最短闭环”验收口径。
2. `technical-doc-collaboration`：按受众优先与问题框架补齐结构空缺。
3. `write-markdown-tech-docs`：统一 Markdown 章节与可执行内容。
4. `vitepress-doc-beauty`：收口 VitePress 文档阅读顺序与页面观感一致性。

## 4. 页面级改造要点

### 4.1 table-vxe-migration

- 新增：`TL;DR`、`适用范围与非范围`、`前置条件`、`最小执行路径`。
- 调整：`常见迁移问题`改为 `FAQ` 命名。
- 补齐：`验证与验收（通过标准）`，明确命令 + 行为通过条件 + 失败处理。

### 4.2 crud-container

- 新增：`TL;DR`、`适用范围与非范围`、`前置条件`、`最小执行路径`。
- 保留现有示例主体，避免大面积重写。
- 补齐：`验证与验收（通过标准）` 与迁移失败排查优先级。

### 4.3 portal/material-extension

- 新增：`TL;DR`、`背景与目标`、`非范围`、`前置条件`。
- 补齐：`验证与验收（通过标准）`（从“只给命令”升级为“命令 + 判定条件”）。
- 新增：FAQ（自动收集未生效、物料不显示、命名不一致）。

### 4.4 architecture-runtime-deep-dive

- 新增：`TL;DR` 与 `最短执行路径（源码走查）`。
- 补齐：`验证与验收（启动链路走查）`，覆盖 admin/admin-lite/portal 三端。
- 新增：FAQ（链路看起来“卡住”、配置来源混淆、菜单边界误用）。

## 5. 验证计划

在仓库根目录执行：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

通过标准：

- lint 无 warning/error。
- VitePress build 成功，无新增断链与 frontmatter 解析错误。

## 6. 记录与提交

- 同步更新：`.codex/operations-log.md`、`.codex/testing.md`、`.codex/verification.md`、`.codex/verification/2026-04-03.md`。
- 提交策略：按本轮文档改造合并为 1 个中文 commit，提交信息包含“docs 第七批结构化改造”。
